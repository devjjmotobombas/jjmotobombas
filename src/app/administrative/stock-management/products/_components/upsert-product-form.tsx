import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { getProductCategories } from "@/actions/get-product-categories";
import { getSuppliers } from "@/actions/get-suppliers";
import { upsertProduct } from "@/actions/upsert-product";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { productsTable } from "@/db/schema";
import { cn } from "@/lib/utils";



const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome do serviço é obrigatório." }),
    description: z.string().trim().optional(),
    category: z.string().trim().min(1, { message: "Categoria é obrigatório." }),
    purchasePriceInCents: z.number().min(0.01, { message: "Preço de compra deve ser maior que zero." }),
    salePriceInCents: z.number().min(0.01, { message: "Preço de venda deve ser maior que zero." }),
    supplierId: z.string().uuid().optional().or(z.literal("")),
    quantity: z.string().trim().min(1, { message: "Quantidade é obrigatório." }).refine(value => !isNaN(Number(value)) && Number(value) > 0, { message: "Quantidade deve ser um número maior que zero." }),
    imageURL: z.string().url().optional().or(z.literal("")),
    code: z.string().trim().optional(),
    publishForSale: z.boolean(),
})

interface upsertProductoForm {
    product?: typeof productsTable.$inferSelect;
    onSuccess?: () => void;
}

const UpsertProductForm = ({ product, onSuccess }: upsertProductoForm) => {
    const [categories, setCategories] = React.useState<string[]>([]);
    const [suppliers, setSuppliers] = React.useState<{ id: string; name: string }[]>([]);
    const [openCategoryCombobox, setOpenCategoryCombobox] = React.useState(false);
    const [openSupplierCombobox, setOpenSupplierCombobox] = React.useState(false);
    const [, setImageFile] = React.useState<File>();
    const [imagePreview, setImagePreview] = React.useState<string>();
    const [isUploadingImage] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            category: product?.category || "",
            purchasePriceInCents: product?.purchasePriceInCents ? product.purchasePriceInCents / 100 : 0,
            salePriceInCents: product?.salePriceInCents ? product.salePriceInCents / 100 : 0,
            supplierId: product?.supplierId || undefined,
            quantity: product?.quantity?.toString() || "",
            imageURL: product?.imageURL || "",
            code: product?.code || "",
            publishForSale: product?.publishForSale || false,
        }
    })

    const getCategoriesAction = useAction(getProductCategories, {
        onSuccess: (data) => {
            if (data?.data) {
                setCategories(data.data);
            }
        },
        onError: () => {
            toast.error("Erro ao buscar categorias.");
        }
    });

    const getSuppliersAction = useAction(getSuppliers, {
        onSuccess: (data) => {
            if (data?.data) {
                setSuppliers(data.data);
            }
        },
        onError: () => {
            toast.error("Erro ao buscar fornecedores.");
        }
    });

    React.useEffect(() => {
        getCategoriesAction.execute();
        getSuppliersAction.execute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };


    const upsertProductoAction = useAction(upsertProduct, {
        onSuccess: () => {
            toast.success("Produto adicionado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            toast.error(`Erro ao adicionar produto.`);
            console.log(error);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log("Form values:", values);
        console.log("Form errors:", form.formState.errors);

        const payload = {
            ...values,
            id: product?.id,
            quantity: Number(values.quantity),
            purchasePriceInCents: Math.round(values.purchasePriceInCents * 100),
            salePriceInCents: Math.round(values.salePriceInCents * 100),
            supplierId: values.supplierId === "" ? undefined : values.supplierId,
            imageURL: values.imageURL === "" ? undefined : values.imageURL,
            code: values.code === "" ? undefined : values.code,
        };

        console.log("Payload to send:", payload);
        upsertProductoAction.execute(payload);
    };

    return (
        <DialogContent>
            <DialogTitle>{product ? product.name : "Adicionar produto"}</DialogTitle>
            <DialogDescription>{product ? "Edite as informações desse produto." : "Adicione um novo produto à sua empresa!"}</DialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nome do produto <span className="text-red-300">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Digite o nome do produto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Descrição
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Digite a descrição do produto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Código do produto <span className="text-red-300">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Digite o código do produto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Categoria <span className="text-red-300">*</span></FormLabel>
                                <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCategoryCombobox}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? categories.find(
                                                        (category) => category === field.value
                                                    ) || "Criar nova: " + field.value
                                                    : "Selecione ou crie uma categoria"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Buscar categoria ou criar nova..."
                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const value = (e.target as HTMLInputElement).value;
                                                    field.onChange(value);
                                                }}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {field.value?.length > 0 ? `Criar nova categoria: "${field.value}"` : "Nenhuma categoria encontrada."}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((category) => (
                                                        <CommandItem
                                                            value={category}
                                                            key={category}
                                                            onSelect={() => {
                                                                form.setValue("category", category)
                                                                setOpenCategoryCombobox(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    category === field.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {category}
                                                        </CommandItem>
                                                    ))}
                                                    {field.value && !categories.find(cat => cat === field.value) && (
                                                        <CommandItem
                                                            value={field.value}
                                                            key={field.value}
                                                            onSelect={() => {
                                                                form.setValue("category", field.value);
                                                                setOpenCategoryCombobox(false);
                                                            }}
                                                            className="text-sm text-muted-foreground"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    "opacity-0" // Always hidden for "create new"
                                                                )}
                                                            />
                                                            Criar nova: &quot;{field.value}&quot;
                                                        </CommandItem>
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Fornecedor
                                </FormLabel>
                                <Popover open={openSupplierCombobox} onOpenChange={setOpenSupplierCombobox}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openSupplierCombobox}
                                                className="w-full justify-between"
                                            >
                                                {field.value
                                                    ? suppliers.find((supplier) => supplier.id === field.value)?.name
                                                    : "Selecione um fornecedor"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar fornecedor..." />
                                            <CommandList>
                                                <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value=""
                                                        onSelect={() => {
                                                            field.onChange(undefined);
                                                            setOpenSupplierCombobox(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value === undefined ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        Nenhum fornecedor
                                                    </CommandItem>
                                                    {suppliers.map((supplier) => (
                                                        <CommandItem
                                                            key={supplier.id}
                                                            value={supplier.name}
                                                            onSelect={() => {
                                                                field.onChange(supplier.id);
                                                                setOpenSupplierCombobox(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    field.value === supplier.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {supplier.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Quantidade <span className="text-red-300">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Digite inicial de estoque" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="purchasePriceInCents"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Preço de compra <span className="text-red-300">*</span>
                                </FormLabel>
                                <NumericFormat
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value.floatValue);
                                    }}
                                    decimalScale={2}
                                    fixedDecimalScale
                                    decimalSeparator=","
                                    allowNegative={false}
                                    allowLeadingZeros={false}
                                    thousandSeparator="."
                                    customInput={Input}
                                    prefix="R$"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="salePriceInCents"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Preço de venda <span className="text-red-300">*</span>
                                </FormLabel>
                                <NumericFormat
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value.floatValue);
                                    }}
                                    decimalScale={2}
                                    fixedDecimalScale
                                    decimalSeparator=","
                                    allowNegative={false}
                                    allowLeadingZeros={false}
                                    thousandSeparator="."
                                    customInput={Input}
                                    prefix="R$"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="publishForSale"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Publicar para venda
                                    </FormLabel>
                                    <p className="text-sm text-muted-foreground">
                                        Este produto aparecerá no catálogo de vendas
                                    </p>
                                </div>
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="bg-muted relative mx-auto h-24 w-24 overflow-hidden rounded-lg sm:mx-0">
                            {imagePreview ? (
                                <Image
                                    src={imagePreview}
                                    alt="Preview da imagem"
                                    fill
                                    className="object-cover"
                                />
                            ) : product?.imageURL ? (
                                <Image
                                    src={product.imageURL}
                                    alt="Imagem do produto"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <Upload className="text-muted-foreground h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <FormLabel>Imagem do produto</FormLabel>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isUploadingImage}
                            />
                            {isUploadingImage && (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-muted-foreground text-sm">
                                        Enviando imagem...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={upsertProductoAction.isPending || isUploadingImage}>
                            {upsertProductoAction.isPending || isUploadingImage ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                product ? "Atualizar produto" : "Cadastrar produto"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

export default UpsertProductForm;