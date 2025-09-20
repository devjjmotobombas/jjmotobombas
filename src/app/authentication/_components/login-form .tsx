"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "E-mail é obrigatório." })
    .email({ message: "Email inválido" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

const LoginForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.push("/administrative/sales-management/sales");
        },
        onError: () => {
          toast.error("E-mail ou senha inválidos.");
        },
      },
    );
  };

  return (
    <Card className="bg-[#fcfcfc] border-1 border-gray-200 shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          < CardHeader className="pb-4" >
            <CardTitle className="text-center text-2xl font-bold text-gray-500">
              Seja bem vindo (a) de volta!
            </CardTitle>
            <CardDescription className="text-center text-gray-500/80">
              Faça login na sua conta.
            </CardDescription>
          </CardHeader >
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">E-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu e-mail..."
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">Senha</FormLabel>
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
            <Link
              href="/authentication/forgot-password"
              className="text-sm text-gray-500 hover:text-primary flex justify-end"
            >
              Esqueceu sua senha?
            </Link>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-3 text-center flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                variant="default"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Entrar"
                )}
              </Button>
              <Button
                className="w-full text-primary bg-white border-1 border-gray-200 hover:bg-primary hover:text-white"
                onClick={() => router.push("/authentication/sign-up")}
              >
                Cadastre-se
              </Button>
            </div>
          </CardFooter>
        </form >
      </Form >
    </Card >
  );
};

export default LoginForm;
