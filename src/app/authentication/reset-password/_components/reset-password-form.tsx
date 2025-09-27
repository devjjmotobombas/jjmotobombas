"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export function ResetPasswordForm({ }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Verificar se há token na URL
    const token = searchParams.get("token");
    if (!token) {
      toast.error("Token de redefinição de senha inválido ou expirado");
      setIsValidToken(false);
      router.push("/authentication/forgot-password");
      return;
    }
    setIsValidToken(true);
  }, [searchParams, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (values.password !== values.confirmPassword) {
      toast.error("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      toast.error("Token de redefinição de senha inválido ou expirado");
      setIsLoading(false);
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token: token,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha redefinida com sucesso");
      router.push("/authentication");
    }

    setIsLoading(false);
  }

  if (isValidToken === null) {
    return (
      <Card className="bg-[#fcfcfc] border-1 border-gray-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Verificando token...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isValidToken === false) {
    return (
      <Card className="bg-[#fcfcfc] border-1 border-gray-200 shadow-md">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Token inválido ou expirado</p>
            <Button
              onClick={() => router.push("/authentication/forgot-password")}
              variant="outline"
            >
              Solicitar novo link
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#fcfcfc] border-1 border-gray-200 shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold text-gray-500">
              Redefinir senha
            </CardTitle>
            <CardDescription className="text-center text-gray-500/80">
              Digite sua nova senha e confirme.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">
                    Nova senha
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite sua senha"
                      type="password"
                      className="bg-input text-gray-500 placeholder:text-muted-foreground border-1 border-gray-200 shadow-sm focus:border-accent focus:ring-accent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">
                    Confirmar nova senha
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Confirme sua senha"
                      type="password"
                      className="bg-input text-gray-500 placeholder:text-muted-foreground border-1 border-gray-200 shadow-sm focus:border-accent focus:ring-accent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-3 text-center">
              <Button
                type="submit"
                className="w-full"
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Redefinir senha"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default ResetPasswordForm;
