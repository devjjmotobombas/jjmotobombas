"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useFieldArray, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertBudget } from "@/actions/upsert-budget";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { budgetsTable } from "@/db/schema";
import { formatCurrency } from "@/helpers/currency";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    clientId: z.string().min(1, { message: "Cliente é obrigatório" }),
    items: z.array(z.object({
        productId: z.string().min(1, { message: "Produto é obrigatório" }),
        productName: z.string(),
        quantity: z.number().min(0, { message: "Quantidade deve ser maior ou igual a 0" }),
        unitPriceInCents: z.number().min(0.01, { message: "Preço unitário deve ser maior que zero." }),
        totalPriceInCents: z.number().min(0.01, { message: "Preço total deve ser maior que zero." }),
    })).min(1, { message: "Adicione pelo menos um item" }),
    validUntil: z.date({ message: "Data de validade é obrigatória" }),
    status: z.enum(["offered", "accepted", "rejected", "expired"]).default("offered"),
});

interface UpsertBudgetFormProps {
    budget?: typeof budgetsTable.$inferSelect;
    clients: Array<{ id: string; name: string; phoneNumber: string }>;
    products: Array<{ id: string; name: string; salePriceInCents: number; quantity_in_stock: number | null; isService: boolean }>;
    onSuccess?: () => void;
}

const UpsertBudgetForm = ({ budget, clients, products, onSuccess }: UpsertBudgetFormProps) => {

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientId: budget?.clientId || "",
            items: budget?.items ? (budget.items as unknown as { productId: string; productName: string; quantity: number; unitPriceInCents: number; totalPriceInCents: number }[]).map(item => ({
                ...item,
                unitPriceInCents: item.unitPriceInCents / 100, // Converter de centavos para reais
                totalPriceInCents: item.totalPriceInCents / 100, // Converter de centavos para reais
            })) : [{ productId: "", productName: "", quantity: 0, unitPriceInCents: 0, totalPriceInCents: 0 }],
            validUntil: budget?.validUntil ? new Date(budget.validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de hoje
            status: (budget?.status as unknown as "offered" | "accepted" | "rejected" | "expired") || "offered",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const upsertBudgetAction = useAction(upsertBudget, {
        onSuccess: () => {
            toast.success("Orçamento salvo com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: () => {
            toast.error("Erro ao salvar orçamento");
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const totalInCents = values.items.reduce((sum, item) => sum + item.totalPriceInCents, 0);

        const payload = {
            ...values,
            id: budget?.id,
            items: values.items.map(item => ({
                ...item,
                unitPriceInCents: Math.round(item.unitPriceInCents * 100),
                totalPriceInCents: Math.round(item.totalPriceInCents * 100),
            })),
            totalInCents: Math.round(totalInCents * 100),
        };

        upsertBudgetAction.execute(payload);
    };

    const addItem = () => {
        append({ productId: "", productName: "", quantity: 0, unitPriceInCents: 0, totalPriceInCents: 0 });
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
                    unitPriceInCents: selectedProduct.salePriceInCents / 100, // Converter de centavos para reais
                    totalPriceInCents: updatedItems[index].quantity * (selectedProduct.salePriceInCents / 100),
                };
            }
        } else if (field === "quantity") {
            updatedItems[index] = {
                ...updatedItems[index],
                quantity: value as number,
                totalPriceInCents: (value as number) * updatedItems[index].unitPriceInCents,
            };
        } else if (field === "unitPriceInCents") {
            updatedItems[index] = {
                ...updatedItems[index],
                unitPriceInCents: value as number,
                totalPriceInCents: updatedItems[index].quantity * (value as number),
            };
        }

        form.setValue("items", updatedItems);
    };

    const total = form.watch("items").reduce((sum, item) => sum + item.totalPriceInCents, 0);

    return (
        <Dialog open={true} onOpenChange={() => onSuccess?.()}>
            <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
                <DialogTitle>{budget ? "Editar orçamento" : "Criar orçamento"}</DialogTitle>
                <DialogDescription>
                    {budget ? "Edite as informações do orçamento." : "Crie um novo orçamento para um cliente."}
                </DialogDescription>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
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
                                name="validUntil"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Válido até</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            new Date(field.value).toLocaleDateString("pt-BR")
                                                        ) : (
                                                            <span>Selecione uma data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Itens do orçamento</CardTitle>
                                    <Button type="button" onClick={addItem} size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {fields.map((field, index) => {
                                    const selectedProduct = products.find(p => p.id === field.productId);
                                    const isService = selectedProduct?.isService || false;

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
                                                                    min="0"
                                                                    {...field}
                                                                    onChange={(e) => {
                                                                        const value = parseInt(e.target.value) || 0;
                                                                        field.onChange(value);
                                                                        updateItem(index, "quantity", value);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            {isService && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    Serviço - sem controle de estoque
                                                                </p>
                                                            )}
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.unitPriceInCents`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1 max-w-xs">
                                                            <FormLabel>Preço unitário</FormLabel>
                                                            <NumericFormat
                                                                value={field.value}
                                                                onValueChange={(value) => {
                                                                    field.onChange(value.floatValue);
                                                                    updateItem(index, "unitPriceInCents", value.floatValue || 0);
                                                                }}
                                                                decimalScale={2}
                                                                fixedDecimalScale
                                                                decimalSeparator=","
                                                                allowNegative={false}
                                                                allowLeadingZeros={false}
                                                                thousandSeparator="."
                                                                customInput={Input}
                                                                prefix="R$"
                                                                className="text-sm"
                                                            />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.totalPriceInCents`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1 max-w-xs">
                                                            <FormLabel>Total do item</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="text"
                                                                    value={formatCurrency(field.value)}
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
                                                    className="ml-4"
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
                            <span className="text-lg font-semibold">Total do orçamento:</span>
                            <span className="text-2xl font-bold">{formatCurrency(total)}</span>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={upsertBudgetAction.isPending}>
                                {upsertBudgetAction.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    budget ? "Atualizar orçamento" : "Criar orçamento"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default UpsertBudgetForm;