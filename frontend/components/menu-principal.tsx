"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITENS = [
  { href: "/jogadores", rotulo: "Jogadores" },
  { href: "/clubes", rotulo: "Clubes" },
  { href: "/partidas", rotulo: "Partidas" },
  { href: "/classificacao", rotulo: "Classificação" },
];

export function MenuPrincipal() {
  const caminho = usePathname();
  return (
    <nav className="flex gap-1">
      {ITENS.map((item) => {
        const ativo = caminho.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium",
              ativo
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
