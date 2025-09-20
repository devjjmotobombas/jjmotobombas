"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { enterprisesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { updateEnterpriseSchema } from "./schema";

dayjs.extend(utc);

export const updateEnterprise = actionClient
  .schema(updateEnterpriseSchema)
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

    const enterpriseId = enterprise.id;

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
