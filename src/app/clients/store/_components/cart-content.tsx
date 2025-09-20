"use client";

import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

import { BudgetModal } from "./budget-modal";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";
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

interface CartContentProps {
    enterprise: Enterprise;
}

export function CartContent({ enterprise }: CartContentProps) {
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const router = useRouter();
    const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, isLoaded } = useCart();

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        updateQuantity(productId, quantity);
    };

    const handleRemoveItem = (productId: string) => {
        removeFromCart(productId);
    };

    const handleGenerateBudget = () => {
        if (cartItems.length === 0) return;
        setIsBudgetModalOpen(true);
    };

    const handleWhatsAppContact = () => {
        const itemsText = cartItems
            .map(item => `${item.quantity}x ${item.name}`)
            .join("\n");

        const message = `Olá! Gostaria de solicitar um orçamento para os seguintes produtos:\n\n${itemsText}\n\nTotal: R$ ${(getTotalPrice() / 100).toFixed(2)}`;

        const cleanPhone = enterprise.phoneNumber.replace(/\D/g, "");
        const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    const total = getTotalPrice();
    const itemCount = getTotalItems();

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 text-lg">Carregando carrinho...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <StoreNavbar
                cartItemsCount={itemCount}
                onSearch={() => { }}
            />

            <div className="pt-16 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Cabeçalho */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-4 mb-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.back()}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Voltar</span>
                            </Button>
                            <h1 className="text-3xl font-bold text-gray-900">Carrinho de Compras</h1>
                        </div>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                            <div className="text-center py-12">
                                <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Seu carrinho está vazio
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Adicione alguns produtos para começar sua compra
                                </p>
                                <Button onClick={() => router.push("/clients/store")}>
                                    Continuar Comprando
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Lista de itens */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Itens no Carrinho ({itemCount})</h2>
                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <CartItem
                                                key={item.id}
                                                item={item}
                                                onUpdateQuantity={handleUpdateQuantity}
                                                onRemoveItem={handleRemoveItem}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Resumo do carrinho */}
                            <div className="lg:col-span-1">
                                <CartSummary
                                    total={total}
                                    itemCount={itemCount}
                                    onGenerateBudget={handleGenerateBudget}
                                    onWhatsAppContact={handleWhatsAppContact}
                                    isGeneratingBudget={false}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Botão WhatsApp fixo */}
            <div className="fixed bottom-4 right-4 z-50">
                <WhatsAppButton
                    phoneNumber={enterprise.phoneNumber}
                    message={`Olá! Gostaria de saber mais sobre os produtos da ${enterprise.name}.`}
                />
            </div>

            {/* Modal de orçamento */}
            <BudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                cartItems={cartItems}
            />
        </div>
    );
}
