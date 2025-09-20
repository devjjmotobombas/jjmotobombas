"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { enterprisesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { updateEnterpriseSchema } from "./schema";

dayjs.extend(utc);

export const updateEnterprise = actionClient
  .schema(updateEnterpriseSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session?.user.enterprise?.id) {
      throw new Error("Enterprise not found");
    }

    const {
      id,
      name,
      phoneNumber,
      register,
      instagramURL,
      cep,
      address,
      number,
      complement,
      city,
      state,
    } = parsedInput;

    const enterpriseId = id;

    if (enterpriseId) {
      await db
        .update(enterprisesTable)
        .set({
          name,
          phoneNumber,
          register,
          instagramURL,
          cep,
          address,
          number,
          complement,
          city,
          state,
          updatedAt: new Date(),
        })
        .where(eq(enterprisesTable.id, enterpriseId));
    }
    revalidatePath("/administrative/settings/enterprise");
  });
