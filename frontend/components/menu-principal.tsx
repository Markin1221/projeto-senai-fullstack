"use client";

import { ListOrdered, Shield, Swords, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const GRUPOS = [
  {
    titulo: "Mercado",
    itens: [
      { href: "/jogadores", rotulo: "Jogadores", icone: Users },
      { href: "/clubes", rotulo: "Clubes", icone: Shield },
    ],
  },
  {
    titulo: "Liga",
    itens: [
      { href: "/partidas", rotulo: "Partidas", icone: Swords },
      { href: "/classificacao", rotulo: "Classificação", icone: ListOrdered },
    ],
  },
];

export function MenuPrincipal() {
  const caminho = usePathname();
  return (
    <nav className="space-y-5">
      {GRUPOS.map((grupo) => (
        <div key={grupo.titulo} className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
            {grupo.titulo}
          </p>
          {grupo.itens.map((item) => {
            const ativo = caminho.startsWith(item.href);
            const Icone = item.icone;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  ativo
                    ? "border bg-card font-medium shadow-xs"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icone aria-hidden="true" className="size-4" />
                {item.rotulo}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
