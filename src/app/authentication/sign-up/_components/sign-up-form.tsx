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
import { formatName } from "@/helpers/format-name";
import { authClient } from "@/lib/auth-client";

const registerSchema = z.object({
  name: z.string().trim().min(1, { message: "O nome é obrigatório" }),
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

const SignUpForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });


  async function onSubmit(values: z.infer<typeof registerSchema>) {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: formatName(values.name),
        callbackURL: "/authentication/update-user-form",
      },
      {
        onSuccess: () => {
          router.push("/authentication/update-user-form");
          toast.success("Conta criada com sucesso!");
        },
        onError: (ctx) => {
          if (ctx.error.code === "USER_ALREADY_EXISTS") {
            toast.error("Já existe uma conta com este e-mail.");
            return;
          }
          toast.error("Erro ao criar conta. Tente outro e-mail.");
        },
      },
    );
  }

  return (
    <Card className="bg-[#fcfcfc] border-1 border-gray-200 shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold text-gray-500">
              Cadastro
            </CardTitle>
            <CardDescription className="text-center text-gray-500/80">
              Crie uma conta para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu nome..."
                      className="bg-input text-gray-500 placeholder:text-muted-foreground border-1 border-gray-200 shadow-sm focus:border-accent focus:ring-accent"
                      {...field}
                      onBlur={(e) => {
                        const formatted = formatName(e.target.value);
                        if (formatted !== field.value) {
                          field.onChange(formatted);
                        }
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder="Digite sua senha..."
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
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Criar conta"
                )}
              </Button>

              <p className="text-sm text-gray-500 mt-2"> Já possui uma conta? <Link
                href="/authentication"
                className="text-sm text-gray-500 hover:text-primary"
              >
                Faça login
              </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SignUpForm;
