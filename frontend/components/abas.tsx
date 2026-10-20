"use client";

import { Button } from "@/components/ui/button";

export interface Aba {
  id: string;
  rotulo: string;
}

interface Props {
  abas: Aba[];
  ativa: string;
  aoMudar: (id: string) => void;
}

export function Abas({ abas, ativa, aoMudar }: Props) {
  return (
    <div role="tablist" className="flex gap-2 border-b pb-2">
      {abas.map((aba) => (
        <Button
          key={aba.id}
          role="tab"
          aria-selected={aba.id === ativa}
          variant={aba.id === ativa ? "default" : "ghost"}
          size="sm"
          onClick={() => aoMudar(aba.id)}
        >
          {aba.rotulo}
        </Button>
      ))}
    </div>
  );
}
