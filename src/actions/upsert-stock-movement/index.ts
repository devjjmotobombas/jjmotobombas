"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { productsTable, stockMovements } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { upsertStockMovementSchema } from "./schema";



export const upsertStockMovement = actionClient
    .schema(upsertStockMovementSchema)
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

        const {
            productId,
            movementType,
            quantity,
            reason
        } = parsedInput;

        // Inserir o movimento de estoque
        await db.insert(stockMovements).values({
            productId,
            enterpriseId: enterprise.id,
            movementType,
            quantity,
            reason,
        });

        // Buscar o produto atual
        const [currentProduct] = await db
            .select()
            .from(productsTable)
            .where(eq(productsTable.id, productId));

        if (!currentProduct) {
            throw new Error("Produto não encontrado");
        }

        // Calcular nova quantidade em estoque
        const currentStock = currentProduct.quantity_in_stock || 0;
        const newStock = movementType === "entry"
            ? currentStock + quantity
            : currentStock - quantity;

        // Atualizar o estoque do produto
        await db
            .update(productsTable)
            .set({
                quantity_in_stock: newStock,
                stock_status: newStock > 0 ? "in_stock" : "out_of_stock",
                updatedAt: new Date(),
            })
            .where(eq(productsTable.id, productId));

        revalidatePath("/administrative/stock-management/products");
    }); 