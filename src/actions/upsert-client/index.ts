"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertClientSchema } from "./schema";

dayjs.extend(utc);

export const upsertClient = actionClient
    .schema(upsertClientSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

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
                    enterpriseId: session?.user.enterprise?.id ?? "",
                })
                .returning({ id: clientsTable.id });

            clientId = client.id;
        }

        revalidatePath("/administrative/sales-management/clients");

        return { success: true, clientId };
    });
