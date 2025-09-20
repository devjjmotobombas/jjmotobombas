import z from "zod";

export const upsertSupplierSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, { message: "Nome do fornecedor é obrigatório." }),
})

export type upsertSupplierSchema = z.infer<typeof upsertSupplierSchema>;