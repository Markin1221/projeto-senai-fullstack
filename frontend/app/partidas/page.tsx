"use client";

import { useCallback, useState } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { DuelosPartida } from "@/components/duelos-partida";
import { FormularioPartida } from "@/components/formulario-partida";
import { HistoricoPartidas } from "@/components/historico-partidas";
import { useDados } from "@/hooks/use-dados";
import { listarClubes } from "@/lib/api";
import type { Partida } from "@/lib/tipos";

export default function PaginaPartidas() {
  const carregar = useCallback(() => listarClubes({ size: 100 }), []);
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  const [partida, setPartida] = useState<Partida | null>(null);
  const [versao, setVersao] = useState(0);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Partidas</h1>

      {erro ? (
        <AlertaErro mensagem={erro} aoTentarDeNovo={recarregar} />
      ) : carregando ? (
        <p className="text-sm text-muted-foreground">Carregando clubes...</p>
      ) : (
        <FormularioPartida
          clubes={dados ?? []}
          aoJogar={(p) => {
            setPartida(p);
            setVersao((v) => v + 1);
          }}
        />
      )}

      {partida && <DuelosPartida partida={partida} />}
      <HistoricoPartidas clubes={dados ?? []} versao={versao} />
    </section>
  );
}
