"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getSuppliers = actionClient
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

        const suppliers = await db.query.suppliersTable.findMany({
            where: eq(suppliersTable.enterpriseId, enterprise.id),
            columns: {
                id: true,
                name: true,
            },
        });

        return suppliers;
    });
