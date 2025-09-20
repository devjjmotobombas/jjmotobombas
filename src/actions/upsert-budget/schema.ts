import z from "zod";

export const budgetItemSchema = z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().min(0, { message: "Quantidade deve ser maior ou igual a 0" }),
    unitPrice: z.number().min(0, { message: "Preço unitário deve ser maior ou igual a 0" }),
    totalPrice: z.number().min(0, { message: "Preço total deve ser maior ou igual a 0" }),
});

export const upsertBudgetSchema = z.object({
    id: z.string().uuid().optional(),
    clientId: z.string().uuid({ message: "Cliente é obrigatório" }),
    items: z.array(budgetItemSchema).min(1, { message: "Adicione pelo menos um item ao orçamento" }),
    total: z.number().min(0, { message: "Total deve ser maior ou igual a 0" }),
    validUntil: z.date({ message: "Data de validade é obrigatória" }),
    status: z.enum(["offered", "accepted", "rejected", "expired"]).default("offered"),
});

export type UpsertBudgetSchema = z.infer<typeof upsertBudgetSchema>;
export type BudgetItemSchema = z.infer<typeof budgetItemSchema>;
