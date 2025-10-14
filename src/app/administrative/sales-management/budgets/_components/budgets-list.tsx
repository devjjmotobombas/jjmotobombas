"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { budgetsTable } from "@/db/schema";

import BudgetCard from "./budget-card";
import UpsertBudgetForm from "./upsert-budget-form";

interface BudgetsListProps {
    budgets: (typeof budgetsTable.$inferSelect & {
        client: {
            id: string;
            name: string;
            phoneNumber: string;
        };
    })[];
    clients: Array<{ id: string; name: string; phoneNumber: string }>;
    products: Array<{ id: string; name: string; salePriceInCents: number; quantity_in_stock: number | null; isService: boolean }>;
}

const BudgetsList = ({ budgets, clients, products }: BudgetsListProps) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [editingBudget, setEditingBudget] = useState<(typeof budgetsTable.$inferSelect & {
        client: {
            id: string;
            name: string;
            phoneNumber: string;
        };
    }) | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const filteredBudgets = budgets
        .filter((budget) => {
            const matchesSearch = budget.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || budget.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => a.client.name.localeCompare(b.client.name));

    const handleEdit = (budget: typeof budgetsTable.$inferSelect & {
        client: {
            id: string;
            name: string;
            phoneNumber: string;
        };
    }) => {
        setEditingBudget(budget);
    };

    const handleDelete = () => {
        router.refresh();
    };

    const handleFormSuccess = () => {
        setEditingBudget(null);
        setShowCreateForm(false);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Buscar orçamentos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-sm"
                    />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os status</SelectItem>
                            <SelectItem value="offered">Ofertado</SelectItem>
                            <SelectItem value="sold">Vendido</SelectItem>
                            <SelectItem value="canceled">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setShowCreateForm(true)} className="text-sm">
                        Criar orçamento
                    </Button>
                </div>
            </div>

            {filteredBudgets.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all"
                            ? "Nenhum orçamento encontrado com os filtros aplicados."
                            : "Nenhum orçamento encontrado. Crie seu primeiro orçamento!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredBudgets.map((budget) => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {editingBudget && (
                <UpsertBudgetForm
                    budget={editingBudget}
                    clients={clients}
                    products={products}
                    onSuccess={handleFormSuccess}
                />
            )}

            {showCreateForm && (
                <UpsertBudgetForm
                    clients={clients}
                    products={products}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default BudgetsList;
