
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
    PageContainer,
    PageContent,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import AccountSettingsForm from "./_components/account-settings-form";

export const metadata: Metadata = {
    title: "JJMotobombas - Conta",
};


const EnterpriseAccountSettingsPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/authentication");
    }

    return (
        <PageContainer>
            <PageContent>
                <div className="w-full mx-auto">
                    <AccountSettingsForm user={{
                        ...session.user,
                        enterpriseId: session.user.enterprise?.id || null,
                        avatarImageURL: session.user.avatarImageURL || null,
                        phone: session.user.phone || null,
                        docNumber: session.user.docNumber || null
                    }} />
                </div>
            </PageContent>
        </PageContainer>
    );
};

export default EnterpriseAccountSettingsPage;
