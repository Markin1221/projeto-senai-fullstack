import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CascaApp } from "@/components/casca-app";
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
        <CascaApp>{children}</CascaApp>
        <Toaster richColors />
      </body>
    </html>
  );
}
