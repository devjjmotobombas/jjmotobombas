import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import LoginForm from "./_components/login-form ";


const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect("/administrative/product-management/products");
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 relative">
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="flex justify-center">
          <Image
            src="/LogoJJ.png"
            alt="iGenda Logo"
            width={216}
            height={216}
            className="h-56 w-auto"
            priority
          />
        </div>

        <div className="w-full mt-6">
          <LoginForm />
        </div>
      </div>

      <span className="text-xs text-gray-500 absolute bottom-4 left-1/2 -translate-x-1/2">
        Desenvolvido por <span className="text-[#246caa]">Synqia</span>
      </span>
    </div>
  );
};

export default AuthenticationPage;
