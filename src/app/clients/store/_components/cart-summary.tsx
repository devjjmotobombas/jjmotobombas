"use client";

import { FileText, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

interface CartSummaryProps {
    total: number;
    itemCount: number;
    onGenerateBudget: () => void;
    onWhatsAppContact: () => void;
    isGeneratingBudget?: boolean;
}

export function CartSummary({
    total,
    itemCount,
    onGenerateBudget,
    onWhatsAppContact,
    isGeneratingBudget = false,
}: CartSummaryProps) {
    return (
        <Card className="bg-white border-1 border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-gray-900">Resumo do Carrinho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-900">Itens ({itemCount})</span>
                        <span className="text-gray-900">{formatCurrencyInCents(total)}</span>
                    </div>

                    <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold text-lg">
                            <span className="text-gray-900">Total</span>
                            <span className="text-gray-900">{formatCurrencyInCents(total)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Button
                        onClick={onGenerateBudget}
                        disabled={itemCount === 0 || isGeneratingBudget}
                        className="w-full hover:cursor-pointer hover:scale-105 transition-all duration-300"
                    >
                        <FileText className="h-4 w-4" />
                        {isGeneratingBudget ? "Gerando orçamento..." : "Gerar Orçamento"}
                    </Button>

                    <Button
                        onClick={onWhatsAppContact}

                        className="w-full bg-white border-1 border-green-200 text-green-400 hover:bg-green-700 hover:text-white hover:cursor-pointer"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Entrar em contato
                    </Button>
                </div>

                {itemCount === 0 && (
                    <p className="text-sm text-gray-900 text-center">
                        Adicione produtos ao carrinho para gerar um orçamento
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
