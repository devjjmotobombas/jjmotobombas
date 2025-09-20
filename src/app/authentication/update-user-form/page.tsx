
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { auth } from "@/lib/auth";

import UpdateUserForm from "./_components/update-user-form";

const UpdateUserFormPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/authentication");
    }

    // Buscar dados do usuário
    const userData = await db.query.usersTable.findFirst({
        where: (users, { eq }) => eq(users.id, session.user.id),
    });

    if (!userData) {
        redirect("/authentication");
    }

    // Buscar a única empresa cadastrada
    const enterprise = await db.query.enterprisesTable.findFirst();

    if (!enterprise) {
        redirect("/enterprise-form");
    }

    return (
        <div className="bg-[#fcfcfc] flex min-h-screen w-full flex-col items-center justify-center p-4 relative">
            <div className="flex justify-center absolute top-4 right-4">
                <Image
                    src="/LogoJJ.png"
                    alt="iGenda Logo"
                    width={216}
                    height={216}
                    className="h-56 w-auto"
                    priority
                />
            </div>
            <div className="relative z-10 flex w-full max-w-md flex-col items-center">
                <div className="w-full">
                    <UpdateUserForm
                        enterpriseId={enterprise.id}
                        currentPhone={userData.phone || ""}
                        currentDocNumber={userData.docNumber || ""}
                        currentAvatarImageURL={userData.avatarImageURL || ""}
                    />
                </div>
            </div>

            <span className="text-xs text-gray-500 absolute bottom-4 left-1/2 -translate-x-1/2">
                Desenvolvido por <span className="text-[#246caa]">Synqia</span>
            </span>
        </div>
    );
};

export default UpdateUserFormPage;
