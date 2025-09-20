"use client";

import { useEffect, useState } from "react";

export interface CartItem {
    id: string;
    name: string;
    description: string | null;
    imageURL: string | null;
    salePriceInCents: number;
    quantity_in_stock: number | null;
    category: string;
    quantity: number;
}

const CART_STORAGE_KEY = "cart";

export function useCart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Carregar carrinho do localStorage na inicialização
    useEffect(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Erro ao carregar carrinho do localStorage:", error);
                setCartItems([]);
            }
        }
        setIsLoaded(true);
    }, []);

    // Salvar carrinho no localStorage sempre que houver mudanças
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded]);

    const addToCart = (product: Omit<CartItem, "quantity">, quantity: number) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);

            if (existingItem) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prev, { ...product, quantity }];
            }
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((sum, item) => sum + (item.salePriceInCents * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getItemCount = (productId: string) => {
        const item = cartItems.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    return {
        cartItems,
        isLoaded,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getItemCount,
    };
}
