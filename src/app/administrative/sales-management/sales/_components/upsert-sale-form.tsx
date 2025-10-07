"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertSale } from "@/actions/upsert-sale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrencyInCents } from "@/helpers/currency";

const formSchema = z.object({
    clientId: z.string().min(1, { message: "Cliente é obrigatório" }),
    items: z.array(z.object({
        productId: z.string().min(1, { message: "Produto é obrigatório" }),
        productName: z.string(),
        quantity: z.number().min(1, { message: "Quantidade deve ser maior que 0" }),
        unitPrice: z.number().min(0, { message: "Preço unitário deve ser maior ou igual a 0" }),
        totalPrice: z.number().min(0, { message: "Preço total deve ser maior ou igual a 0" }),
    })).min(1, { message: "Adicione pelo menos um item" }),
    paymentMethod: z.enum(["cash", "credit_card", "debit_card", "pix", "bank_transfer"], {
        message: "Método de pagamento é obrigatório"
    }),
});

interface UpsertSaleFormProps {
    sale?: {
        id: string;
        clientId: string;
        items: unknown;
        total: number;
        paymentMethod: string;
        createdAt: Date;
        updatedAt: Date | null;
    };
    clients: Array<{ id: string; name: string; phoneNumber: string }>;
    products: Array<{ id: string; name: string; salePriceInCents: number; quantity_in_stock: number | null }>;
    onSuccess?: () => void;
}

const UpsertSaleForm = ({ sale, clients, products, onSuccess }: UpsertSaleFormProps) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientId: sale?.clientId || "",
            items: sale?.items ? (sale.items as unknown as { productId: string; productName: string; quantity: number; unitPrice: number; totalPrice: number }[]) : [{ productId: "", productName: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
            paymentMethod: (sale?.paymentMethod as "cash" | "credit_card" | "debit_card" | "pix" | "bank_transfer") || "cash",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const upsertSaleAction = useAction(upsertSale, {
        onSuccess: () => {
            toast.success("Venda salva com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: () => {
            toast.error("Erro ao salvar venda");
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const total = values.items.reduce((sum, item) => sum + item.totalPrice, 0);

        upsertSaleAction.execute({
            ...values,
            id: sale?.id,
            total,
            status: "completed",
        });
    };

    const addItem = () => {
        append({ productId: "", productName: "", quantity: 1, unitPrice: 0, totalPrice: 0 });
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const currentItems = form.getValues("items");
        const updatedItems = [...currentItems];

        if (field === "productId") {
            const selectedProduct = products.find(p => p.id === (value as string));
            if (selectedProduct) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    productId: value as string,
                    productName: selectedProduct.name,
                    unitPrice: selectedProduct.salePriceInCents / 100,
                    totalPrice: updatedItems[index].quantity * (selectedProduct.salePriceInCents / 100),
                };
            }
        } else if (field === "quantity") {
            updatedItems[index] = {
                ...updatedItems[index],
                quantity: value as number,
                totalPrice: (value as number) * updatedItems[index].unitPrice,
            };
        } else if (field === "unitPrice") {
            updatedItems[index] = {
                ...updatedItems[index],
                unitPrice: value as number,
                totalPrice: updatedItems[index].quantity * (value as number),
            };
        }

        form.setValue("items", updatedItems);
    };

    const total = form.watch("items").reduce((sum, item) => sum + item.totalPrice, 0);


    return (
        <Dialog open={true} onOpenChange={() => onSuccess?.()}>
            <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
                <DialogTitle>{sale ? "Editar venda" : "Criar venda"}</DialogTitle>
                <DialogDescription>
                    {sale ? "Edite as informações da venda." : "Crie uma nova venda para um cliente."}
                </DialogDescription>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex justify-between gap-4">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Cliente</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione um cliente" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Pagamento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o método" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="cash">Dinheiro</SelectItem>
                                                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                                <SelectItem value="pix">PIX</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Itens da venda</CardTitle>
                                    <Button type="button" onClick={addItem} size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {fields.map((field, index) => {
                                    const selectedProduct = products.find(p => p.id === field.productId);
                                    const availableStock = selectedProduct?.quantity_in_stock || 0;

                                    return (
                                        <div key={field.id} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex justify-between gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.productId`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Produto</FormLabel>
                                                            <Select onValueChange={(value) => updateItem(index, "productId", value)} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecione um produto" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {products.map((product) => (
                                                                        <SelectItem key={product.id} value={product.id}>
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium">{product.name}</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Quantidade</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    max={availableStock}
                                                                    {...field}
                                                                    onChange={(e) => {
                                                                        const value = parseInt(e.target.value) || 1;
                                                                        field.onChange(value);
                                                                        updateItem(index, "quantity", value);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex items-end justify-between gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.totalPrice`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1 max-w-xs">
                                                            <FormLabel>Total do item</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    {...field}
                                                                    disabled
                                                                    className="bg-muted"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length === 1}
                                                    className="self-end"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                            <span className="text-lg font-semibold">Total da venda:</span>
                            <span className="text-2xl font-bold">{formatCurrencyInCents(total)}</span>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={upsertSaleAction.isPending}>
                                {upsertSaleAction.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    sale ? "Atualizar venda" : "Criar venda"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default UpsertSaleForm;
