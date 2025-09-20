"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertProductSchema } from "./schema";

dayjs.extend(utc);

export const upsertProduct = actionClient
    .schema(upsertProductSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

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
                    quantity_in_stock: quantity,
                    stockValueInCents: purchasePriceInCents * quantity,
                    stock_status: "in_stock",
                    enterpriseId: session.user.enterprise.id,
                })
                .returning({ id: productsTable.id });

            productId = product.id;
        }

        revalidatePath("/administrative/stock-management/products");
    });
