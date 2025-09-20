import z from "zod";

export const updateEnterpriseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, { message: "Nome da empresa é obrigatório." }),
  phoneNumber: z.string().trim().min(1, { message: "Telefone é obrigatório." }),
  register: z.string().trim().min(1, { message: "Registro é obrigatório." }),
  instagramURL: z
    .string()
    .trim()
    .min(1, { message: "URL do Instagram é obrigatória." }),
  cep: z.string().trim().min(8, { message: "CEP é obrigatório." }),
  address: z.string().trim().min(1, { message: "Endereço é obrigatório." }),
  number: z.string().trim().min(1, { message: "Número é obrigatório." }),
  complement: z.string().trim().optional(),
  city: z.string().trim().min(1, { message: "Cidade é obrigatória." }),
  state: z.string().trim().min(2, { message: "Estado é obrigatório." }),
});

export type UpdateEnterpriseSchema = z.infer<typeof updateEnterpriseSchema>;
