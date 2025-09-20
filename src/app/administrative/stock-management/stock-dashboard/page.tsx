
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LauchingSoon } from "@/components/ui/launching-soon";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
    title: "JJMotobombas - Estoque",
};


const EnterpriseStockDashboardPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/authentication");
    }

    return (
        <LauchingSoon />
        // <PageContainer>
        //     <PageHeader>
        //         <PageHeaderContent>
        //             <PageTitle>Dashboard</PageTitle>
        //             <PageDescription>
        //                 Visualize os relatório de estoque da sua empresa.
        //             </PageDescription>
        //         </PageHeaderContent>
        //         <PageActions>
        //             <></>
        //         </PageActions>
        //     </PageHeader>
        //     <PageContent>
        //         <LauchingSoon />
        //     </PageContent>
        // </PageContainer>
    );
};

export default EnterpriseStockDashboardPage;
