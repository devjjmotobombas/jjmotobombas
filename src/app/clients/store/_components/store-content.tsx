"use client";

import { useState } from "react";

import { getProductsForStore } from "@/actions/get-products-for-store";
import { useCart } from "@/hooks/use-cart";

import { Footer } from "./footer";
import { HeroSection } from "./hero-section";
import { ProductsGrid } from "./products-grid";
import { StoreNavbar } from "./store-navbar";
import { WhatsAppButton } from "./whatsapp-button";

interface Enterprise {
    id: string;
    name: string;
    phoneNumber: string;
    address: string;
    number: string;
    complement: string | null;
    city: string;
    state: string;
    register: string;
}

interface Product {
    id: string;
    name: string;
    description: string | null;
    imageURL: string | null;
    salePriceInCents: number;
    quantity_in_stock: number | null;
    category: string;
}

interface StoreContentProps {
    enterprise: Enterprise;
    initialProducts: Product[];
}

export function StoreContent({ enterprise, initialProducts }: StoreContentProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isLoading, setIsLoading] = useState(false);
    const { cartItems, addToCart, getTotalItems } = useCart();

    const handleSearch = async (term: string) => {
        setIsLoading(true);

        try {
            const searchResults = await getProductsForStore({ searchTerm: term });
            setProducts(searchResults?.data || []);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleAddToCart = (productId: string, quantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        addToCart({
            id: product.id,
            name: product.name,
            description: product.description,
            imageURL: product.imageURL,
            salePriceInCents: product.salePriceInCents,
            quantity_in_stock: product.quantity_in_stock,
            category: product.category,
        }, quantity);
    };


    return (
        <div className="bg-gray-50">
            <StoreNavbar
                cartItemsCount={getTotalItems()}
                onSearch={handleSearch}
            />

            {/* Hero Section */}
            <HeroSection
                phoneNumber={enterprise.phoneNumber}
            />

            {/* Seção de Produtos */}
            <div id="products-section" className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Botão WhatsApp fixo */}
                <div className="fixed bottom-4 right-4 z-50">
                    <WhatsAppButton
                        phoneNumber={enterprise.phoneNumber}
                        message={`Olá! Gostaria de saber mais sobre os produtos da ${enterprise.name}.`}
                    />
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Catálogo de produtos
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                        Veja nossos produtos e aproveite as melhores ofertas.
                    </p>
                </div>

                {/* Grid de produtos */}
                <div className="w-full">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">Buscando produtos...</div>
                        </div>
                    ) : (
                        <ProductsGrid
                            products={products}
                            onAddToCart={handleAddToCart}
                        />
                    )}
                </div>
            </div>

            {/* Footer */}
            <Footer enterprise={enterprise} />
        </div>
    );
}
