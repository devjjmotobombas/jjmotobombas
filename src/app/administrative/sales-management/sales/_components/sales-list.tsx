"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import SaleCard from "./sale-card";
import UpsertSaleForm from "./upsert-sale-form";

interface SalesListProps {
    sales: Array<{
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
    }>;
    clients: Array<{ id: string; name: string; phoneNumber: string }>;
    products: Array<{ id: string; name: string; salePriceInCents: number; quantity_in_stock: number | null }>;
}

const SalesList = ({ sales, clients, products }: SalesListProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingSale, setEditingSale] = useState<{
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
    } | null>(null);

    const filteredSales = sales.filter(sale => {
        const searchLower = searchTerm.toLowerCase();
        return (
            sale.client.name.toLowerCase().includes(searchLower) ||
            sale.id.toLowerCase().includes(searchLower) ||
            sale.client.phoneNumber.includes(searchTerm)
        );
    });

    const handleResetFilters = () => {
        setSearchTerm("");
    };

    const handleAdd = () => {
        setEditingSale(null);
        setShowForm(true);
    };

    const handleEdit = (sale: {
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
    }) => {
        setEditingSale(sale);
        setShowForm(true);
    };

    const handleDelete = () => {
        // Refresh the page to reload data
        window.location.reload();
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingSale(null);
        // Refresh the page to reload data
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Buscar por cliente, código da venda ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleResetFilters}
                        disabled={!searchTerm}
                    >
                        Limpar filtros
                    </Button>
                    <Button onClick={handleAdd}>
                        Nova venda
                    </Button>
                </div>
            </div>

            {filteredSales.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                        {searchTerm ? "Nenhuma venda encontrada com os filtros aplicados." : "Nenhuma venda cadastrada ainda."}
                    </div>
                    {!searchTerm && (
                        <Button onClick={handleAdd}>
                            Criar primeira venda
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSales.map((sale) => (
                        <SaleCard
                            key={sale.id}
                            sale={sale}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <UpsertSaleForm
                    sale={editingSale || undefined}
                    clients={clients}
                    products={products}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default SalesList;
