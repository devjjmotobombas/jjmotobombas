import { and, desc, eq, gte, inArray, lt, not, sql } from "drizzle-orm";

import { db } from "@/db";
import {
    budgetsTable,
    clientsTable,
    productsTable,
    saleItemsTable,
    salesTable,
} from "@/db/schema";

export interface SaleDashboardParams {
    enterpriseId: string;
    startDate?: Date; // inclusive
    endDate?: Date; // inclusive
}

export interface SaleDashboardResult {
    totalRevenueInCents: number;
    totalSalesCount: number;
    averageTicketInCents: number;
    estimatedGrossMarginInCents: number;
    topProductsByVolume: Array<{ productId: string; name: string; qty: number; totalValueInCents: number }>;
    topProductsByValue: Array<{ productId: string; name: string; qty: number; totalValueInCents: number }>;
    topClients: Array<{ clientId: string; name: string; totalSpentInCents: number; orders: number }>;
    budgetToSaleConversion: { budgetsCount: number; convertedToSales: number; conversionRate: number };
    periodComparison?: { previousPeriodRevenueInCents: number; revenueGrowthRate: number };
    paymentMethods: Array<{ method: string; count: number; totalInCents: number }>;
    salesByCategory: Array<{ category: string; qty: number; totalInCents: number }>;
    revenueByDay: Array<{ date: string; totalInCents: number }>;
}

function buildDateCondition(startDate?: Date, endDate?: Date) {
    const conds: ReturnType<typeof gte>[] = [];
    if (startDate) {
        conds.push(gte(salesTable.createdAT, startDate));
    }
    if (endDate) {
        // add one day to make endDate inclusive until 23:59:59.999
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        conds.push(lteOrEqCreatedAt(end));
    }
    return conds;
}

// drizzle doesn't export lte directly in this file; implement helper using lt + +1ms trick
function lteOrEqCreatedAt(date: Date) {
    // we'll use lt(date + 1ms) to emulate <=
    const d = new Date(date.getTime() + 1);
    return lt(salesTable.createdAT, d);
}

export async function getSaleDashboard({ enterpriseId, startDate, endDate }: SaleDashboardParams): Promise<SaleDashboardResult> {
    // base condition: sales whose client belongs to enterprise OR where sale items product belongs to enterprise
    const dateConds = buildDateCondition(startDate, endDate);

    // We'll restrict clients by enterprise
    // First get clients ids for enterprise (fast index expected). Alternatively we could join budgets/sales by enterpriseId but sales don't have enterpriseId.
    const clients = await db.select({ id: clientsTable.id }).from(clientsTable).where(eq(clientsTable.enterpriseId, enterpriseId));
    const enterpriseClientIds = clients.map((c) => c.id);

    // Because drizzle's query builder is limited for in-array of uuids in select aggregates, we'll use simple where on client id if we have ids

    const baseSalesCond = (extra?: ReturnType<typeof gte>[]) => {
        const arr: ReturnType<typeof gte>[] = [];
        if (enterpriseClientIds.length > 0) {
            arr.push(inArray(salesTable.clientId, enterpriseClientIds));
        }
        if (dateConds.length) arr.push(...dateConds);
        if (extra) arr.push(...extra);
        return arr.length ? and(...arr) : undefined;
    };

    // Run multiple aggregations in parallel using SQL GROUP BY / SUM for performance
    const [revenueRes, marginRes, topByVolume, topByValue, topClientsRes, budgetsRes, paymentRes, categoryRes, dailyRes, prevPeriodRevenue] = await Promise.all([
        // total revenue
        db.select({ revenue: sql`coalesce(sum(${salesTable.total}), 0)` }).from(salesTable).where(baseSalesCond()),

        // estimated gross margin: sum((product_price - purchase_price) * qty)
        db
            .select({ margin: sql`coalesce(sum((${saleItemsTable.productPrice} - ${productsTable.purchasePriceInCents}) * ${saleItemsTable.productQty}), 0)` })
            .from(saleItemsTable)
            .innerJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
            .innerJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
            .where(baseSalesCond()),

        // top products by volume
        db
            .select({ productId: saleItemsTable.productId, qty: sql`coalesce(sum(${saleItemsTable.productQty}),0)`, totalValue: sql`coalesce(sum(${saleItemsTable.productPrice} * ${saleItemsTable.productQty}),0)` })
            .from(saleItemsTable)
            .innerJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
            .where(baseSalesCond())
            .groupBy(saleItemsTable.productId)
            .orderBy(desc(sql`coalesce(sum(${saleItemsTable.productQty}),0)`))
            .limit(20),

        // top products by value
        db
            .select({ productId: saleItemsTable.productId, qty: sql`coalesce(sum(${saleItemsTable.productQty}),0)`, totalValue: sql`coalesce(sum(${saleItemsTable.productPrice} * ${saleItemsTable.productQty}),0)` })
            .from(saleItemsTable)
            .innerJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
            .where(baseSalesCond())
            .groupBy(saleItemsTable.productId)
            .orderBy(desc(sql`coalesce(sum(${saleItemsTable.productPrice} * ${saleItemsTable.productQty}),0)`))
            .limit(20),

        // top clients
        db
            .select({ clientId: salesTable.clientId, totalSpent: sql`coalesce(sum(${salesTable.total}),0)`, orders: sql`count(${salesTable.id})` })
            .from(salesTable)
            .where(baseSalesCond())
            .groupBy(salesTable.clientId)
            .orderBy(desc(sql`coalesce(sum(${salesTable.total}),0)`))
            .limit(20),

        // budgets count
        db.select({ budgetsCount: sql`count(${budgetsTable.id})` }).from(budgetsTable).where(eq(budgetsTable.enterpriseId, enterpriseId)),

        // payment methods
        db
            .select({ method: salesTable.paymentMethod, count: sql`count(${salesTable.id})`, total: sql`coalesce(sum(${salesTable.total}),0)` })
            .from(salesTable)
            .where(baseSalesCond())
            .groupBy(salesTable.paymentMethod)
            .orderBy(desc(sql`coalesce(sum(${salesTable.total}),0)`)),

        // sales by category
        db
            .select({ category: productsTable.category, qty: sql`coalesce(sum(${saleItemsTable.productQty}),0)`, total: sql`coalesce(sum(${saleItemsTable.productPrice} * ${saleItemsTable.productQty}),0)` })
            .from(saleItemsTable)
            .innerJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
            .innerJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
            .where(baseSalesCond())
            .groupBy(productsTable.category)
            .orderBy(desc(sql`coalesce(sum(${saleItemsTable.productQty}),0)`)),

        // revenue by day
        db
            .select({ date: sql`to_char(${salesTable.createdAT}::date, 'YYYY-MM-DD')`, total: sql`coalesce(sum(${salesTable.total}),0)` })
            .from(salesTable)
            .where(baseSalesCond())
            .groupBy(sql`(${salesTable.createdAT}::date)`)
            .orderBy(sql`${salesTable.createdAT}::date`),

        // previous period revenue (if dates provided)
        (async () => {
            if (!startDate || !endDate) return [{ prevRevenue: 0 }];
            const periodMillis = endDate.getTime() - startDate.getTime();
            const prevStart = new Date(startDate.getTime() - periodMillis - 1);
            const prevEnd = new Date(startDate.getTime() - 1);
            const prevDateConds = [gte(salesTable.createdAT, prevStart), lt(salesTable.createdAT, new Date(prevEnd.getTime() + 1))];
            const rows = await db.select({ prevRevenue: sql`coalesce(sum(${salesTable.total}),0)` }).from(salesTable).where(and(...(enterpriseClientIds.length ? [inArray(salesTable.clientId, enterpriseClientIds)] : []), ...prevDateConds));
            return rows;
        })(),
    ]);

    // normalize simple scalar results
    const totalRevenueInCents = Number((revenueRes && revenueRes[0]?.revenue) || 0);
    const estimatedGrossMarginInCents = Number((marginRes && marginRes[0]?.margin) || 0);

    // total sales count
    const totalSalesCount = await db.select({ id: salesTable.id }).from(salesTable).where(baseSalesCond()).then(r => r.length);

    const averageTicketInCents = totalSalesCount > 0 ? Math.round(totalRevenueInCents / totalSalesCount) : 0;

    // estimated gross margin - fallback if itemsAgg numeric else 0
    // (estimatedGrossMarginInCents already computed from marginRes)

    // top products - combine SQL results and fetch names
    const volRows = topByVolume || [];
    const valRows = topByValue || [];
    const productIds = Array.from(new Set([...volRows.map((r) => r.productId), ...valRows.map((r) => r.productId)]));
    const products = productIds.length ? await db.select({ id: productsTable.id, name: productsTable.name }).from(productsTable).where(inArray(productsTable.id, productIds)) : [];

    const topProductsByVolume = volRows.slice(0, 10).map((r) => ({ productId: r.productId, name: products.find((p) => p.id === r.productId)?.name || 'unknown', qty: Number(r.qty || 0), totalValueInCents: Number(r.totalValue || 0) }));
    const topProductsByValue = valRows.slice(0, 10).map((r) => ({ productId: r.productId, name: products.find((p) => p.id === r.productId)?.name || 'unknown', qty: Number(r.qty || 0), totalValueInCents: Number(r.totalValue || 0) }));

    // clients aggregation
    const clientsRows = topClientsRes || [];
    const clientIds = clientsRows.map((r) => r.clientId);
    const clientRows = clientIds.length ? await db.select({ id: clientsTable.id, name: clientsTable.name }).from(clientsTable).where(inArray(clientsTable.id, clientIds)) : [];
    const topClients = clientsRows.slice(0, 10).map((r) => ({ clientId: r.clientId, name: clientRows.find((c) => c.id === r.clientId)?.name || 'unknown', totalSpentInCents: Number(r.totalSpent || 0), orders: Number(r.orders || 0) }));

    // budgets conversion
    const budgetsCount = Number((budgetsRes?.[0]?.budgetsCount) || 0);
    const convertedToSales = await db.select({ converted: sql`count(${salesTable.id})` }).from(salesTable).where(and(...(enterpriseClientIds.length ? [inArray(salesTable.clientId, enterpriseClientIds)] : []), not(eq(salesTable.budgetId, sql`NULL`)), ...(dateConds.length ? dateConds : [])));
    const convertedToSalesCount = Number((convertedToSales?.[0]?.converted) || 0);
    const conversionRate = budgetsCount > 0 ? (convertedToSalesCount / budgetsCount) * 100 : 0;

    // payment methods map
    const paymentRows = paymentRes || [];
    const paymentMethods = paymentRows.map((r) => ({ method: r.method || 'unknown', count: Number(r.count || 0), totalInCents: Number(r.total || 0) }));

    // category map
    const categoryRows = categoryRes || [];
    const salesByCategory = categoryRows.map((r) => ({ category: r.category || 'uncategorized', qty: Number(r.qty || 0), totalInCents: Number(r.total || 0) }));

    // previous period
    const prevRevenue = Number(((Array.isArray(prevPeriodRevenue) ? prevPeriodRevenue[0] : prevPeriodRevenue)?.prevRevenue) || 0);
    const revenueGrowthRate = prevRevenue > 0 ? ((totalRevenueInCents - prevRevenue) / prevRevenue) * 100 : 0;

    const dailyRows = dailyRes || [];
    const revenueByDay = dailyRows.map((r) => ({ date: String(r.date), totalInCents: Number(r.total || 0) }));

    return {
        totalRevenueInCents,
        totalSalesCount,
        averageTicketInCents,
        estimatedGrossMarginInCents,
        topProductsByVolume,
        topProductsByValue,
        topClients,
        budgetToSaleConversion: { budgetsCount, convertedToSales: convertedToSalesCount, conversionRate },
        periodComparison: { previousPeriodRevenueInCents: prevRevenue, revenueGrowthRate },
        paymentMethods,
        salesByCategory,
        revenueByDay,
    };
}
