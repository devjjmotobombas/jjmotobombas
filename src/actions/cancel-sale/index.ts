"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { productsTable, saleItemsTable, salesTable, stockMovements } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { cancelSaleSchema } from "./schema";

export const cancelSale = actionClient
    .schema(cancelSaleSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.enterprise?.id) {
            throw new Error("Unauthorized");
        }

        const { id } = parsedInput;

        // Buscar a venda e seus itens
        const [sale] = await db
            .select()
            .from(salesTable)
            .where(eq(salesTable.id, id));

        if (!sale) {
            throw new Error("Venda não encontrada");
        }

        if (sale.status === "cancelled") {
            throw new Error("Venda já está cancelada");
        }

        // Buscar os itens da venda
        const saleItems = await db
            .select()
            .from(saleItemsTable)
            .where(eq(saleItemsTable.saleId, id));

        // Atualizar status da venda para "cancelled"
        await db
            .update(salesTable)
            .set({
                status: "cancelled",
                updatedAt: new Date(),
            })
            .where(eq(salesTable.id, id));

        // Repor produtos no estoque através de movimentos de entrada
        for (const saleItem of saleItems) {
            // Buscar o produto atual
            const [product] = await db
                .select()
                .from(productsTable)
                .where(eq(productsTable.id, saleItem.productId));

            if (!product) {
                throw new Error(`Produto não encontrado: ${saleItem.productId}`);
            }

            // Registrar movimento de entrada de estoque (reposição)
            await db.insert(stockMovements).values({
                productId: saleItem.productId,
                enterpriseId: session.user.enterprise.id,
                movementType: "entry",
                quantity: saleItem.productQty,
                reason: "cancelamento de venda",
            });

            // Atualizar estoque do produto (adicionar de volta)
            const currentStock = product.quantity_in_stock || 0;
            const newStock = currentStock + saleItem.productQty;

            await db
                .update(productsTable)
                .set({
                    quantity_in_stock: newStock,
                    stock_status: newStock > 0 ? "in_stock" : "out_of_stock",
                    updatedAt: new Date(),
                })
                .where(eq(productsTable.id, saleItem.productId));
        }

        revalidatePath("/administrative/sales-management/sales");

        return { success: true };
    });
