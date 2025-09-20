"use client";

import {
  BookUser,
  Box,
  CircleDollarSign,
  FileTextIcon,
  IdCardIcon,
  LayoutDashboard,
  LogOutIcon,
  Moon,
  StoreIcon,
  UserIcon,
} from "lucide-react";
import { Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

// Menu items.
const itemsStockManagement = [
  {
    title: "Relatórios de estoque",
    url: "/administrative/stock-management/stock-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Fornecedores",
    url: "/administrative/stock-management/suppliers",
    icon: IdCardIcon,
  },
  {
    title: "Produtos",
    url: "/administrative/stock-management/products",
    icon: Box,
  },
];

const itemsSalesManagement = [
  {
    title: "Relatórios de vendas",
    url: "/administrative/sales-management/sales-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    url: "/administrative/sales-management/clients",
    icon: BookUser,
  },
  {
    title: "Vendas",
    url: "/administrative/sales-management/sales",
    icon: CircleDollarSign,
  },
  {
    title: "Orçamentos",
    url: "/administrative/sales-management/budgets",
    icon: FileTextIcon,
  },
];

const itemsSettings = [
  {
    title: "Conta",
    url: "/administrative/settings/account",
    icon: UserIcon,
  },
  {
    title: "Empresa",
    url: "/administrative/settings/enterprise",
    icon: StoreIcon,
  },
];

export function AppSidebar() {
  const { setTheme, resolvedTheme } = useTheme();

  const router = useRouter();

  const session = authClient.useSession();

  const pathname = usePathname();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  const userInitials = session.data?.user?.name
    .split(" ")
    .slice(0, 2)
    .map((name) => name[0])
    .join("");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-background flex items-center justify-center border-b p-4" />

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-md text-foreground font-bold">Estoque</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsStockManagement.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-md text-foreground font-bold">Vendas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsSalesManagement.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-md text-foreground font-bold">Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsSettings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-background border-t py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-12 w-12 rounded-full border-2 border-green-500 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8">
                    <AvatarImage
                      src={session.data?.user?.avatarImageURL || ""}
                    />
                    {!session.data?.user?.avatarImageURL && (
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="group-data-[state=collapsed]:hidden">
                    <p className="text-sm">
                      {session.data?.user?.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  className="flex items-center gap-2"
                >
                  <span className="inline-block transition-transform duration-300 ease-in-out group-active:rotate-180">
                    {resolvedTheme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </span>
                  <span>
                    {resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOutIcon />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
