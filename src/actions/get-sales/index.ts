"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { clientsTable, salesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const getSales = actionClient
    .action(async () => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.enterprise?.id) {
            throw new Error("Unauthorized");
        }

        const sales = await db
            .select({
                id: salesTable.id,
                clientId: salesTable.clientId,
                items: salesTable.items,
                total: salesTable.total,
                paymentMethod: salesTable.paymentMethod,
                status: salesTable.status,
                createdAT: salesTable.createdAT,
                updatedAt: salesTable.updatedAt,
                client: {
                    id: clientsTable.id,
                    name: clientsTable.name,
                    phoneNumber: clientsTable.phoneNumber,
                },
            })
            .from(salesTable)
            .innerJoin(clientsTable, eq(salesTable.clientId, clientsTable.id))
            .orderBy(desc(salesTable.createdAT));

        return sales;
    });
