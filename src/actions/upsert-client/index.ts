"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { upsertClientSchema } from "./schema";

dayjs.extend(utc);

export const upsertClient = actionClient
    .schema(upsertClientSchema)
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

        const { id, name, phoneNumber } = parsedInput;

        // Se `id` estiver presente, atualiza o cliente existente
        let clientId = id;

        if (clientId) {
            await db
                .update(clientsTable)
                .set({
                    name,
                    phoneNumber,
                    updatedAt: new Date(),
                })
                .where(eq(clientsTable.id, clientId));
        } else {
            const [client] = await db
                .insert(clientsTable)
                .values({
                    name,
                    phoneNumber,
                    enterpriseId: enterprise.id,
                })
                .returning({ id: clientsTable.id });

            clientId = client.id;
        }

        revalidatePath("/administrative/sales-management/clients");

        return { success: true, clientId };
    });
