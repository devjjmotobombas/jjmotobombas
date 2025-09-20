
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getClients } from "@/actions/get-clients";
import { getProducts } from "@/actions/get-products";
import { getSales } from "@/actions/get-sales";
import {
    PageActions,
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import SalesList from "./_components/sales-list";

export const metadata: Metadata = {
    title: "JJMotobombas - Vendas",
};

const EnterpriseSalesPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/authentication");
    }
    if (!session.user.enterprise) {
        redirect("/enterprise-form");
    }

    const salesResult = await getSales();
    const sales = salesResult?.data ?? [];

    const clientsResult = await getClients();
    const clients = clientsResult?.data ?? [];

    const productsResult = await getProducts();
    const products = productsResult?.data ?? [];

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Vendas</PageTitle>
                    <PageDescription>
                        Visualize e gerencie as vendas da sua empresa.
                    </PageDescription>
                </PageHeaderContent>
                <PageActions>
                    <></>
                </PageActions>
            </PageHeader>
            <PageContent>
                <SalesList
                    sales={sales}
                    clients={clients}
                    products={products}
                />
            </PageContent>
        </PageContainer>
    );
};

export default EnterpriseSalesPage;
