"use client";
import { Building2, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteSupplier } from "@/actions/delete-supplier";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { suppliersTable } from "@/db/schema";

import UpsertSupplierForm from "./upsert-supplier-form";

interface SupplierCardProps {
  supplier: typeof suppliersTable.$inferSelect;
}

const SupplierCard = ({ supplier }: SupplierCardProps) => {
  const [isUpsertSupplierFormOpen, setIsUpsertSupplierFormOpen] = useState(false);

  const deleteSupplierAction = useAction(deleteSupplier, {
    onSuccess: () => {
      toast.success("Fornecedor deletado com sucesso!");
    },
    onError: () => {
      toast.error(`Erro ao deletar fornecedor.`);
    },
  });

  const handleDeleteSupplier = () => {
    if (!supplier?.id) {
      toast.error("Fornecedor não encontrado.");
      return;
    }
    deleteSupplierAction.execute({ id: supplier?.id || "" });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 sm:h-12 sm:w-12">
            <Building2 className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold sm:text-base">{supplier.name}</h3>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2 px-3 py-3 sm:px-4">
        <div className="text-center text-xs text-muted-foreground sm:text-sm">
          Fornecedor cadastrado
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col gap-2 px-3 pt-3 sm:px-4">
        <Dialog
          open={isUpsertSupplierFormOpen}
          onOpenChange={setIsUpsertSupplierFormOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full text-xs sm:text-sm">
              Editar fornecedor
            </Button>
          </DialogTrigger>
          <UpsertSupplierForm
            supplier={supplier}
            onSuccess={() => setIsUpsertSupplierFormOpen(false)}
          />
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-xs hover:border-red-300 hover:bg-red-200 hover:text-red-500 sm:text-sm"
            >
              <Trash2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              Excluir fornecedor
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-sm sm:text-base">
                Tem certeza que deseja deletar esse fornecedor?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm">
                Essa ação não pode ser desfeita. Todos os dados relacionados a
                esse fornecedor serão perdidos permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs sm:text-sm">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSupplier}
                className="text-xs sm:text-sm"
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default SupplierCard;
