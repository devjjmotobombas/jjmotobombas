"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { budgetsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getBudgets = actionClient
    .action(async () => {
        // Busca a primeira (e única) empresa do banco
        const enterprise = await db.query.enterprisesTable.findFirst({
            columns: {
                id: true,
            },
        });

        if (!enterprise) {
            throw new Error("Enterprise not found");
        }

        const budgets = await db.query.budgetsTable.findMany({
            where: eq(budgetsTable.enterpriseId, enterprise.id),
            orderBy: (budgets, { desc }) => [desc(budgets.createdAT)],
            with: {
                client: true,
            },
        });

        return budgets;
    });
