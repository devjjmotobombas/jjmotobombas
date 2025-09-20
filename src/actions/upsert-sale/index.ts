"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { productsTable, saleItemsTable, salesTable, stockMovements } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { upsertSaleSchema } from "./schema";

export const upsertSale = actionClient
    .schema(upsertSaleSchema)
    .action(async ({ parsedInput }) => {
        // Busca a primeira (e única) empresa do banco
        const enterprise = await db.query.enterprisesTable.findFirst({
            columns: {
                id: true,
            },
        });

        if (!enterprise) {
            throw new Error("Enterprise not found");
        }

        const { id, clientId, items, total, paymentMethod, status } = parsedInput;

        // Se `id` estiver presente, atualiza a venda existente
        let saleId = id;

        if (saleId) {
            // Atualizar venda existente
            await db
                .update(salesTable)
                .set({
                    items,
                    total,
                    paymentMethod,
                    status,
                    updatedAt: new Date(),
                })
                .where(eq(salesTable.id, saleId));

            // Deletar itens existentes
            await db
                .delete(saleItemsTable)
                .where(eq(saleItemsTable.saleId, saleId));
        } else {
            // Criar nova venda
            const [sale] = await db
                .insert(salesTable)
                .values({
                    clientId,
                    items,
                    total,
                    paymentMethod,
                    status,
                })
                .returning({ id: salesTable.id });

            saleId = sale.id;

            // Criar itens da venda
            const saleItems = items.map((item) => ({
                saleId: saleId!,
                productId: item.productId,
                productQty: item.quantity,
                productPrice: item.unitPrice,
            }));

            await db.insert(saleItemsTable).values(saleItems);

            // Registrar movimentos de estoque para cada item vendido
            for (const item of items) {
                // Verificar se o produto tem estoque suficiente
                const [product] = await db
                    .select()
                    .from(productsTable)
                    .where(eq(productsTable.id, item.productId));

                if (!product) {
                    throw new Error(`Produto ${item.productName} não encontrado`);
                }

                const currentStock = product.quantity_in_stock || 0;
                if (currentStock < item.quantity) {
                    throw new Error(`Estoque insuficiente para o produto ${item.productName}. Disponível: ${currentStock}, Solicitado: ${item.quantity}`);
                }

                // Registrar movimento de saída de estoque
                await db.insert(stockMovements).values({
                    productId: item.productId,
                    enterpriseId: enterprise.id,
                    movementType: "exit",
                    quantity: item.quantity,
                    reason: "venda",
                });

                // Atualizar estoque do produto
                const newStock = currentStock - item.quantity;
                await db
                    .update(productsTable)
                    .set({
                        quantity_in_stock: newStock,
                        stock_status: newStock > 0 ? "in_stock" : "out_of_stock",
                        updatedAt: new Date(),
                    })
                    .where(eq(productsTable.id, item.productId));
            }
        }

        revalidatePath("/administrative/sales-management/sales");

        return { success: true, saleId };
    });
