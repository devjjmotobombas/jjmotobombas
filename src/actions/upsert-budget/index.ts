"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { budgetsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { upsertBudgetSchema } from "./schema";

dayjs.extend(utc);

export const upsertBudget = actionClient
    .schema(upsertBudgetSchema)
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

        const { id, clientId, items, total, validUntil, status } = parsedInput;

        // Converter valores para centavos
        const itemsInCents = items.map(item => ({
            ...item,
            unitPrice: Math.round(item.unitPrice * 100), // Converter para centavos
            totalPrice: Math.round(item.totalPrice * 100), // Converter para centavos
        }));

        const totalInCents = Math.round(total * 100); // Converter total para centavos

        // Se `id` estiver presente, atualiza o orçamento existente
        let budgetId = id;

        if (budgetId) {
            await db
                .update(budgetsTable)
                .set({
                    items: itemsInCents,
                    totalInCents: totalInCents,
                    validUntil: dayjs(validUntil).utc().toDate(),
                    status,
                    updatedAt: new Date(),
                })
                .where(eq(budgetsTable.id, budgetId));
        } else {
            const [budget] = await db
                .insert(budgetsTable)
                .values({
                    clientId,
                    items: itemsInCents,
                    totalInCents: totalInCents,
                    validUntil: dayjs(validUntil).utc().toDate(),
                    status,
                    enterpriseId: enterprise.id,
                })
                .returning({ id: budgetsTable.id });

            budgetId = budget.id;
        }

        revalidatePath("/administrative/sales-management/budgets");

        return { success: true, budgetId };
    });
