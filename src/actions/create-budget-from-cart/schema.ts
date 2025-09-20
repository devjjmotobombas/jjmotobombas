import { z } from "zod";

export const createBudgetFromCartSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        salePriceInCents: z.number(),
        quantity: z.number(),
    })),
    clientName: z.string().min(1, "Nome do cliente é obrigatório"),
    clientPhone: z.string().min(1, "Telefone do cliente é obrigatório"),
});
