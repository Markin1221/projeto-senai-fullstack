import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BarraTopo } from "@/components/barra-topo";
import { BarraLateral } from "@/components/barra-lateral";
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
        <div className="flex min-h-screen bg-sidebar text-foreground">
          <BarraLateral />
          <main className="min-w-0 flex-1 p-2">
            <div className="min-h-full rounded-xl border bg-card shadow-sm">
              <BarraTopo />
              <div className="p-6">{children}</div>
            </div>
          </main>
        </div>
        <Toaster richColors />
      </body>
    </html>
  );
}
