"use client";

import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

import { createBudgetFromCart } from "@/actions/create-budget-from-cart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";

import { BudgetSuccessDialog } from "./budget-success-dialog";



interface CartItem {
    id: string;
    name: string;
    salePriceInCents: number;
    quantity: number;
}

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
}

export function BudgetModal({ isOpen, onClose, cartItems }: BudgetModalProps) {
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [createdBudgetId, setCreatedBudgetId] = useState<string>("");
    const [createdClientName, setCreatedClientName] = useState<string>("");

    const { clearCart } = useCart();

    const createBudgetAction = useAction(createBudgetFromCart, {
        onSuccess: async (data) => {
            if (data?.data && 'budgetId' in data.data) {
                const budgetId = data.data.budgetId as string;

                // Armazenar dados para o dialog de sucesso
                setCreatedBudgetId(budgetId);
                setCreatedClientName(clientName.trim());

                // Limpar o carrinho
                clearCart();

                // Fechar o modal de criação e abrir o dialog de sucesso
                onClose();
                setClientName("");
                setClientPhone("");
                setShowSuccessDialog(true);
            }
        },
        onError: (error) => {
            console.error("Erro ao criar orçamento:", error);
            alert("Erro ao gerar orçamento. Tente novamente.");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientName.trim() || !clientPhone.trim()) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        // Adiciona o código do país (55) se não estiver presente
        let formattedPhoneNumber = clientPhone.trim();
        if (!formattedPhoneNumber.startsWith('55')) {
            formattedPhoneNumber = `55${formattedPhoneNumber}`;
        }

        createBudgetAction.execute({
            items: cartItems,
            clientName: clientName.trim(),
            clientPhone: formattedPhoneNumber,
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md bg-white border-1 border-gray-200 shadow-sm">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900">Dados para o Orçamento</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientName" className="text-gray-900">Nome Completo</Label>
                            <Input
                                id="clientName"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Digite seu nome completo"
                                required
                                className="text-gray-900 bg-white border-1 border-gray-200 hover:bg-gray-100 hover:cursor-pointer"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clientPhone" className="text-gray-900">Telefone</Label>
                            <Input
                                id="clientPhone"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                placeholder="(11) 99999-9999"
                                required
                                className="text-gray-900 bg-white border-1 border-gray-200 hover:bg-gray-100 hover:cursor-pointer"
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                onClick={onClose}
                                disabled={createBudgetAction.isExecuting}
                                className="text-gray-900 bg-white border-1 border-gray-200 hover:bg-gray-100 hover:cursor-pointer hover:scale-105 transition-all duration-300"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createBudgetAction.isExecuting}
                                className="text-white bg-primary hover:bg-primary/80 hover:cursor-pointer hover:scale-105 transition-all duration-300"
                                onClick={handleSubmit}
                            >
                                {createBudgetAction.isExecuting ? "Gerando..." : "Gerar Orçamento"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <BudgetSuccessDialog
                isOpen={showSuccessDialog}
                onClose={() => setShowSuccessDialog(false)}
                budgetId={createdBudgetId}
                clientName={createdClientName}
            />
        </>
    );
}