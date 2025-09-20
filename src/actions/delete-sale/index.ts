"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { saleItemsTable, salesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const deleteSaleSchema = z.object({
    id: z.string().uuid(),
});

export const deleteSale = actionClient
    .schema(deleteSaleSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.enterprise?.id) {
            throw new Error("Unauthorized");
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
