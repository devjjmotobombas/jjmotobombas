import z from "zod";

export const updateUserDataSchema = z.object({
    name: z.string().optional(),
    docNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
    avatarImageURL: z.string().optional(),
    enterpriseId: z.string().uuid().optional(),
});

export type UpdateUserDataSchema = z.infer<typeof updateUserDataSchema>;