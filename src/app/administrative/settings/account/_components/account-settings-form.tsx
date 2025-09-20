"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { updateUserData } from "@/actions/update-user-data";
import { updateUserDataSchema } from "@/actions/update-user-data/schema";
import { uploadUserAvatar } from "@/actions/upsert-user-avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usersTable } from "@/db/schema";
import { formatName } from "@/helpers/format-name";

interface AccountSettingsFormProps {
    user: typeof usersTable.$inferSelect;
}

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarImageURL || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const form = useForm<z.infer<typeof updateUserDataSchema>>({
        resolver: zodResolver(updateUserDataSchema),
        defaultValues: {
            name: user.name || "",
            docNumber: user.docNumber || "",
            phoneNumber: user.phone || "",
            avatarImageURL: user.avatarImageURL || "",
            enterpriseId: user.enterpriseId || "",
        },
    });

    const { execute, isPending } = useAction(updateUserData, {
        onSuccess: () => {
            toast.success("Dados atualizados com sucesso!");
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Erro ao atualizar dados");
        },
    });

    async function onSubmit(values: z.infer<typeof updateUserDataSchema>) {
        try {
            // Atualiza os dados do usuário
            await execute(values);

            // Se houver um arquivo de avatar, faz o upload
            if (avatarFile) {
                setIsUploadingAvatar(true);
                try {
                    const formData = new FormData();
                    formData.append("photo", avatarFile);

                    // Faz upload e atualiza avatar direto no banco
                    await uploadUserAvatar(formData, user.id);
                    toast.success("Foto de perfil atualizada com sucesso!");
                } catch (error) {
                    console.error("Erro ao fazer upload da imagem:", error);
                    toast.error("Erro ao enviar imagem. Os dados foram atualizados com sucesso.");
                } finally {
                    setIsUploadingAvatar(false);
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
        }
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setAvatarPreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setAvatarPreview(user.avatarImageURL || null);
        setAvatarFile(null);
    };

    return (
        <Card className="bg-background w-full shadow-md">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-center text-2xl font-bold text-foreground">
                            Configurações da Conta
                        </CardTitle>
                        <CardDescription className="text-center text-foreground/80">
                            Atualize as informações da sua conta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Upload de Avatar */}
                        <FormField
                            control={form.control}
                            name="avatarImageURL"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Foto de perfil</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            {avatarPreview ? (
                                                <div className="relative inline-block">
                                                    <Image
                                                        src={avatarPreview}
                                                        alt="Preview"
                                                        width={80}
                                                        height={80}
                                                        className="w-20 h-20 rounded-full object-cover bg-background border-1 border-gray-200"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                        onClick={removeAvatar}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center border-1 border-foreground border-dashed mt-2">
                                                        <Upload className="h-6 w-6 text-foreground" />
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleAvatarChange}
                                                            className="hidden"
                                                            id="avatar-upload"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                                        >
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Escolher foto
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* E-mail (somente leitura) */}
                        <FormItem>
                            <FormLabel className="text-foreground">E-mail</FormLabel>
                            <FormControl>
                                <Input
                                    value={user.email}
                                    disabled
                                    className="bg-background text-foreground cursor-not-allowed"
                                />
                            </FormControl>
                            <p className="text-sm text-gray-400">O e-mail não pode ser alterado</p>
                        </FormItem>

                        {/* Nome */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Nome completo *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite seu nome completo..."
                                            className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                            {...field}
                                            onBlur={(e) => {
                                                const formatted = formatName(e.target.value);
                                                if (formatted !== field.value) {
                                                    field.onChange(formatted);
                                                }
                                                field.onBlur();
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Número do documento */}
                        <FormField
                            control={form.control}
                            name="docNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">CPF *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite seu CPF..."
                                            className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Número de telefone */}
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Número de telefone *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite seu telefone..."
                                            className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <div className="w-full space-y-3 text-center">
                            <Button
                                type="submit"
                                className="w-full"
                                variant="default"
                                disabled={isPending || isUploadingAvatar}
                            >
                                {isPending || isUploadingAvatar ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Salvar alterações"
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

export default AccountSettingsForm;
