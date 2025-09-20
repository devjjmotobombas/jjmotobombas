"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { budgetsTable, clientsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { createBudgetFromCartSchema } from "./schema";

dayjs.extend(utc);


export const createBudgetFromCart = actionClient
    .schema(createBudgetFromCartSchema)
    .action(async ({ parsedInput: { items, clientName, clientPhone } }) => {
        // Busca a primeira (e única) empresa do banco
        const enterprise = await db.query.enterprisesTable.findFirst({
            columns: {
                id: true,
            },
        });

        if (!enterprise) {
            throw new Error("Enterprise not found");
        }

        // Buscar ou criar cliente
        let client = await db.query.clientsTable.findFirst({
            where: eq(clientsTable.phoneNumber, clientPhone),
        });

        if (!client) {
            const newClient = await db.insert(clientsTable).values({
                name: clientName,
                phoneNumber: clientPhone,
                enterpriseId: enterprise.id,
            }).returning();

            client = newClient[0];
        }

        // Calcular total
        const totalInCents = items.reduce((sum: number, item: { salePriceInCents: number; quantity: number; }) => sum + (item.salePriceInCents * item.quantity), 0);

        // Criar orçamento
        const validUntil = dayjs().add(30, "days").utc().toDate(); // Válido por 30 dias

        const [budget] = await db.insert(budgetsTable).values({
            items: items.map((item: { id: string; name: string; quantity: number; salePriceInCents: number; }) => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                unitPrice: item.salePriceInCents,
                totalPrice: item.salePriceInCents * item.quantity,
            })),
            totalInCents: totalInCents,
            validUntil: validUntil,
            clientId: client.id,
            enterpriseId: enterprise.id,
            status: "offered",
        }).returning();

        revalidatePath("/administrative/sales-management/budgets");
        revalidatePath("/clients/store/cart");
        revalidatePath("/clients/store");

        return {
            success: true,
            budgetId: budget.id,
        };
    });
