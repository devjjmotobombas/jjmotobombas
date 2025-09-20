"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/helpers/currency";

import TableProductActions from "./table-actions";

interface Product {
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
}

interface ProductsCardsViewProps {
    products: Product[];
}

const getStatusBadge = (status: string | null) => {
    if (!status) return null;

    switch (status.toLowerCase()) {
        case "in_stock":
            return {
                label: "Em estoque",
                className: "bg-green-100 text-green-700 border-green-200",
            };
        case "out_of_stock":
            return {
                label: "Sem estoque",
                className: "bg-red-100 text-red-700 border-red-200",
            };
        default:
            return {
                label: status,
                className: "bg-gray-100 text-gray-700 border-gray-200",
            };
    }
};

export function ProductsCardsView({ products }: ProductsCardsViewProps) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-muted-foreground">
                    <p className="text-lg font-medium">Nenhum produto encontrado</p>
                    <p className="text-sm">Adicione produtos para começar a gerenciar seu estoque</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
                const statusBadge = getStatusBadge(product.stock_status);
                const stockQuantity = product.quantity_in_stock || 0;
                const purchasePrice = product.purchasePriceInCents / 100;
                const salePrice = product.salePriceInCents / 100;
                const stockValue = stockQuantity * salePrice;

                return (
                    <Card key={product.id} className="relative group hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base font-medium truncate">
                                        {product.name}
                                    </CardTitle>
                                </div>
                                <div className="ml-2 flex-shrink-0">
                                    <TableProductActions product={product} />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {/* Categoria e Status */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                    {product.category}
                                </Badge>
                                {statusBadge && (
                                    <Badge variant="outline" className={`text-xs ${statusBadge.className}`}>
                                        {statusBadge.label}
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${product.publishForSale
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : "bg-red-100 text-red-700 border-red-200"
                                        }`}
                                >
                                    {product.publishForSale ? "Publicado" : "Não publicado"}
                                </Badge>
                            </div>

                            {/* Fornecedor */}
                            {product.supplier && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Fornecedor: </span>
                                    <span className="font-medium">{product.supplier.name}</span>
                                </div>
                            )}

                            {/* Quantidade em estoque */}
                            <div className="text-sm">
                                <span className="text-muted-foreground">Estoque: </span>
                                <span className="font-medium">{stockQuantity} unidades</span>
                            </div>

                            {/* Preços */}
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Custo:</span>
                                    <span className="font-medium">{formatCurrency(purchasePrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Venda:</span>
                                    <span className="font-medium">{formatCurrency(salePrice)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1">
                                    <span className="text-muted-foreground">Valor em estoque:</span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(stockValue)}
                                    </span>
                                </div>
                            </div>

                            {/* Margem de lucro */}
                            <div className="text-sm">
                                <span className="text-muted-foreground">Margem: </span>
                                <span className="font-medium text-green-600">
                                    {formatCurrency(salePrice - purchasePrice)}
                                    <span className="text-xs text-muted-foreground ml-1">
                                        ({(salePrice > 0 ? ((salePrice - purchasePrice) / salePrice * 100) : 0).toFixed(1)}%)
                                    </span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
