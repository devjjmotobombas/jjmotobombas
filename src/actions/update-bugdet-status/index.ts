"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { budgetsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const updateBugdetStatusSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(["offered", "sold", "canceled", "expired"]),
});

export const updateBugdetStatus = actionClient
    .schema(updateBugdetStatusSchema)
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

        const { status } = parsedInput;

        await db
            .update(budgetsTable)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(eq(budgetsTable.id, parsedInput.id));

        revalidatePath("/administrative/sales-management/budgets");
    });

export type updateBugdetStatusInput = z.infer<typeof updateBugdetStatusSchema>;
