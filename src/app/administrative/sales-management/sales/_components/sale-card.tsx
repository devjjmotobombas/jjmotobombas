"use client";

import { Calendar, Edit, Trash2, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { cancelSale } from "@/actions/cancel-sale";
import { deleteSale } from "@/actions/delete-sale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrencyInCents } from "@/helpers/currency";
import { formatPhoneNumber } from "@/helpers/phone";

interface SaleCardProps {
    sale: {
        id: string;
        clientId: string;
        items: unknown;
        total: number;
        paymentMethod: string;
        status: string;
        createdAT: Date;
        updatedAt: Date | null;
        client: {
            id: string;
            name: string;
            phoneNumber: string;
        };
    };
    onEdit: (sale: {
        id: string;
        clientId: string;
        items: unknown;
        total: number;
        paymentMethod: string;
        status: string;
        createdAT: Date;
        updatedAt: Date | null;
        client: {
            id: string;
            name: string;
            phoneNumber: string;
        };
    }) => void;
    onDelete: () => void;
}

const SaleCard = ({ sale, onEdit, onDelete }: SaleCardProps) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const deleteSaleAction = useAction(deleteSale, {
        onSuccess: () => {
            toast.success("Venda excluída com sucesso!");
            onDelete();
            setShowDeleteDialog(false);
        },
        onError: () => {
            toast.error("Erro ao excluir venda");
        },
    });

    const cancelSaleAction = useAction(cancelSale, {
        onSuccess: () => {
            toast.success("Venda cancelada com sucesso!");
            onDelete();
            setShowCancelDialog(false);
        },
        onError: () => {
            toast.error("Erro ao cancelar venda");
        },
    });

    const handleDelete = () => {
        deleteSaleAction.execute({ id: sale.id });
    };

    const handleCancel = () => {
        cancelSaleAction.execute({ id: sale.id });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Pendente";
            case "completed":
                return "Concluída";
            case "cancelled":
                return "Cancelada";
            default:
                return status;
        }
    };

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case "cash":
                return "Dinheiro";
            case "credit_card":
                return "Cartão de Crédito";
            case "debit_card":
                return "Cartão de Débito";
            case "pix":
                return "Pix";
            default:
                return method;
        }
    };

    const items = sale.items as Array<{
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;

    const createdDate = new Date(sale.createdAT);

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg">
                                Venda #{sale.id.slice(-6).toUpperCase()}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {createdDate.toLocaleDateString("pt-BR")} às {createdDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}
                            >
                                {getStatusText(sale.status)}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Cliente:</h4>
                        <div className="space-y-2">
                            <span className="font-medium">{sale.client.name}</span>
                            <span className="text-muted-foreground ml-2 text-xs">
                                {formatPhoneNumber(sale.client.phoneNumber)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Pagamento:</h4>
                        <span className="text-sm">{getPaymentMethodText(sale.paymentMethod)}</span>
                    </div>

                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Itens:</h4>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex-1">
                                        <span className="font-medium">{item.productName}</span>
                                        <span className="text-muted-foreground ml-2">
                                            x{item.quantity} - {formatCurrencyInCents(item.unitPrice)}
                                        </span>
                                    </div>
                                    <span className="font-medium">
                                        {formatCurrencyInCents(item.totalPrice)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Total:</span>
                            <span className="text-xl font-bold text-primary">
                                {formatCurrencyInCents(sale.total)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(sale)}
                                className="flex-1"
                                disabled={sale.status === "cancelled"}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>

                            {sale.status !== "cancelled" && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCancelDialog(true)}
                                    className="flex-1"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                            )}

                            {sale.status === "cancelled" && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar venda</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja cancelar esta venda? Os produtos serão repostos ao estoque.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            disabled={cancelSaleAction.isPending}
                        >
                            Não
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={cancelSaleAction.isPending}
                        >
                            {cancelSaleAction.isPending ? "Cancelando..." : "Sim, cancelar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir venda cancelada</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir permanentemente esta venda cancelada? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={deleteSaleAction.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteSaleAction.isPending}
                        >
                            {deleteSaleAction.isPending ? "Excluindo..." : "Excluir"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SaleCard;
