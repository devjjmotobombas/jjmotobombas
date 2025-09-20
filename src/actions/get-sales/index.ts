"use server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { clientsTable, salesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getSales = actionClient
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
