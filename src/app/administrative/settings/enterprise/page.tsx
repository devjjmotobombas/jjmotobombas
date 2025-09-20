
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
    PageContainer,
    PageContent,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { enterprisesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import EnterpriseSettingsForm from "./_components/enterprise-settings-form";

export const metadata: Metadata = {
    title: "JJMotobombas - Configurações",
};


const EnterpriseSettingsPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/authentication");
    }

    if (!session.user.enterprise?.id) {
        redirect("/enterprise-form");
    }

    // Buscar dados completos da empresa
    const enterprise = await db.query.enterprisesTable.findFirst({
        where: eq(enterprisesTable.id, session.user.enterprise.id),
    });

    if (!enterprise) {
        redirect("/enterprise-form");
    }

    return (
        <PageContainer>
            <PageContent>
                <div className="w-full mx-auto">
                    <EnterpriseSettingsForm enterprise={enterprise} />
                </div>
            </PageContent>
        </PageContainer>
    );
};

export default EnterpriseSettingsPage;
