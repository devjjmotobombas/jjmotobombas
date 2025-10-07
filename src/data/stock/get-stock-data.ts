import { and, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { productsTable, suppliersTable } from "@/db/schema";

export interface StockSearchParams {
    search?: string;
    category?: string;
    supplierId?: string;
    enterpriseId: string;
}

export interface StockData {
    products: Array<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        quantity: number;
        purchasePriceInCents: number;
        salePriceInCents: number;
        quantity_in_stock: number | null;
        stockValueInCents: number | null;
        stock_status: string | null;
        code: string | null;
        supplierId: string | null;
        supplier: {
            id: string;
            name: string;
        } | null;
        imageURL: string | null;
        publishForSale: boolean | null;
        createdAt: Date;
        updatedAt: Date;
        enterpriseId: string;
    }>;
    totalStockValue: number;
    totalProducts: number;
    categories: string[];
    suppliers: Array<{
        id: string;
        name: string;
    }>;
}

export async function getStockData({
    search,
    category,
    supplierId,
    enterpriseId,
}: StockSearchParams): Promise<StockData> {
    // Construir condições de filtro
    const conditions = [eq(productsTable.enterpriseId, enterpriseId)];

    if (search) {
        conditions.push(
            or(
                ilike(productsTable.name, `%${search}%`),
                ilike(productsTable.description, `%${search}%`),
                ilike(productsTable.category, `%${search}%`)
            )!
        );
    }

    if (category) {
        conditions.push(eq(productsTable.category, category));
    }

    if (supplierId) {
        conditions.push(eq(productsTable.supplierId, supplierId));
    }

    // Buscar produtos com fornecedores
    const products = await db.query.productsTable.findMany({
        where: and(...conditions),
        with: {
            supplier: true,
        },
        orderBy: (products, { desc }) => [desc(products.createdAt)],
    });

    // Calcular valor total do estoque
    const totalStockValue = products.reduce((total, product) => {
        const quantity = product.quantity_in_stock || 0;
        const salePrice = product.salePriceInCents;
        return total + (quantity * salePrice);
    }, 0);

    // Buscar categorias únicas
    const categoriesResult = await db
        .selectDistinct({ category: productsTable.category })
        .from(productsTable)
        .where(eq(productsTable.enterpriseId, enterpriseId));

    const categories = categoriesResult.map((item) => item.category);

    // Buscar fornecedores
    const suppliers = await db.query.suppliersTable.findMany({
        where: eq(suppliersTable.enterpriseId, enterpriseId),
        columns: {
            id: true,
            name: true,
        },
    });

    return {
        products: products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            quantity: product.quantity,
            purchasePriceInCents: product.purchasePriceInCents,
            salePriceInCents: product.salePriceInCents,
            quantity_in_stock: product.quantity_in_stock,
            stockValueInCents: product.stockValueInCents,
            stock_status: product.stock_status,
            code: product.code,
            supplierId: product.supplierId,
            supplier: product.supplier
                ? {
                    id: product.supplier.id,
                    name: product.supplier.name,
                }
                : null,
            imageURL: product.imageURL,
            publishForSale: product.publishForSale,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt || product.createdAt,
            enterpriseId: product.enterpriseId,
        })),
        totalStockValue,
        totalProducts: products.length,
        categories,
        suppliers,
    };
}
