"use client";

import { Menu, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ProductSearch } from "./product-search";

interface StoreNavbarProps {
    cartItemsCount: number;
    onSearch: (term: string) => void;
}

export function StoreNavbar({ cartItemsCount, onSearch }: StoreNavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleScrollToProducts = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-white border-none shadow-sm w-full fixed top-0 z-50">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                {/* Logo e nome da empresa - Esquerda */}
                <div className="flex items-center flex-shrink-0">
                    <Image
                        src="/LogoBomba.png"
                        alt="JJ Motobombas"
                        width={48}
                        height={48}
                        className="rounded-lg sm:w-16 sm:h-16"
                    />
                    <h1 className="text-sm sm:text-lg font-semibold text-[#0471ba] ml-2 sm:ml-4">
                        JJ Motobombas
                    </h1>
                </div>

                {/* Links de navegação - Desktop */}
                <div className="hidden lg:flex items-center space-x-8 mx-auto">
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

                {/* Campo de pesquisa e carrinho - Desktop */}
                <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
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

                {/* Carrinho e menu mobile - Mobile */}
                <div className="flex items-center space-x-2 md:hidden">
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

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMobileMenu}
                        className="p-2"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Menu mobile */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-4 py-4 space-y-4">
                        {/* Campo de pesquisa mobile */}
                        <div className="md:hidden">
                            <ProductSearch
                                onSearch={onSearch}
                                placeholder="Buscar produtos..."
                            />
                        </div>

                        {/* Links de navegação mobile */}
                        <div className="space-y-3">
                            <Link
                                href="/clients/store"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-sm font-semibold text-gray-600 hover:text-primary py-2"
                            >
                                Início
                            </Link>
                            <a
                                href="#products-section"
                                onClick={handleScrollToProducts}
                                className="block text-sm font-semibold text-gray-600 hover:text-primary py-2"
                            >
                                Produtos
                            </a>
                            <Link
                                href="#"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-sm font-semibold text-gray-600 hover:text-primary py-2"
                            >
                                Contato
                            </Link>
                            <Link
                                href="#"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-sm font-semibold text-gray-600 hover:text-primary py-2"
                            >
                                Sobre
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
