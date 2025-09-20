"use server";

import { and, eq, ilike } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const getProductsForStore = actionClient
    .schema(z.object({
        searchTerm: z.string().optional(),
    }))
    .action(async ({ parsedInput }) => {
        const { searchTerm = "" } = parsedInput;

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

        const whereConditions = [
            eq(productsTable.enterpriseId, session.user.enterprise.id),
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
            },
        });

        return products;
    });
