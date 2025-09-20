"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { updateEnterprise } from "@/actions/update-enterprise";
import { updateEnterpriseSchema } from "@/actions/update-enterprise/schema";
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
import { enterprisesTable } from "@/db/schema";
import { formatName } from "@/helpers/format-name";

interface EnterpriseSettingsFormProps {
    enterprise: typeof enterprisesTable.$inferSelect;
}

export function EnterpriseSettingsForm({ enterprise }: EnterpriseSettingsFormProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(enterprise.avatarImageURL || null);

    const form = useForm<z.infer<typeof updateEnterpriseSchema>>({
        resolver: zodResolver(updateEnterpriseSchema),
        defaultValues: {
            id: enterprise.id,
            name: enterprise.name || "",
            phoneNumber: enterprise.phoneNumber || "",
            register: enterprise.register || "",
            instagramURL: enterprise.instagramURL || "",
            cep: enterprise.cep || "",
            address: enterprise.address || "",
            number: enterprise.number || "",
            complement: enterprise.complement || "",
            city: enterprise.city || "",
            state: enterprise.state || "",
        },
    });

    const { execute, isPending } = useAction(updateEnterprise, {
        onSuccess: () => {
            toast.success("Dados da empresa atualizados com sucesso!");
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Erro ao atualizar dados da empresa");
        },
    });

    async function onSubmit(values: z.infer<typeof updateEnterpriseSchema>) {
        execute(values);
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setAvatarPreview(result);
                // Aqui você pode implementar upload da imagem se necessário
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setAvatarPreview(null);
    };

    return (
        <Card className="bg-background w-full shadow-md">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-center text-2xl font-bold text-foreground">
                            Configurações da Empresa
                        </CardTitle>
                        <CardDescription className="text-center text-foreground/80">
                            Atualize as informações da sua empresa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Upload de Avatar */}
                        <FormItem>
                            <FormLabel className="text-foreground">Logo da empresa (opcional)</FormLabel>
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
                                                    Escolher logo
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                        </FormItem>

                        {/* Nome da empresa */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Nome da empresa *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o nome da empresa..."
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

                        {/* Telefone */}
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Telefone *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o telefone da empresa..."
                                            className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Registro */}
                        <FormField
                            control={form.control}
                            name="register"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">CNPJ *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o CNPJ da empresa..."
                                            className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Instagram URL */}
                        <FormField
                            control={form.control}
                            name="instagramURL"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">URL do Instagram *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite a URL do Instagram..."
                                            className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* CEP */}
                        <FormField
                            control={form.control}
                            name="cep"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">CEP *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o CEP..."
                                            className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Endereço */}
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Endereço *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o endereço..."
                                            className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Número e Complemento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Número *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Número..."
                                                className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="complement"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Complemento</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Complemento..."
                                                className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Cidade e Estado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Cidade *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Cidade..."
                                                className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Estado *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Estado..."
                                                className="bg-input text-foreground placeholder:text-muted-foreground border-1 border-border shadow-sm focus:border-accent focus:ring-accent"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="w-full space-y-3 text-center">
                            <Button
                                type="submit"
                                className="w-full"
                                variant="default"
                                disabled={isPending}
                            >
                                {isPending ? (
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

export default EnterpriseSettingsForm;
