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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 sm:mb-6">
            {/* Valor total do estoque */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium sm:text-sm">
                        Valor Total do Estoque
                    </CardTitle>
                    <DollarSign className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold text-green-600 sm:text-2xl">
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
                    <CardTitle className="text-xs font-medium sm:text-sm">
                        Total de Produtos
                    </CardTitle>
                    <Package className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold sm:text-2xl">
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
                    <CardTitle className="text-xs font-medium sm:text-sm">
                        Margem Média
                    </CardTitle>
                    <TrendingUp className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold text-blue-600 sm:text-2xl">
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
