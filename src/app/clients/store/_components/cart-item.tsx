"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

interface CartItem {
    id: string;
    name: string;
    imageURL: string | null;
    salePriceInCents: number;
    quantity: number;
}

interface CartItemProps {
    item: CartItem;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) {
    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1) {
            onUpdateQuantity(item.id, newQuantity);
        }
    };

    const handleRemove = () => {
        onRemoveItem(item.id);
    };

    const subtotal = item.salePriceInCents * item.quantity;

    return (
        <Card className="bg-white border-1 border-gray-200 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                    {/* Imagem do produto */}
                    <div className="w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageURL ? (
                            <Image
                                src={item.imageURL}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center text-center justify-center h-full text-gray-500 text-xs">
                                Sem imagem
                            </div>
                        )}
                    </div>

                    {/* Informações do produto */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {item.name}
                        </h3>
                        <p className="text-sm text-gray-900">
                            {formatCurrencyInCents(item.salePriceInCents)} cada
                        </p>
                    </div>

                    {/* Controles de quantidade */}
                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            onClick={() => handleQuantityChange(item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="text-primary bg-white border-1 border-primary hover:bg-primary hover:text-white"
                        >
                            <Minus className="h-3 w-3" />
                        </Button>

                        <span className="w-8 text-center font-medium text-primary">
                            {item.quantity}
                        </span>

                        <Button
                            size="sm"
                            onClick={() => handleQuantityChange(item.quantity + 1)}
                            className="text-primary bg-white border-1 border-primary hover:bg-primary hover:text-white"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Subtotal centralizado */}
                    <div className="flex items-center justify-center">
                        <span className="font-semibold text-sm text-primary">
                            {formatCurrencyInCents(subtotal)}
                        </span>
                    </div>

                    {/* Botão remover no canto direito */}
                    <div className="flex items-center justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
