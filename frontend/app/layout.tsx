import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BarraTopo } from "@/components/barra-topo";
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
        <div className="flex min-h-screen bg-sidebar text-foreground">
          <aside className="w-60 shrink-0 space-y-6 border-r border-sidebar-border p-4">
            <div className="flex items-center gap-3 px-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground">
                P
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Passe</p>
                <p className="text-xs text-muted-foreground">Gestão da liga</p>
              </div>
            </div>
            <MenuPrincipal />
          </aside>
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
