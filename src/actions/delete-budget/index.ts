"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { budgetsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteBudget = actionClient
    .schema(
        z.object({
            id: z.string().uuid(),
        }),
    )
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const budget = await db.query.budgetsTable.findFirst({
            where: eq(budgetsTable.id, parsedInput.id),
        });

        if (!budget) {
            throw new Error("Orçamento não encontrado");
        }

        if (budget.enterpriseId !== session.user.enterprise?.id) {
            throw new Error("Orçamento não encontrado");
        }

        await db.delete(budgetsTable).where(eq(budgetsTable.id, parsedInput.id));
        revalidatePath("/administrative/sales-management/budgets");
    });
