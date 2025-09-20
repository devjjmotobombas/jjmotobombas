"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { budgetsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const deleteBudget = actionClient
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

        const budget = await db.query.budgetsTable.findFirst({
            where: eq(budgetsTable.id, parsedInput.id),
        });

        if (!budget) {
            throw new Error("Orçamento não encontrado");
        }

        if (budget.enterpriseId !== enterprise.id) {
            throw new Error("Orçamento não encontrado");
        }

        await db.delete(budgetsTable).where(eq(budgetsTable.id, parsedInput.id));
        revalidatePath("/administrative/sales-management/budgets");
    });
