"use server";

import { db } from "@/db";
import { enterprisesTable } from "@/db/schema";


export const createEnterprise = async (
  name: string,
  phoneNumber: string,
  register: string,
  instagramURL: string,
  cep: string,
  address: string,
  number: string,
  complement: string | undefined,
  city: string,
  state: string,
  avatarImageURL?: string,
) => {

  const [enterprise] = await db
    .insert(enterprisesTable)
    .values({
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
      avatarImageURL,
    })
    .returning();

  return { enterpriseId: enterprise.id };
};
