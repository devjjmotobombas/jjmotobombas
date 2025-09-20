import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getStockData } from "@/data/stock/get-stock-data";
import { auth } from "@/lib/auth";

import StockPageClient from "./_components/stock-page-client";

export const metadata: Metadata = {
  title: "JJMotobombas - Estoque",
};

const StockPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.enterprise) {
    redirect("/enterprise-form");
  }

  const stockData = await getStockData({
    enterpriseId: session.user.enterprise.id,
  });

  return <StockPageClient initialData={stockData} />;
};

export default StockPage;