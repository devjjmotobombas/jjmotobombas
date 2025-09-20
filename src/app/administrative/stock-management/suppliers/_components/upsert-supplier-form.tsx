import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { upserSupplier } from "@/actions/upsert-supplier";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { suppliersTable } from "@/db/schema";
import { formatName } from "@/helpers/format-name";

const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome do fornecedor é obrigatório." }),
})

interface upsertSupplierFormProps {
    supplier?: typeof suppliersTable.$inferSelect;
    onSuccess?: () => void;
}

const UpsertSupplierForm = ({ supplier, onSuccess }: upsertSupplierFormProps) => {

    const form = useForm<z.infer<typeof formSchema>>({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: supplier?.name || "",
        }
    })

    const upsertSupplierAction = useAction(upserSupplier, {
        onSuccess: () => {
            toast.success(supplier ? "Fornecedor atualizado com sucesso!" : "Fornecedor adicionado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: () => {
            toast.error(`Erro ao adicionar fornecedor.`);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        upsertSupplierAction.execute({
            ...values,
            id: supplier?.id,
        });
    };

    return (
        <DialogContent>
            <DialogTitle>{supplier ? supplier.name : "Adicionar fornecedor"}</DialogTitle>
            <DialogDescription>{supplier ? "Edite as informações desse fornecedor." : "Adicione um novo fornecedor à sua empresa!"}</DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nome do fornecedor
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Digite o nome do fornecedor"
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

                    <DialogFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting || upsertSupplierAction.isPending}>
                            {form.formState.isSubmitting || upsertSupplierAction.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : supplier ? (
                                "Editar fornecedor"
                            ) : (
                                "Cadastrar fornecedor"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

export default UpsertSupplierForm;