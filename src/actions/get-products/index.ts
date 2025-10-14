"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getProducts = actionClient
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

        const products = await db.query.productsTable.findMany({
            where: eq(productsTable.enterpriseId, enterprise.id),
            columns: {
                id: true,
                name: true,
                salePriceInCents: true,
                quantity_in_stock: true,
                isService: true,
            },
        });

        return products;
    });
