import z from "zod";

export const cancelSaleSchema = z.object({
    id: z.string().uuid({ message: "ID da venda é obrigatório" }),
});

export type CancelSaleSchema = z.infer<typeof cancelSaleSchema>;
