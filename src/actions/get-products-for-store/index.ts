"use server";

import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getProductsForStore = actionClient
    .schema(z.object({
        searchTerm: z.string().optional(),
    }))
    .action(async ({ parsedInput }) => {
        const { searchTerm = "" } = parsedInput;

        // Busca a primeira (e única) empresa do banco
        const enterprise = await db.query.enterprisesTable.findFirst({
            columns: {
                id: true,
            },
        });

        if (!enterprise) {
            throw new Error("Enterprise not found");
        }

        const whereConditions = [
            eq(productsTable.enterpriseId, enterprise.id),
            eq(productsTable.publishForSale, true),
        ];

        if (searchTerm) {
            whereConditions.push(
                ilike(productsTable.name, `%${searchTerm}%`)
            );
        }

        const products = await db.query.productsTable.findMany({
            where: and(...whereConditions),
            columns: {
                id: true,
                name: true,
                description: true,
                imageURL: true,
                salePriceInCents: true,
                quantity_in_stock: true,
                category: true,
                isService: true,
            },
        });

        return products;
    });
