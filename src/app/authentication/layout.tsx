import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JJMotobombas",
};

export default function AuthenticationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {children}
    </div>
  );
}
