"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ProductSearch } from "./product-search";

interface StoreNavbarProps {
    cartItemsCount: number;
    onSearch: (term: string) => void;
}

export function StoreNavbar({ cartItemsCount, onSearch }: StoreNavbarProps) {
    const handleScrollToProducts = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="border-none shadow-sm w-full fixed top-0 z-50">
            <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8">
                {/* Logo e nome da empresa - Esquerda */}
                <div className="flex items-center flex-shrink-0">
                    <Image
                        src="/LogoBomba.png"
                        alt="JJ Motobombas"
                        width={64}
                        height={64}
                        className="rounded-lg"
                    />
                    <h1 className="text-lg font-semibold text-[#0471ba] mt-4">
                        JJ Motobombas
                    </h1>
                </div>

                {/* Links de navegação - Centro */}
                <div className="flex items-center space-x-8 mx-auto">
                    <Link href="/clients/store">
                        <span className="text-sm font-semibold text-gray-600 hover:underline underline-offset-4 hover:text-primary hover:cursor-pointer">
                            Início
                        </span>
                    </Link>
                    <a
                        href="#products-section"
                        onClick={handleScrollToProducts}
                        className="text-sm font-semibold text-gray-600 hover:underline underline-offset-4 hover:text-primary hover:cursor-pointer"
                    >
                        Produtos
                    </a>
                    <Link href="#">
                        <span className="text-sm font-semibold text-gray-600 hover:underline underline-offset-4 hover:text-primary hover:cursor-pointer">
                            Contato
                        </span>
                    </Link>
                    <Link href="#">
                        <span className="text-sm font-semibold text-gray-600 hover:underline underline-offset-4 hover:text-primary hover:cursor-pointer">
                            Sobre
                        </span>
                    </Link>
                </div>

                {/* Campo de pesquisa e carrinho - Direita */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <ProductSearch
                        onSearch={onSearch}
                        placeholder="Buscar produtos..."
                    />

                    <Link href="/clients/store/cart">
                        <Button size="sm" className="relative bg-transparent text-gray-600 border-1 border-gray-200 hover:bg-primary hover:text-white">
                            <ShoppingCart className="h-4 w-4" />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
