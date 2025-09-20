import z from "zod";

export const upsertProductSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, { message: "Nome do serviço é obrigatório." }),
    description: z.string().trim().optional(),
    category: z.string().trim().min(1, { message: "Categoria é obrigatório." }),
    quantity: z.number().min(1, { message: "Quantidade é obrigatório." }),
    purchasePriceInCents: z.number().min(1, { message: "Preço de compra é obrigatório." }),
    salePriceInCents: z.number().min(1, { message: "Preço de venda é obrigatório." }),
    supplierId: z.string().uuid().optional(),
    imageURL: z.string().url().optional().or(z.literal("")),
    code: z.string().trim().optional(),
    publishForSale: z.boolean().default(false),
})

export type upsertProductSchema = z.infer<typeof upsertProductSchema>;