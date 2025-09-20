"use client";

import { CheckCircle, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BudgetSuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    budgetId: string;
    clientName: string;
    enterprisePhone?: string;
}

export function BudgetSuccessDialog({
    isOpen,
    onClose,
    budgetId,
    clientName,
    enterprisePhone
}: BudgetSuccessDialogProps) {
    const router = useRouter();

    // Extrair os 6 últimos dígitos do ID do orçamento
    const budgetCode = budgetId.slice(-6);

    const handleContact = () => {
        if (enterprisePhone) {
            // Formatar o telefone para WhatsApp
            const message = `Olá, criei o orçamento ${budgetCode} no seu site!`;
            const cleanPhone = enterprisePhone.replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } else {
            // Fallback para telefone genérico ou abrir uma nova aba
            const message = `Olá, criei o orçamento ${budgetCode} no seu site!`;
            const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const handleClose = () => {
        onClose();
        router.push("/clients/store");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-1 border-gray-200 shadow-sm">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Orçamento Criado com Sucesso!
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 text-center">
                    <p className="text-gray-600">
                        Olá <span className="font-semibold text-gray-900">{clientName}</span>!
                        Seu orçamento foi criado e nossa empresa receberá sua solicitação.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Código do Orçamento:</p>
                        <p className="text-2xl font-bold text-primary font-mono tracking-wider">
                            {budgetCode}
                        </p>
                    </div>

                    <p className="text-sm text-gray-500">
                        Anote este código para referência. Entre em contato conosco para mais informações.
                    </p>

                    <div className="flex flex-col space-y-3 pt-4">
                        <Button
                            onClick={handleContact}
                            className="w-full bg-white border-1 border-green-200 text-green-400 hover:bg-green-700 hover:text-white hover:cursor-pointer"
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Entrar em contato
                        </Button>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleClose}
                            className="w-full bg-white border-1 border-gray-200 text-gray-900 hover:bg-gray-100 hover:cursor-pointer"
                        >
                            Fechar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

