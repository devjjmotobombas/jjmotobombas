"use client"

import { ColumnDef } from "@tanstack/react-table"

import { formatCurrency } from "@/helpers/currency"

import TableProductActions from "./table-actions"

type Product = {
    id: string;
    name: string;
    description: string | null;
    category: string;
    quantity: number;
    purchasePriceInCents: number;
    salePriceInCents: number;
    quantity_in_stock: number | null;
    stockValueInCents: number | null;
    stock_status: string | null;
    supplierId: string | null;
    code: string | null;
    supplier: {
        id: string;
        name: string;
    } | null;
    imageURL: string | null;
    publishForSale: boolean | null;
    createdAT: Date;
    updatedAt: Date;
    enterpriseId: string;
};

const getStatusBadge = (status: string | null) => {
    if (!status) return null;

    switch (status.toLowerCase()) {
        case "in_stock":
            return {
                label: "Em estoque",
                className: "bg-green-100 text-green-700 border-1 rounded-2xl p-1.5 text-xs",
            };
        case "out_of_stock":
            return {
                label: "Sem estoque",
                className: "bg-red-100 text-red-700 border-2 rounded-2xl p-1.5 text-xs",
            };
        default:
            return {
                label: status,
                className: "bg-gray-100 border-gray-500 text-gray-700 border-2 rounded-2xl p-1.5 text-xs",
            };
    }
};

export const productsTableColumns: ColumnDef<Product>[] = [
    {
        id: "name",
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="min-w-[150px]">
                    <div className="font-medium">{product.name}</div>
                </div>
            );
        },
    },
    {
        id: "category",
        accessorKey: "category",
        header: "Categoria",
        cell: ({ row }) => (
            <span className="text-sm">{row.original.category}</span>
        ),
    },
    {
        id: "supplier",
        accessorKey: "supplier",
        header: "Fornecedor",
        cell: ({ row }) => {
            const supplier = row.original.supplier;
            return (
                <span className="text-sm">
                    {supplier ? supplier.name : "Sem fornecedor"}
                </span>
            );
        },
    },
    {
        id: "purchase_price",
        accessorKey: "purchasePriceInCents",
        header: "Preço de custo",
        cell: ({ row }) => {
            const price = row.original.purchasePriceInCents / 100;
            return (
                <span className="text-sm font-medium">
                    {formatCurrency(price)}
                </span>
            );
        },
    },
    {
        id: "sale_price",
        accessorKey: "salePriceInCents",
        header: "Preço de venda",
        cell: ({ row }) => {
            const price = row.original.salePriceInCents / 100;
            return (
                <span className="text-sm font-medium">
                    {formatCurrency(price)}
                </span>
            );
        },
    },
    {
        id: "quantity_in_stock",
        accessorKey: "quantity_in_stock",
        header: "Estoque",
        cell: ({ row }) => {
            const quantity = row.original.quantity_in_stock || 0;
            return (
                <span className="text-sm font-medium">
                    {quantity} unidades
                </span>
            );
        },
    },
    {
        id: "stock_value",
        accessorKey: "stockValueInCents",
        header: "Valor em estoque",
        cell: ({ row }) => {
            const quantity = row.original.quantity_in_stock || 0;
            const salePrice = row.original.salePriceInCents / 100;
            const stockValue = quantity * salePrice;
            return (
                <span className="text-sm font-medium text-green-600">
                    {formatCurrency(stockValue)}
                </span>
            );
        },
    },
    {
        id: "profit_margin",
        header: "Margem",
        cell: ({ row }) => {
            const purchasePrice = row.original.purchasePriceInCents / 100;
            const salePrice = row.original.salePriceInCents / 100;
            const margin = salePrice - purchasePrice;
            const marginPercent = salePrice > 0 ? (margin / salePrice) * 100 : 0;

            return (
                <div className="text-sm">
                    <div className="font-medium text-green-600">
                        {formatCurrency(margin)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {marginPercent.toFixed(1)}%
                    </div>
                </div>
            );
        },
    },
    {
        id: "stock_status",
        accessorKey: "stock_status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.stock_status;
            const badge = getStatusBadge(status);

            if (!badge) return null;

            return (
                <span className={badge.className}>
                    {badge.label}
                </span>
            );
        },
    },
    {
        id: "publish_for_sale",
        accessorKey: "publishForSale",
        header: "Publicado",
        cell: ({ row }) => {
            const isPublished = row.original.publishForSale ?? false;
            return (
                <span className={`text-xs px-2 py-1 rounded-full ${isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}>
                    {isPublished ? "Sim" : "Não"}
                </span>
            );
        },
    },
    {
        id: "actions",
        cell: (params) => {
            const product = params.row.original;
            return (
                <TableProductActions product={product} />
            );
        },
    },
];