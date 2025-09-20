"use client";

import { ProductCard } from "./product-card";

interface Product {
    id: string;
    name: string;
    description: string | null;
    imageURL: string | null;
    salePriceInCents: number;
    quantity_in_stock: number | null;
    category: string;
}

interface ProductsGridProps {
    products: Product[];
    onAddToCart: (productId: string, quantity: number) => void;
}

export function ProductsGrid({ products, onAddToCart }: ProductsGridProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                    Nenhum produto encontrado
                </div>
                <p className="text-gray-400">
                    Tente ajustar os termos de busca ou verifique se há produtos disponíveis.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </div>
    );
}
