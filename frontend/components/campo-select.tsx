"use client";

import { useId, type ComponentProps } from "react";
import { Label } from "@/components/ui/label";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

interface Props extends Omit<ComponentProps<"select">, "children"> {
  rotulo: string;
  opcoes: OpcaoSelect[];
  erro?: string;
}

export function CampoSelect({ rotulo, opcoes, erro, ...selecao }: Props) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      <select
        id={id}
        aria-invalid={Boolean(erro)}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
        {...selecao}
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </div>
  );
}
