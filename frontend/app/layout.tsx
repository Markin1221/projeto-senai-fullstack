import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { MenuPrincipal } from "@/components/menu-principal";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Passe",
  description: "Mercado de jogadores e liga de futebol",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} font-sans antialiased`}>
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <span className="text-lg font-semibold">Passe</span>
            <MenuPrincipal />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <Toaster richColors />
      </body>
    </html>
  );
}
