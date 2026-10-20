"use client";

import { useCallback } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { DuelosPartida } from "@/components/duelos-partida";
import { useDados } from "@/hooks/use-dados";
import { buscarPartida } from "@/lib/api";

export function DetalhePartida({ partidaId }: { partidaId: number }) {
  const carregar = useCallback(() => buscarPartida(partidaId), [partidaId]);
  const { dados, carregando, erro, recarregar } = useDados(carregar);

  if (erro) return <AlertaErro mensagem={erro} aoTentarDeNovo={recarregar} />;
  if (carregando || !dados) {
    return (
      <p className="text-sm text-muted-foreground">Carregando duelos...</p>
    );
  }
  return <DuelosPartida partida={dados} />;
}
