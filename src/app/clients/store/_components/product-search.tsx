"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";

interface Product {
    id: string;
    name: string;
    description: string | null;
    imageURL: string | null;
    salePriceInCents: number;
    quantity_in_stock: number | null;
    category: string;
}

interface ProductSearchProps {
    onSearch: (searchTerm: string) => void;
    placeholder?: string;
    products?: Product[];
}

export function ProductSearch({ onSearch, placeholder = "Buscar produtos...", }: ProductSearchProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="w-64">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-9 text-gray-600 border-1 border-gray-200 w-full"
                />
            </div>
        </div>
    );
}
