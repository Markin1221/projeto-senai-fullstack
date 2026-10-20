"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Aba {
  id: string;
  rotulo: string;
  icone?: LucideIcon;
  contagem?: number;
}

interface Props {
  abas: Aba[];
  ativa: string;
  aoMudar: (id: string) => void;
}

export function Abas({ abas, ativa, aoMudar }: Props) {
  return (
    <div role="tablist" className="flex gap-6 border-b">
      {abas.map((aba) => {
        const Icone = aba.icone;
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            onClick={() => aoMudar(aba.id)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium",
              selecionada
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {Icone && <Icone aria-hidden="true" className="size-4" />}
            {aba.rotulo}
            {aba.contagem !== undefined && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-normal tabular-nums">
                {aba.contagem}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
