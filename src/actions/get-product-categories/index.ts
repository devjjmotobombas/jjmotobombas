"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const getProductCategories = actionClient
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
