import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="bg-[#fcfcfc] min-h-screen flex relative">
      <div className=" bg-[#fcfcfc] flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto">
        <div className="mb-8">
          <div className="flex flex-col items-center text-foreground">
            <div className="w-56 h-auto bg-transparent rounded flex items-center justify-center">
              <Image
                src="/LogoJJ.png"
                alt="Logo iGenda"
                width={216}
                height={216}
                priority
              />
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-8 items-center">
          <Link href="/authentication" className="w-full">
            <Button
              className="w-full h-12"
              variant="default"
              size="lg"
            >
              Acessar o sistema
            </Button>
          </Link>

          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-4 text-muted-foreground text-sm">ou</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <Link href="#" className="w-full">
            <Button
              variant="link"
              className="w-full h-12 text-[#246caa]"
              size="lg"
            >
              Fazer um orçamento
            </Button>
          </Link>
        </div>
      </div>
      <span className="text-xs text-gray-500 absolute bottom-4 left-1/2 -translate-x-1/2">
        Desenvolvido por <span className="text-[#246caa]">Synqia</span>
      </span>
    </div>
  )
}
