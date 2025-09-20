"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StockSearchProps {
    search: string;
    category: string;
    supplierId: string;
    categories: string[];
    suppliers: Array<{ id: string; name: string }>;
    onSearchChange: (search: string) => void;
    onCategoryChange: (category: string) => void;
    onSupplierChange: (supplierId: string) => void;
    onClearFilters: () => void;
}

export function StockSearch({
    search,
    category,
    supplierId,
    categories,
    suppliers,
    onSearchChange,
    onCategoryChange,
    onSupplierChange,
    onClearFilters,
}: StockSearchProps) {
    const [localSearch, setLocalSearch] = useState(search);

    const handleSearch = () => {
        onSearchChange(localSearch);
    };

    const handleClearFilters = () => {
        setLocalSearch("");
        onClearFilters();
    };

    const hasActiveFilters = search || (category && category !== "all") || (supplierId && supplierId !== "all");

    return (
        <div className="space-y-4">
            {/* Barra de pesquisa */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Pesquisar por nome, descrição ou categoria..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleSearch} size="sm">
                    Buscar
                </Button>
                {hasActiveFilters && (
                    <Button onClick={handleClearFilters} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-1" />
                        Limpar
                    </Button>
                )}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
                {/* Filtro por categoria */}
                <div className="min-w-[200px]">
                    <Select value={category} onValueChange={onCategoryChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Filtro por fornecedor */}
                <div className="min-w-[200px]">
                    <Select value={supplierId} onValueChange={onSupplierChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Todos os fornecedores" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os fornecedores</SelectItem>
                            {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Indicador de filtros ativos */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {search && (
                        <Badge variant="secondary" className="text-xs">
                            Pesquisa: &quot;{search}&quot;
                        </Badge>
                    )}
                    {category && category !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            Categoria: &quot;{category}&quot;
                        </Badge>
                    )}
                    {supplierId && supplierId !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            Fornecedor: {suppliers.find(s => s.id === supplierId)?.name}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
