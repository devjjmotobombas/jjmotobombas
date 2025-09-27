import Image from "next/image";
import { Suspense } from "react";

import ResetPasswordForm from "./_components/reset-password-form";

const AuthenticationPage = async () => {
  return (
    <div className="bg-[#fcfcfc] flex min-h-screen w-full flex-col items-center justify-center p-4 relative">
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
          <Suspense fallback={<div>Carregando...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      <span className="text-xs text-gray-500 absolute bottom-4 left-1/2 -translate-x-1/2">
        Desenvolvido por <span className="text-[#246caa]">Synqia</span>
      </span>
    </div>
  );
};

export default AuthenticationPage;
