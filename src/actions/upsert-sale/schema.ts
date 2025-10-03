import z from "zod";

export const saleItemSchema = z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().min(1, { message: "Quantidade deve ser maior que 0" }),
    unitPrice: z.number().min(0, { message: "Preço unitário deve ser maior ou igual a 0" }),
    totalPrice: z.number().min(0, { message: "Preço total deve ser maior ou igual a 0" }),
    // removed per-item budget id — budget is attached to the sale itself
});

export const upsertSaleSchema = z.object({
    id: z.string().uuid().optional(),
    clientId: z.string().uuid({ message: "Cliente é obrigatório" }),
    items: z.array(saleItemSchema).min(1, { message: "Adicione pelo menos um item à venda" }),
    total: z.number().min(0, { message: "Total deve ser maior ou igual a 0" }),
    // Optional reference to the originating budget
    budgetId: z.string().uuid().optional(),
    paymentMethod: z.enum(["cash", "credit_card", "debit_card", "pix", "bank_transfer"], {
        message: "Método de pagamento é obrigatório"
    }),
    status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
});

export type UpsertSaleSchema = z.infer<typeof upsertSaleSchema>;
export type SaleItemSchema = z.infer<typeof saleItemSchema>;
