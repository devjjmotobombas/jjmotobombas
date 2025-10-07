"use client"
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertProductForm from "./upsert-product-form";

interface AddProductButtonProps {
    categories: string[];
    suppliers: Array<{ id: string; name: string }>;
}

const AddProductButton = ({ categories, suppliers }: AddProductButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="text-xs sm:text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Adicionar produto</span>
                </Button>
            </DialogTrigger>
            <UpsertProductForm
                categories={categories}
                suppliers={suppliers}
                onSuccess={() => setIsOpen(false)}
            />
        </Dialog>
    );
}

export default AddProductButton;