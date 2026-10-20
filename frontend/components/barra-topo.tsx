"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMigalhaAtual } from "@/components/migalha-final";

const MIGALHAS: Record<string, [string, string]> = {
  jogadores: ["Mercado", "Jogadores"],
  clubes: ["Mercado", "Clubes"],
  partidas: ["Liga", "Partidas"],
  classificacao: ["Liga", "Classificação"],
};

function Separador() {
  return (
    <ChevronRight
      aria-hidden="true"
      className="size-3.5 text-muted-foreground"
    />
  );
}

export function BarraTopo() {
  const segmento = usePathname().split("/")[1] ?? "";
  const migalhas = MIGALHAS[segmento];
  const final = useMigalhaAtual();

  return (
    <div className="flex h-14 items-center border-b px-6 text-sm">
      {migalhas && (
        <nav aria-label="Você está em" className="flex items-center gap-2">
          <span className="text-muted-foreground">{migalhas[0]}</span>
          <Separador />
          {final ? (
            <>
              <Link
                href={`/${segmento}`}
                className="text-muted-foreground hover:underline"
              >
                {migalhas[1]}
              </Link>
              <Separador />
              <span className="font-medium">{final}</span>
            </>
          ) : (
            <span className="font-medium">{migalhas[1]}</span>
          )}
        </nav>
      )}
    </div>
  );
}
