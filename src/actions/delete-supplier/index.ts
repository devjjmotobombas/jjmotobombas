"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteSupplier = actionClient
    .schema(z.object({ id: z.string().uuid() }))
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

        const { id } = parsedInput;

        await db
            .delete(suppliersTable)
            .where(eq(suppliersTable.id, id));

        revalidatePath("/administrative/stock-management/suppliers");
    });
