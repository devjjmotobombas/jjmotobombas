import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddSupplierButton from "./_components/add-supplier-button";
import SupplierCard from "./_components/supplier-card";

export const metadata: Metadata = {
  title: "JJMotobombas - Fornecedores",
};


const EnterpriseSuppliersPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.enterprise) {
    redirect("/enterprise-form");
  }


  const suppliers = await db.query.suppliersTable.findMany({
    where: eq(suppliersTable.enterpriseId, session.user.enterprise.id),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Fornecedores</PageTitle>
          <PageDescription>
            Gerencie os fornecedores da sua empresa.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddSupplierButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
            />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default EnterpriseSuppliersPage;
