"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { budgetsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const updateBugdetStatusSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(["offered", "sold", "canceled", "expired"]),
});

export const updateBugdetStatus = actionClient
    .schema(updateBugdetStatusSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            throw new Error("Unauthorized");
        }
        if (!session.user.enterprise?.id) {
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
