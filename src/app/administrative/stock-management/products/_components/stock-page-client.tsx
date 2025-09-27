"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/ui/data-table";
import {
    PageActions,
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from "@/components/ui/page-container";
import { type StockData } from "@/data/stock/get-stock-data";

import AddMovementStockButton from "./add-movement-button";
import AddProductButton from "./add-product-button";
import { ProductsCardsView } from "./products-cards-view";
import { StockSearch } from "./stock-search";
import { StockSummaryCard } from "./stock-summary-card";
import { productsTableColumns } from "./table-columns";
import { ViewToggle } from "./view-toggle";

interface StockPageClientProps {
    initialData: StockData;
}

export default function StockPageClient({ initialData }: StockPageClientProps) {
    const [view, setView] = useState<"table" | "cards">("table");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [supplierId, setSupplierId] = useState("all");
    const [data] = useState<StockData>(initialData);

    // Filtrar produtos localmente para melhor performance
    const filteredProducts = useMemo(() => {
        let filtered = data.products;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchLower) ||
                    product.description?.toLowerCase().includes(searchLower) ||
                    product.category.toLowerCase().includes(searchLower) ||
                    product.supplier?.name.toLowerCase().includes(searchLower)
            );
        }

        if (category && category !== "all") {
            filtered = filtered.filter((product) => product.category === category);
        }

        if (supplierId && supplierId !== "all") {
            filtered = filtered.filter((product) => product.supplierId === supplierId);
        }

        // Ordenar por nome em ordem alfabética decrescente
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }, [data.products, search, category, supplierId]);

    // Calcular estatísticas dos produtos filtrados
    const filteredStats = useMemo(() => {
        const totalStockValue = filteredProducts.reduce((total, product) => {
            const quantity = product.quantity_in_stock || 0;
            const salePrice = product.salePriceInCents / 100;
            return total + (quantity * salePrice);
        }, 0);

        const totalMargin = filteredProducts.reduce((total, product) => {
            const purchasePrice = product.purchasePriceInCents / 100;
            const salePrice = product.salePriceInCents / 100;
            const margin = salePrice > 0 ? ((salePrice - purchasePrice) / salePrice) * 100 : 0;
            return total + margin;
        }, 0);

        const averageMargin = filteredProducts.length > 0 ? totalMargin / filteredProducts.length : 0;

        return {
            totalStockValue,
            totalProducts: filteredProducts.length,
            averageMargin,
        };
    }, [filteredProducts]);

    const handleSearch = (searchTerm: string) => {
        setSearch(searchTerm);
    };

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
    };

    const handleSupplierChange = (newSupplierId: string) => {
        setSupplierId(newSupplierId);
    };

    const handleClearFilters = () => {
        setSearch("");
        setCategory("all");
        setSupplierId("all");
    };

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Estoque</PageTitle>
                    <PageDescription>
                        Visualize e gerencie os produtos em seu estoque.
                    </PageDescription>
                </PageHeaderContent>
                <PageActions>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <ViewToggle view={view} onViewChange={setView} />
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                            <AddMovementStockButton products={data.products} />
                            <AddProductButton />
                        </div>
                    </div>
                </PageActions>
            </PageHeader>

            <PageContent>
                {/* Card de resumo */}
                <StockSummaryCard
                    totalStockValue={filteredStats.totalStockValue}
                    totalProducts={filteredStats.totalProducts}
                    averageMargin={filteredStats.averageMargin}
                />

                {/* Componente de pesquisa */}
                <div className="mb-6">
                    <StockSearch
                        search={search}
                        category={category}
                        supplierId={supplierId}
                        categories={data.categories}
                        suppliers={data.suppliers}
                        onSearchChange={handleSearch}
                        onCategoryChange={handleCategoryChange}
                        onSupplierChange={handleSupplierChange}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                {/* Visualização dos produtos */}
                {view === "table" ? (
                    <DataTable
                        data={filteredProducts}
                        columns={productsTableColumns}
                    />
                ) : (
                    <ProductsCardsView products={filteredProducts} />
                )}
            </PageContent>
        </PageContainer>
    );
}
