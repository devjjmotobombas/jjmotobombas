import z from "zod";

export const saleItemSchema = z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().min(1, { message: "Quantidade deve ser maior que 0" }),
    unitPriceInCents: z.number().min(1, { message: "Preço unitário é obrigatório." }),
    totalPriceInCents: z.number().min(1, { message: "Preço total é obrigatório." }),
    // removed per-item budget id — budget is attached to the sale itself
});

export const upsertSaleSchema = z.object({
    id: z.string().uuid().optional(),
    clientId: z.string().uuid({ message: "Cliente é obrigatório" }),
    items: z.array(saleItemSchema).min(1, { message: "Adicione pelo menos um item à venda" }),
    totalInCents: z.number().min(1, { message: "Total é obrigatório." }),
    // Optional reference to the originating budget
    budgetId: z.string().uuid().optional(),
    paymentMethod: z.enum(["cash", "credit_card", "debit_card", "pix", "bank_transfer"], {
        message: "Método de pagamento é obrigatório"
    }),
    status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
});

export type UpsertSaleSchema = z.infer<typeof upsertSaleSchema>;
export type SaleItemSchema = z.infer<typeof saleItemSchema>;
