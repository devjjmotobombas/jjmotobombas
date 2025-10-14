"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { upsertProductSchema } from "./schema";

dayjs.extend(utc);

export const upsertProduct = actionClient
    .schema(upsertProductSchema)
    .action(async ({ parsedInput }) => {
        // Busca a primeira (e única) empresa do banco
        const enterprise = await db.query.enterprisesTable.findFirst({
            columns: {
                id: true,
            },
        });

        if (!enterprise) {
            throw new Error("Enterprise not found");
        }

        const {
            id,
            name,
            description,
            category,
            purchasePriceInCents,
            salePriceInCents,
            supplierId,
            quantity,
            imageURL,
            code,
            publishForSale,
            isService,
        } = parsedInput;

        let productId = id;

        if (productId) {
            await db
                .update(productsTable)
                .set({
                    name,
                    description,
                    category,
                    purchasePriceInCents,
                    salePriceInCents,
                    supplierId: supplierId || null,
                    quantity,
                    imageURL: imageURL || null,
                    code: code || null,
                    publishForSale,
                    isService,
                    updatedAt: new Date(),
                })
                .where(eq(productsTable.id, productId));
        } else {
            const [product] = await db
                .insert(productsTable)
                .values({
                    name,
                    description,
                    category,
                    purchasePriceInCents,
                    salePriceInCents,
                    supplierId: supplierId || null,
                    quantity,
                    imageURL: imageURL || null,
                    code: code || null,
                    publishForSale,
                    isService,
                    quantity_in_stock: quantity,
                    stockValueInCents: purchasePriceInCents ? purchasePriceInCents * (quantity || 0) : 0,
                    stock_status: "in_stock",
                    enterpriseId: enterprise.id,
                })
                .returning({ id: productsTable.id });

            productId = product.id;
        }

        revalidatePath("/administrative/stock-management/products");
    });
