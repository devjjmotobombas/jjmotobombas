import type { Metadata } from "next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import EnterpriseForm from "./_components/enterprise-form";

export const metadata: Metadata = {
  title: "JJMotobombas - Cadastrar empresa",
};


const EnterpriseFormPage = async () => {

  return (
    <Dialog open>
      <DialogContent overlayClassName="bg-black" className="max-h-[95vh] w-[95vw] max-w-[500px] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Quase lá!</DialogTitle>
          <DialogDescription>
            Cadastre sua empresa para começar seu sistema.
          </DialogDescription>
        </DialogHeader>
        <EnterpriseForm />
      </DialogContent>
    </Dialog>
  );
};

export default EnterpriseFormPage;
