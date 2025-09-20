"use server";

import { db } from "@/db";
import { actionClient } from "@/lib/next-safe-action";

export const getEnterprise = actionClient
    .action(async () => {
        // Busca a primeira (e única) empresa do banco
        const enterprise = await db.query.enterprisesTable.findFirst({
            columns: {
                id: true,
                name: true,
                phoneNumber: true,
                address: true,
                number: true,
                complement: true,
                city: true,
                state: true,
                register: true,
            },
        });

        if (!enterprise) throw new Error("Enterprise not found");

        return enterprise;
    });
