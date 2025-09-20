import { z } from "zod";

export const exportBudgetPDFSchema = z.object({
    budgetId: z.string().uuid("ID do orçamento inválido"),
});
