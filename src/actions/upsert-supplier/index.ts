"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertSupplierSchema } from "./shema";


dayjs.extend(utc);

export const upserSupplier = actionClient
    .schema(upsertSupplierSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

        const {
            id,
            name,
        } = parsedInput;

        let supplierId = id;

        if (supplierId) {
            await db
                .update(suppliersTable)
                .set({
                    name,
                    updatedAt: new Date(),
                })
                .where(eq(suppliersTable.id, supplierId));
        } else {
            const [supplier] = await db
                .insert(suppliersTable)
                .values({
                    name,
                    enterpriseId: session.user.enterprise.id,
                })
                .returning({ id: suppliersTable.id });

            supplierId = supplier.id;
        }

        revalidatePath("/administrative/stock-management/suppliers");
    });
