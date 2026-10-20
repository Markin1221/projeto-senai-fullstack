"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Label } from "@/components/ui/label";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

interface Props extends Omit<ComponentProps<"select">, "children"> {
  rotulo: string;
  opcoes: OpcaoSelect[];
  erro?: string;
  dica?: string;
  icone?: ReactNode;
}

export function CampoSelect({
  rotulo,
  opcoes,
  erro,
  dica,
  icone,
  ...selecao
}: Props) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      <div className="relative">
        {icone && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
            {icone}
          </span>
        )}
        <select
          id={id}
          aria-invalid={Boolean(erro)}
          className={`h-9 w-full rounded-lg border border-input bg-transparent pr-3 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50 ${icone ? "pl-9" : "pl-3"}`}
          {...selecao}
        >
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
      </div>
      {!erro && dica && <p className="text-xs text-muted-foreground">{dica}</p>}
      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </div>
  );
}
