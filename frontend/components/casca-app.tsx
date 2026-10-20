"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BarraLateral } from "@/components/barra-lateral";
import { BarraTopo } from "@/components/barra-topo";
import { ProvedorMigalha } from "@/components/migalha-final";

/** Moldura do aplicativo: barra lateral e painel. A tela inicial fica sem ela. */
export function CascaApp({ children }: { children: ReactNode }) {
  if (usePathname() === "/") return <>{children}</>;

  return (
    <ProvedorMigalha>
      <div className="flex min-h-screen bg-sidebar text-foreground">
        <BarraLateral />
        <main className="min-w-0 flex-1 p-2">
          <div className="min-h-full rounded-xl border bg-card shadow-sm">
            <BarraTopo />
            <div className="p-6">{children}</div>
          </div>
        </main>
      </div>
    </ProvedorMigalha>
  );
}
