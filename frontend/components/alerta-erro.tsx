"use client";

import { Button } from "@/components/ui/button";

interface Props {
  mensagem: string;
  titulo?: string;
  aoTentarDeNovo?: () => void;
}

export function AlertaErro({ mensagem, titulo, aoTentarDeNovo }: Props) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
    >
      <div>
        {titulo && <p className="font-medium">{titulo}</p>}
        <p>{mensagem}</p>
      </div>
      {aoTentarDeNovo && (
        <Button variant="outline" size="sm" onClick={aoTentarDeNovo}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}
