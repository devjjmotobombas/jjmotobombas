"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const deleteProduct = actionClient
    .schema(
        z.object({
            id: z.string().uuid(),
        }),
    )
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

        const product = await db.query.productsTable.findFirst({
            where: eq(productsTable.id, parsedInput.id),
        });
        if (!product) {
            throw new Error("Produto não encontrado");
        }
        if (product.enterpriseId !== enterprise.id) {
            throw new Error("Produto não encontrado");
        }
        await db.delete(productsTable).where(eq(productsTable.id, parsedInput.id));
        revalidatePath("/administrative/stock-management/products");
    });