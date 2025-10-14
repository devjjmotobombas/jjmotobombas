import z from "zod";

export const upsertProductSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, { message: "Nome do produto/serviço é obrigatório." }),
    description: z.string().trim().optional(),
    category: z.string().trim().optional(),
    quantity: z.number().optional(),
    purchasePriceInCents: z.number().optional(),
    salePriceInCents: z.number().min(1, { message: "Preço de venda é obrigatório." }),
    supplierId: z.string().uuid().optional(),
    imageURL: z.string().url().optional().or(z.literal("")),
    code: z.string().trim().optional(),
    publishForSale: z.boolean().default(false),
    isService: z.boolean().default(false),
})

export type upsertProductSchema = z.infer<typeof upsertProductSchema>;