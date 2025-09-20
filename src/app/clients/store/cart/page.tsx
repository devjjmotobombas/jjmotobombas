import { Suspense } from "react";

import { getEnterprise } from "@/actions/get-enterprise";

import { CartContent } from "../../store/_components/cart-content";
import { Footer } from "../../store/_components/footer";

export default async function CartPage() {
    const enterpriseResult = await getEnterprise();
    const enterprise = enterpriseResult?.data;

    if (!enterprise) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12">
                        <div className="text-red-500 text-lg">Erro ao carregar dados da empresa</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                        <div>Carregando...</div>
                    </div>
                }>
                    <CartContent enterprise={enterprise} />
                </Suspense>
            </div>
            <Footer enterprise={enterprise} />
        </div>
    );
}
