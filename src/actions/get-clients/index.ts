"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getClients = actionClient
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

        const clients = await db.query.clientsTable.findMany({
            where: eq(clientsTable.enterpriseId, enterprise.id),
            columns: {
                id: true,
                name: true,
                phoneNumber: true,
            },
        });

        return clients;
    });
