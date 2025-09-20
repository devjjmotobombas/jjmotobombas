"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const deleteClient = actionClient
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

        const client = await db.query.clientsTable.findFirst({
            where: eq(clientsTable.id, parsedInput.id),
        });
        if (!client) {
            throw new Error("Cliente não encontrado");
        }
        if (client.enterpriseId !== enterprise.id) {
            throw new Error("Cliente não encontrado");
        }
        await db.delete(clientsTable).where(eq(clientsTable.id, parsedInput.id));
        revalidatePath("/administrative/sales-management/clients");
    });