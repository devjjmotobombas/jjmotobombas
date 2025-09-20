import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getBudgets } from "@/actions/get-budgets";
import { getClients } from "@/actions/get-clients";
import { getProducts } from "@/actions/get-products";
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

import BudgetsList from "./_components/budgets-list";

export const metadata: Metadata = {
    title: "JJMotobombas - Orçamentos",
};

const BudgetsPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/authentication");
    }
    if (!session.user.enterprise) {
        redirect("/enterprise-form");
    }

    const budgetsResult = await getBudgets();
    const budgets = budgetsResult?.data ?? [];

    const clientsResult = await getClients();
    const clients = clientsResult?.data ?? [];

    const productsResult = await getProducts();
    const products = productsResult?.data ?? [];

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Orçamentos</PageTitle>
                    <PageDescription>
                        Gerencie os orçamentos da sua empresa.
                    </PageDescription>
                </PageHeaderContent>
                <PageActions>
                    <></>
                </PageActions>
            </PageHeader>
            <PageContent>
                <BudgetsList
                    budgets={budgets}
                    clients={clients}
                    products={products}
                />
            </PageContent>
        </PageContainer>
    );
};

export default BudgetsPage;
