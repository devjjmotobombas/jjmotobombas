"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { updateUserData } from "@/actions/update-user-data";
import { updateUserDataSchema } from "@/actions/update-user-data/schema";
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

interface UpdateUserFormProps {
    enterpriseId: string;
    currentPhone: string;
    currentDocNumber: string;
    currentAvatarImageURL: string;
}

export function UpdateUserForm({
    enterpriseId,
    currentPhone,
    currentDocNumber,
    currentAvatarImageURL
}: UpdateUserFormProps) {
    const router = useRouter();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarImageURL || null);

    const form = useForm<z.infer<typeof updateUserDataSchema>>({
        resolver: zodResolver(updateUserDataSchema),
        defaultValues: {
            docNumber: currentDocNumber,
            phoneNumber: currentPhone,
            avatarImageURL: currentAvatarImageURL,
            enterpriseId: enterpriseId,
        },
    });

    const { execute, isPending } = useAction(updateUserData, {
        onSuccess: () => {
            toast.success("Dados atualizados com sucesso!");
            router.push("/administrative/sales-management/sales");
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Erro ao atualizar dados");
        },
    });

    async function onSubmit(values: z.infer<typeof updateUserDataSchema>) {
        execute(values);
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setAvatarPreview(result);
                form.setValue("avatarImageURL", result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setAvatarPreview(null);
        form.setValue("avatarImageURL", "");
    };

    return (
        <Card className="bg-[#fcfcfc] border-1 border-gray-200 shadow-md">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-center text-2xl font-bold text-gray-500">
                            Atualizar perfil
                        </CardTitle>
                        <CardDescription className="text-center text-gray-500/80">
                            Atualize seus dados pessoais e informações da empresa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Upload de Avatar */}
                        <FormField
                            control={form.control}
                            name="avatarImageURL"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-gray-500">Foto de perfil (opcional)</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            {avatarPreview ? (
                                                <div className="relative inline-block">
                                                    <Image
                                                        src={avatarPreview}
                                                        alt="Preview"
                                                        width={80}
                                                        height={80}
                                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
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
                                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                                        <Upload className="h-6 w-6 text-gray-400" />
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

                        {/* Número do documento */}
                        <FormField
                            control={form.control}
                            name="docNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-500">Número do documento *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite seu CPF ou CNPJ..."
                                            className="bg-input text-gray-500 placeholder:text-muted-foreground border-1 border-gray-200 shadow-sm focus:border-accent focus:ring-accent"
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
                                    <FormLabel className="text-gray-500">Número de telefone *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite seu telefone..."
                                            className="bg-input text-gray-500 placeholder:text-muted-foreground border-1 border-gray-200 shadow-sm focus:border-accent focus:ring-accent"
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
                                disabled={isPending}
                                onClick={() => {
                                    form.handleSubmit(onSubmit)();
                                }}
                            >
                                {isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Atualizar dados"
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

export default UpdateUserForm;
