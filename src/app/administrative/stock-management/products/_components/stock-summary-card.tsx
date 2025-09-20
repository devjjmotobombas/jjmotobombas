"use client";

import { DollarSign, Package, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/helpers/currency";

interface StockSummaryCardProps {
    totalStockValue: number;
    totalProducts: number;
    averageMargin?: number;
}

export function StockSummaryCard({
    totalStockValue,
    totalProducts,
    averageMargin = 0
}: StockSummaryCardProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Valor total do estoque */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Valor Total do Estoque
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalStockValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Baseado no preço de venda
                    </p>
                </CardContent>
            </Card>

            {/* Total de produtos */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de Produtos
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {totalProducts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Produtos cadastrados
                    </p>
                </CardContent>
            </Card>

            {/* Margem média */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Margem Média
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {averageMargin.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Lucro médio por produto
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
