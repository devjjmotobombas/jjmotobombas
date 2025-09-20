import { Metadata } from "next";
import { Suspense } from "react";

import { getEnterprise } from "@/actions/get-enterprise";
import { getProductsForStore } from "@/actions/get-products-for-store";

import { StoreContent } from "./_components/store-content";

export const metadata: Metadata = {
    title: "JJMotobombas - Loja",
};


export default async function StorePage() {
    const [enterpriseResult, productsResult] = await Promise.all([
        getEnterprise(),
        getProductsForStore({ searchTerm: "" }),
    ]);

    const enterprise = enterpriseResult?.data;
    const products = productsResult?.data || [];

    if (!enterprise) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="text-center py-12">
                    <div className="text-red-500 text-lg">Erro ao carregar dados da empresa</div>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <StoreContent
                enterprise={enterprise}
                initialProducts={products}
            />
        </Suspense>
    );
}
