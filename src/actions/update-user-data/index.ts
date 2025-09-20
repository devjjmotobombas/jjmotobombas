"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { updateUserDataSchema } from "./schema";

export const updateUserData = actionClient
    .schema(updateUserDataSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const { name, docNumber, phoneNumber, avatarImageURL, enterpriseId } = parsedInput;

        // Atualizar usuário
        await db.update(usersTable)
            .set({
                name: name,
                phone: phoneNumber,
                avatarImageURL: avatarImageURL || "",
                docNumber: docNumber || "",
                enterpriseId: enterpriseId || null,
                updatedAt: new Date(),
            })
            .where(eq(usersTable.id, session.user.id));

        revalidatePath("/administrative/settings/account");
    }); 