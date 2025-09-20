"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const getSuppliers = actionClient
    .action(async () => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

        const suppliers = await db.query.suppliersTable.findMany({
            where: eq(suppliersTable.enterpriseId, session.user.enterprise.id),
            columns: {
                id: true,
                name: true,
            },
        });

        return suppliers;
    });
