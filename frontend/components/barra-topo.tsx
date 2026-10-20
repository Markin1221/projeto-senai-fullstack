"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const MIGALHAS: Record<string, [string, string]> = {
  jogadores: ["Mercado", "Jogadores"],
  clubes: ["Mercado", "Clubes"],
  partidas: ["Liga", "Partidas"],
  classificacao: ["Liga", "Classificação"],
};

export function BarraTopo() {
  const segmento = usePathname().split("/")[1] ?? "";
  const migalhas = MIGALHAS[segmento];

  return (
    <div className="flex h-14 items-center border-b px-6 text-sm">
      {migalhas && (
        <nav aria-label="Você está em" className="flex items-center gap-2">
          <span className="text-muted-foreground">{migalhas[0]}</span>
          <ChevronRight
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
          <span className="font-medium">{migalhas[1]}</span>
        </nav>
      )}
    </div>
  );
}
