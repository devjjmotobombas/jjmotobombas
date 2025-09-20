"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const deleteSupplier = actionClient
    .schema(z.object({ id: z.string().uuid() }))
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

        await db
            .delete(suppliersTable)
            .where(eq(suppliersTable.id, id));

        revalidatePath("/administrative/stock-management/suppliers");
    });
