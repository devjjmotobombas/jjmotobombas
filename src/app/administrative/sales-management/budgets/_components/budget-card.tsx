"use client";

import { Calendar, Edit, FileDown, ShoppingCart, Trash2, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteBudget } from "@/actions/delete-budget";
import { exportBudgetPDF } from "@/actions/export-budget-pdf";
import { updateBugdetStatus } from "@/actions/update-bugdet-status";
import { upsertSale } from "@/actions/upsert-sale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { budgetsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import { formatPhoneNumber } from "@/helpers/phone";

interface BudgetCardProps {
    budget: typeof budgetsTable.$inferSelect & {
        client: {
            id: string;
            name: string;
            phoneNumber: string;
        };
    };
    onEdit: (budget: typeof budgetsTable.$inferSelect & {
        client: {
            id: string;
            name: string;
            phoneNumber: string;
        };
    }) => void;
    onDelete: () => void;
}

const BudgetCard = ({ budget, onEdit, onDelete }: BudgetCardProps) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCreateSaleDialog, setShowCreateSaleDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreatingSale, setIsCreatingSale] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit_card" | "debit_card" | "pix" | "bank_transfer">("cash");

    const { execute: executeExportPDF, isExecuting: isExportingPDF } = useAction(exportBudgetPDF, {
        onSuccess: ({ data }) => {
            if (data?.success && data.data) {
                // Criar link para download
                const link = document.createElement("a");
                link.href = `data:application/pdf;base64,${data.data.base64}`;
                link.download = data.data.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Orçamento exportado com sucesso!");
            }
        },
        onError: () => {
            toast.error("Erro ao exportar orçamento");
        },
    });

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteBudget({ id: budget.id });
            toast.success("Orçamento excluído com sucesso!");
            onDelete();
        } catch {
            toast.error("Erro ao excluir orçamento");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleCancelBudget = () => {
        setShowCancelDialog(true);
    };

    const handleConfirmCancel = async () => {
        setIsCanceling(true);
        try {
            await updateBugdetStatus({ id: budget.id, status: "canceled" });
            toast.success("Orçamento cancelado com sucesso!");
            setShowCancelDialog(false);
            onDelete(); // Atualizar a lista de orçamentos
        } catch (error) {
            console.error("Erro ao cancelar orçamento:", error);
            toast.error("Erro ao cancelar orçamento");
        } finally {
            setIsCanceling(false);
        }
    };

    const handleCreateSale = () => {
        setShowCreateSaleDialog(true);
    };

    const handleConfirmCreateSale = async () => {
        setIsCreatingSale(true);
        try {
            // Mapear itens do orçamento para o formato da venda
            const saleItems = items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPriceInCents: item.unitPriceInCents,
                totalPriceInCents: item.totalPriceInCents,
            }));

            // Criar a venda
            await upsertSale({
                clientId: budget.client.id,
                items: saleItems,
                totalInCents: budget.totalInCents,
                paymentMethod: paymentMethod,
                status: "completed",
                budgetId: budget.id
            });

            // Atualizar status do orçamento para "sold"
            await updateBugdetStatus({
                id: budget.id,
                status: "sold",
            });

            toast.success("Venda criada com sucesso!");
            setShowCreateSaleDialog(false);
            onDelete(); // Atualizar a lista de orçamentos
        } catch (error) {
            console.error("Erro ao criar venda:", error);
            toast.error("Erro ao criar venda. Verifique se há estoque suficiente.");
        } finally {
            setIsCreatingSale(false);
        }
    };

    const handleExportBudget = () => {
        executeExportPDF({ budgetId: budget.id });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "offered":
                return "bg-blue-100 text-blue-800";
            case "sold":
                return "bg-green-100 text-green-800";
            case "canceled":
                return "bg-red-100 text-red-800";
            case "expired":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "offered":
                return "Ofertado";
            case "sold":
                return "Vendido";
            case "canceled":
                return "Cancelado";
            case "expired":
                return "Expirado";
            default:
                return status;
        }
    };

    const items = budget.items as unknown as Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPriceInCents: number;
        totalPriceInCents: number;
    }>;

    const validUntil = new Date(budget.validUntil);
    const isExpired = validUntil < new Date();

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg">
                                Orçamento #{budget.id.slice(-6).toUpperCase()}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Válido até {validUntil.toLocaleDateString("pt-BR")}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    isExpired ? "expired" : budget.status
                                )}`}
                            >
                                {getStatusText(isExpired ? "expired" : budget.status)}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Cliente:</h4>
                        <div className="space-y-2">
                            <span className="font-medium">{budget.client.name}</span>
                            <span className="text-muted-foreground ml-2 text-xs">
                                {formatPhoneNumber(budget.client.phoneNumber)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Itens:</h4>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex-1">
                                        <span className="font-medium">{item.productName}</span>
                                        <span className="text-muted-foreground ml-2">
                                            x{item.quantity}
                                        </span>
                                    </div>
                                    <span className="font-medium">
                                        {formatCurrencyInCents(item.totalPriceInCents)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Total:</span>
                            <span className="text-xl font-bold text-primary">
                                {formatCurrencyInCents(budget.totalInCents)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(budget)}
                                className="flex-1"
                                disabled={budget.status === "canceled" || budget.status === "sold"}
                            >
                                <Edit className="h-4 w-4" />
                                {isExpired ? "Renovar orçamento" : "Editar"}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelBudget}
                                className="flex-1"
                                disabled={isExpired || budget.status === "canceled" || budget.status === "sold"}
                            >
                                <X className="h-4 w-4" />
                                Cancelar
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCreateSale}
                                className="flex-1"
                                disabled={isExpired || budget.status === "canceled" || budget.status === "sold"}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Criar venda
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportBudget}
                                className="flex-1"
                                disabled={isExpired || budget.status === "canceled" || budget.status === "sold" || isExportingPDF}
                            >
                                <FileDown className="h-4 w-4" />
                                {isExportingPDF ? "Exportando..." : "Baixar"}
                            </Button>
                        </div>


                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={budget.status === "sold"}
                        >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir orçamento</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Excluindo..." : "Excluir"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCreateSaleDialog} onOpenChange={setShowCreateSaleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar venda</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja criar uma venda a partir deste orçamento?
                            O orçamento será marcado como vendido e os itens serão removidos do estoque.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Cliente:</h4>
                            <span className="font-medium">{budget.client.name}</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Itens:</h4>
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <div className="flex-1">
                                            <span className="font-medium">{item.productName}</span>
                                            <span className="text-muted-foreground ml-2">
                                                x{item.quantity} - {formatCurrencyInCents(item.unitPriceInCents)}
                                            </span>
                                        </div>
                                        <span className="font-medium">
                                            {formatCurrencyInCents(item.totalPriceInCents)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className="text-xl font-bold text-primary">
                                    {formatCurrencyInCents(budget.totalInCents)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Forma de pagamento:</h4>
                            <Select value={paymentMethod} onValueChange={(value: "cash" | "credit_card" | "debit_card" | "pix" | "bank_transfer") => setPaymentMethod(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a forma de pagamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Dinheiro</SelectItem>
                                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                    <SelectItem value="pix">Pix</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateSaleDialog(false)}
                            disabled={isCreatingSale}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirmCreateSale}
                            disabled={isCreatingSale}
                        >
                            {isCreatingSale ? "Criando venda..." : "Criar venda"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar orçamento</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja cancelar este orçamento? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            disabled={isCanceling}
                        >
                            Não
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmCancel}
                            disabled={isCanceling}
                        >
                            {isCanceling ? "Cancelando..." : "Sim, cancelar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default BudgetCard;
