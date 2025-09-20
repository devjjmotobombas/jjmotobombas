"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const getProductCategories = actionClient
    .action(async () => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

        const products = await db.query.productsTable.findMany({
            where: eq(productsTable.enterpriseId, session.user.enterprise.id),
            columns: {
                category: true,
            },
        });

        // Extrair categorias únicas e filtrar valores nulos/vazios
        const categories = Array.from(
            new Set(
                products
                    .map(product => product.category)
                    .filter(category => category && category.trim() !== "")
            )
        ).sort();

        return categories;
    });
