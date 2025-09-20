"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrencyInCents } from "@/helpers/currency";

interface Product {
    id: string;
    name: string;
    description: string | null;
    imageURL: string | null;
    salePriceInCents: number;
    quantity_in_stock: number | null;
    category: string;
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (productId: string, quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const handleQuantityChange = (newQuantity: number) => {
        const stock = product.quantity_in_stock || 0;
        if (newQuantity >= 1 && newQuantity <= stock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        onAddToCart(product.id, quantity);
        setQuantity(1); // Reset quantity after adding to cart
        setIsDialogOpen(true);
    };

    const handleContinueShopping = () => {
        setIsDialogOpen(false);
    };

    const handleGoToCart = () => {
        setIsDialogOpen(false);
        router.push("/clients/store/cart");
    };

    const isOutOfStock = (product.quantity_in_stock || 0) === 0;

    return (
        <Card className="w-78 h-auto bg-gray-50 border-transparent shadow-md rounded-xl hover:scale-105 hover:shadow-lg transition-shadow duration-300  ">
            <CardHeader className="p-0">
                <div className="aspect-square relative bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.imageURL ? (
                        <Image
                            src={product.imageURL}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                            Sem imagem
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                    <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 flex items-center gap-2">
                        {product.name} <Badge variant="outline" className="bg-white text-gray-900 border-1 border-gray-200">{product.category}</Badge>
                    </h3>

                    {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {product.description}
                        </p>
                    )}

                    <div className="flex items-center justify-end">
                        <span className="text-xl font-bold text-green-600">
                            {formatCurrencyInCents(product.salePriceInCents)}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col p-4 pt-0 space-y-3">
                {!isOutOfStock && (
                    <div className="flex items-center space-x-2 ">
                        <Button
                            size="sm"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className="text-primary bg-white border-1 border-primary hover:bg-primary hover:text-white"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>

                        <span className="w-8 text-center font-medium text-primary">
                            {quantity}
                        </span>

                        <Button
                            size="sm"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= (product.quantity_in_stock || 0)}
                            className="text-primary bg-white border-1 border-primary hover:bg-primary hover:text-white"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="w-full bg-white text-primary border-1 border-primary hover:bg-primary hover:text-white"
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isOutOfStock ? "Fora de estoque" : "Adicionar ao carrinho"}
                </Button>
            </CardFooter>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            Produto adicionado ao carrinho!
                        </DialogTitle>
                        <DialogDescription>
                            O produto <strong>{product.name}</strong> foi adicionado ao seu carrinho com sucesso.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleContinueShopping}
                            className="flex-1 sm:flex-none"
                        >
                            Continuar comprando
                        </Button>
                        <Button
                            onClick={handleGoToCart}
                            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                        >
                            Ir para o carrinho
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
