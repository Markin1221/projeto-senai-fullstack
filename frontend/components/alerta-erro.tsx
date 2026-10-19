"use client";

import { Button } from "@/components/ui/button";

interface Props {
  mensagem: string;
  aoTentarDeNovo?: () => void;
}

export function AlertaErro({ mensagem, aoTentarDeNovo }: Props) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
    >
      <span>{mensagem}</span>
      {aoTentarDeNovo && (
        <Button variant="outline" size="sm" onClick={aoTentarDeNovo}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}
