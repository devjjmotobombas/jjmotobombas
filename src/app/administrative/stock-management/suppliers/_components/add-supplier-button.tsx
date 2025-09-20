"use client";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertSupplierForm from "./upsert-supplier-form";

const AddSupplierButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-xs sm:text-sm">
          <Plus />
          <span className="hidden lg:inline">Adicionar fornecedor</span>
          <span className="lg:hidden">Adicionar</span>
        </Button>
      </DialogTrigger>
      <UpsertSupplierForm onSuccess={() => setIsOpen(false)} />
    </Dialog>
  );
};

export default AddSupplierButton;
