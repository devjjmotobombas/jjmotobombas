"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { budgetsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const getBudgets = actionClient
    .action(async () => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

        const budgets = await db.query.budgetsTable.findMany({
            where: eq(budgetsTable.enterpriseId, session.user.enterprise.id),
            orderBy: (budgets, { desc }) => [desc(budgets.createdAT)],
            with: {
                client: true,
            },
        });

        return budgets;
    });
