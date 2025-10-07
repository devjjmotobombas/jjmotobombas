import { and, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import {
    productsTable,
    stockMovements,
} from "@/db/schema";

export interface StockDashboardParams {
    enterpriseId: string;
    startDate?: Date; // inclusive
    endDate?: Date; // inclusive
}

export interface StockDashboardResult {
    totalProductsInStock: number;
    totalStockValueInCents: number;
    averageStockValueInCents: number;
    productsWithLowStock: Array<{ productId: string; name: string; currentStock: number; minStock: number; category: string }>;
    productsWithExcessStock: Array<{ productId: string; name: string; currentStock: number; avgMonthlyMovement: number; category: string }>;
    stockEntriesByPeriod: Array<{ date: string; quantity: number; valueInCents: number }>;
    stockExitsByPeriod: Array<{ date: string; quantity: number; valueInCents: number }>;
    abcAnalysis: Array<{ productId: string; name: string; category: string; totalValueInCents: number; percentage: number; classification: 'A' | 'B' | 'C' }>;
    mostMovedProducts: Array<{ productId: string; name: string; totalMovements: number; entries: number; exits: number; category: string }>;
    averageAcquisitionCost: number;
    stockTurnoverRate: number;
    periodComparison?: { previousPeriodStockValueInCents: number; stockValueGrowthRate: number };
}

function buildDateCondition(startDate?: Date, endDate?: Date) {
    const conds: ReturnType<typeof gte>[] = [];
    if (startDate) {
        conds.push(gte(stockMovements.createdAt, startDate));
    }
    if (endDate) {
        // add one day to make endDate inclusive until 23:59:59.999
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        conds.push(lt(stockMovements.createdAt, new Date(end.getTime() + 1)));
    }
    return conds;
}

export async function getStockDashboard({ enterpriseId, startDate, endDate }: StockDashboardParams): Promise<StockDashboardResult> {
    const dateConds = buildDateCondition(startDate, endDate);

    // Base condition for stock movements
    const baseMovementsCond = (extra?: ReturnType<typeof gte>[]) => {
        const arr: ReturnType<typeof gte>[] = [];
        arr.push(eq(stockMovements.enterpriseId, enterpriseId));
        if (dateConds.length) arr.push(...dateConds);
        if (extra) arr.push(...extra);
        return and(...arr);
    };

    // Run multiple aggregations in parallel
    const [
        stockSummary,
        lowStockProducts,
        excessStockProducts,
        entriesByPeriod,
        exitsByPeriod,
        mostMovedProductsRes,
        abcAnalysisRes,
        prevPeriodStockValue
    ] = await Promise.all([
        // Total stock summary
        db
            .select({
                totalProducts: sql`count(${productsTable.id})`,
                totalStockValue: sql`coalesce(sum(${productsTable.stockValueInCents}), 0)`,
                avgStockValue: sql`coalesce(avg(${productsTable.stockValueInCents}), 0)`,
                totalQuantity: sql`coalesce(sum(${productsTable.quantity_in_stock}), 0)`
            })
            .from(productsTable)
            .where(eq(productsTable.enterpriseId, enterpriseId)),

        // Products with low stock (assuming min stock is 10% of current stock or a fixed value)
        db
            .select({
                productId: productsTable.id,
                name: productsTable.name,
                currentStock: productsTable.quantity_in_stock,
                category: productsTable.category,
                minStock: sql`greatest(${productsTable.quantity_in_stock} * 0.1, 5)`
            })
            .from(productsTable)
            .where(
                and(
                    eq(productsTable.enterpriseId, enterpriseId),
                    sql`${productsTable.quantity_in_stock} <= greatest(${productsTable.quantity_in_stock} * 0.1, 5)`
                )
            )
            .orderBy(desc(productsTable.quantity_in_stock))
            .limit(20),

        // Products with excess stock (high stock vs low movement)
        db
            .select({
                productId: productsTable.id,
                name: productsTable.name,
                currentStock: productsTable.quantity_in_stock,
                category: productsTable.category,
                avgMonthlyMovement: sql`coalesce(
                    (select coalesce(sum(abs(${stockMovements.quantity})), 0) 
                     from ${stockMovements} 
                     where ${stockMovements.productId} = ${productsTable.id} 
                     and ${stockMovements.createdAt} >= current_date - interval '30 days'
                    ) / 30, 0
                )`
            })
            .from(productsTable)
            .where(
                and(
                    eq(productsTable.enterpriseId, enterpriseId),
                    sql`${productsTable.quantity_in_stock} > (
                        select coalesce(sum(abs(${stockMovements.quantity})), 0) 
                        from ${stockMovements} 
                        where ${stockMovements.productId} = ${productsTable.id} 
                        and ${stockMovements.createdAt} >= current_date - interval '30 days'
                    ) * 2`
                )
            )
            .orderBy(desc(productsTable.quantity_in_stock))
            .limit(20),

        // Stock entries by period
        db
            .select({
                date: sql`to_char(${stockMovements.createdAt}::date, 'YYYY-MM-DD')`,
                quantity: sql`coalesce(sum(${stockMovements.quantity}), 0)`,
                value: sql`coalesce(sum(${stockMovements.quantity} * ${productsTable.purchasePriceInCents}), 0)`
            })
            .from(stockMovements)
            .innerJoin(productsTable, eq(stockMovements.productId, productsTable.id))
            .where(
                and(
                    baseMovementsCond(),
                    eq(stockMovements.movementType, 'entry')
                )
            )
            .groupBy(sql`(${stockMovements.createdAt}::date)`)
            .orderBy(sql`${stockMovements.createdAt}::date`),

        // Stock exits by period
        db
            .select({
                date: sql`to_char(${stockMovements.createdAt}::date, 'YYYY-MM-DD')`,
                quantity: sql`coalesce(sum(abs(${stockMovements.quantity})), 0)`,
                value: sql`coalesce(sum(abs(${stockMovements.quantity}) * ${productsTable.purchasePriceInCents}), 0)`
            })
            .from(stockMovements)
            .innerJoin(productsTable, eq(stockMovements.productId, productsTable.id))
            .where(
                and(
                    baseMovementsCond(),
                    eq(stockMovements.movementType, 'exit')
                )
            )
            .groupBy(sql`(${stockMovements.createdAt}::date)`)
            .orderBy(sql`${stockMovements.createdAt}::date`),

        // Most moved products
        db
            .select({
                productId: stockMovements.productId,
                totalMovements: sql`coalesce(sum(abs(${stockMovements.quantity})), 0)`,
                entries: sql`coalesce(sum(case when ${stockMovements.movementType} = 'entry' then ${stockMovements.quantity} else 0 end), 0)`,
                exits: sql`coalesce(sum(case when ${stockMovements.movementType} = 'exit' then abs(${stockMovements.quantity}) else 0 end), 0)`
            })
            .from(stockMovements)
            .where(baseMovementsCond())
            .groupBy(stockMovements.productId)
            .orderBy(desc(sql`coalesce(sum(abs(${stockMovements.quantity})), 0)`))
            .limit(20),

        // ABC Analysis - products by total value
        db
            .select({
                productId: productsTable.id,
                name: productsTable.name,
                category: productsTable.category,
                totalValue: sql`coalesce(${productsTable.stockValueInCents}, 0)`
            })
            .from(productsTable)
            .where(eq(productsTable.enterpriseId, enterpriseId))
            .orderBy(desc(sql`coalesce(${productsTable.stockValueInCents}, 0)`)),

        // Previous period stock value (if dates provided)
        (async () => {
            if (!startDate || !endDate) return [{ prevStockValue: 0 }];
            // const periodMillis = endDate.getTime() - startDate.getTime();
            // const prevStart = new Date(startDate.getTime() - periodMillis - 1);
            // const prevEnd = new Date(startDate.getTime() - 1);

            const rows = await db
                .select({ prevStockValue: sql`coalesce(sum(${productsTable.stockValueInCents}), 0)` })
                .from(productsTable)
                .where(eq(productsTable.enterpriseId, enterpriseId));
            return rows;
        })()
    ]);

    // Process results
    const totalProductsInStock = Number(stockSummary[0]?.totalProducts || 0);
    const totalStockValueInCents = Number(stockSummary[0]?.totalStockValue || 0);
    const averageStockValueInCents = Number(stockSummary[0]?.avgStockValue || 0);

    // Low stock products
    const productsWithLowStock = lowStockProducts.map(p => ({
        productId: p.productId,
        name: p.name,
        currentStock: Number(p.currentStock || 0),
        minStock: Number(p.minStock || 0),
        category: p.category
    }));

    // Excess stock products
    const productsWithExcessStock = excessStockProducts.map(p => ({
        productId: p.productId,
        name: p.name,
        currentStock: Number(p.currentStock || 0),
        avgMonthlyMovement: Number(p.avgMonthlyMovement || 0),
        category: p.category
    }));

    // Stock entries by period
    const stockEntriesByPeriod = entriesByPeriod.map(e => ({
        date: String(e.date),
        quantity: Number(e.quantity || 0),
        valueInCents: Number(e.value || 0)
    }));

    // Stock exits by period
    const stockExitsByPeriod = exitsByPeriod.map(e => ({
        date: String(e.date),
        quantity: Number(e.quantity || 0),
        valueInCents: Number(e.value || 0)
    }));

    // Most moved products - fetch product names
    const movedProductIds = mostMovedProductsRes.map(p => p.productId);
    const movedProducts = movedProductIds.length ?
        await db.select({ id: productsTable.id, name: productsTable.name, category: productsTable.category })
            .from(productsTable)
            .where(inArray(productsTable.id, movedProductIds)) : [];

    const mostMovedProducts = mostMovedProductsRes.map(p => {
        const product = movedProducts.find(mp => mp.id === p.productId);
        return {
            productId: p.productId,
            name: product?.name || 'unknown',
            totalMovements: Number(p.totalMovements || 0),
            entries: Number(p.entries || 0),
            exits: Number(p.exits || 0),
            category: product?.category || 'unknown'
        };
    });

    // ABC Analysis
    const totalValue = abcAnalysisRes.reduce((sum, p) => sum + Number(p.totalValue || 0), 0);
    const abcAnalysis = abcAnalysisRes.map((p) => {
        const value = Number(p.totalValue || 0);
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

        let classification: 'A' | 'B' | 'C' = 'C';
        if (percentage >= 80) classification = 'A';
        else if (percentage >= 15) classification = 'B';

        return {
            productId: p.productId,
            name: p.name,
            category: p.category,
            totalValueInCents: value,
            percentage,
            classification
        };
    });

    // Calculate average acquisition cost
    const totalPurchaseValue = await db
        .select({ total: sql`coalesce(sum(${productsTable.purchasePriceInCents} * ${productsTable.quantity_in_stock}), 0)` })
        .from(productsTable)
        .where(eq(productsTable.enterpriseId, enterpriseId));

    const averageAcquisitionCost = totalProductsInStock > 0 ?
        Number(totalPurchaseValue[0]?.total || 0) / totalProductsInStock : 0;

    // Calculate stock turnover rate (simplified)
    const totalExitsValue = stockExitsByPeriod.reduce((sum, e) => sum + e.valueInCents, 0);
    const stockTurnoverRate = totalStockValueInCents > 0 ?
        (totalExitsValue / totalStockValueInCents) * 100 : 0;

    // Previous period comparison
    const prevStockValue = Number(((Array.isArray(prevPeriodStockValue) ? prevPeriodStockValue[0] : prevPeriodStockValue)?.prevStockValue) || 0);
    const stockValueGrowthRate = prevStockValue > 0 ?
        ((totalStockValueInCents - prevStockValue) / prevStockValue) * 100 : 0;

    return {
        totalProductsInStock,
        totalStockValueInCents,
        averageStockValueInCents,
        productsWithLowStock,
        productsWithExcessStock,
        stockEntriesByPeriod,
        stockExitsByPeriod,
        abcAnalysis,
        mostMovedProducts,
        averageAcquisitionCost,
        stockTurnoverRate,
        periodComparison: { previousPeriodStockValueInCents: prevStockValue, stockValueGrowthRate }
    };
}
