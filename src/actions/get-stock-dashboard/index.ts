"use server";

import { z } from "zod";

import { getStockDashboard } from "@/data/stock/get-stock-dashboard";
import { db } from "@/db";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const getStockDashboardAction = actionClient
    .schema(schema)
    .action(async ({ parsedInput }) => {
        const { startDate, endDate } = parsedInput;

        // busca empresa (primeira) tal como outros actions
        const enterprise = await db.query.enterprisesTable.findFirst({ columns: { id: true } });
        if (!enterprise) throw new Error('Enterprise not found');

        const params: { enterpriseId: string; startDate?: Date; endDate?: Date } = { enterpriseId: enterprise.id };
        if (startDate) params.startDate = new Date(startDate);
        if (endDate) params.endDate = new Date(endDate);

        const dashboard = await getStockDashboard(params);
        return dashboard;
    });
