"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { enterprisesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const getEnterprise = actionClient
    .action(async () => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) throw new Error("Unauthorized");
        if (!session.user.enterprise?.id) throw new Error("Enterprise not found");

        const enterprise = await db.query.enterprisesTable.findFirst({
            where: eq(enterprisesTable.id, session.user.enterprise.id),
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
