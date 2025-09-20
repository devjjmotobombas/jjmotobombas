"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { saleItemsTable, salesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const deleteSaleSchema = z.object({
    id: z.string().uuid(),
});

export const deleteSale = actionClient
    .schema(deleteSaleSchema)
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

        const { id } = parsedInput;

        // Buscar a venda para verificar o status
        const [sale] = await db
            .select()
            .from(salesTable)
            .where(eq(salesTable.id, id));

        if (!sale) {
            throw new Error("Venda não encontrada");
        }

        if (sale.status !== "cancelled") {
            throw new Error("Apenas vendas canceladas podem ser excluídas. Cancele a venda primeiro.");
        }

        // Deletar itens da venda primeiro
        await db
            .delete(saleItemsTable)
            .where(eq(saleItemsTable.saleId, id));

        // Deletar a venda
        await db
            .delete(salesTable)
            .where(eq(salesTable.id, id));

        revalidatePath("/administrative/sales-management/sales");

        return { success: true };
    });
