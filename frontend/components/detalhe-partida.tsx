"use client";

import { ArrowLeft, CircleDot, HeartPulse } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { CampoPartida } from "@/components/campo-partida";
import { DuelosPartida } from "@/components/duelos-partida";
import { EscudoClube } from "@/components/escudo-clube";
import { useMigalhaFinal } from "@/components/migalha-final";
import { Skeleton } from "@/components/ui/skeleton";
import { useDados } from "@/hooks/use-dados";
import { buscarPartida, listarClubes } from "@/lib/api";
import { textoResultado } from "@/lib/dados-partida";
import { formatarDataHora } from "@/lib/formatar";
import type { Partida } from "@/lib/tipos";

function Placar({
  partida,
  siglas,
}: {
  partida: Partida;
  siglas: Map<number, string>;
}) {
  const { home, away } = partida;
  return (
    <section className="flex items-center gap-6 rounded-xl border bg-card px-6 py-5">
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="text-right">
          <p className="font-semibold">{home.club_name}</p>
          <p className="text-xs text-muted-foreground">
            Mandante · {home.formation}
          </p>
        </div>
        <EscudoClube grande sigla={siglas.get(home.club_id) ?? "—"} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-4xl font-bold tabular-nums">
          {home.goals} × {away.goals}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatarDataHora(partida.played_at)}
        </p>
        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
          {textoResultado(partida)}
        </span>
      </div>
      <div className="flex flex-1 items-center gap-3">
        <EscudoClube grande sigla={siglas.get(away.club_id) ?? "—"} />
        <div>
          <p className="font-semibold">{away.club_name}</p>
          <p className="text-xs text-muted-foreground">
            Visitante · {away.formation}
          </p>
        </div>
      </div>
    </section>
  );
}

export function DetalhePartida({ partidaId }: { partidaId: number }) {
  const carregar = useCallback(() => buscarPartida(partidaId), [partidaId]);
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  const carregarClubes = useCallback(() => listarClubes({ size: 100 }), []);
  const { dados: clubes } = useDados(carregarClubes);
  const siglas = useMemo(
    () => new Map((clubes ?? []).map((c) => [c.id, c.acronym])),
    [clubes],
  );

  useMigalhaFinal(
    dados
      ? `${dados.home.club_name} ${dados.home.goals} × ${dados.away.goals} ${dados.away.club_name}`
      : null,
  );

  return (
    <div className="space-y-4">
      <Link
        href="/partidas"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar para partidas
      </Link>

      {erro ? (
        <AlertaErro
          titulo="Não foi possível carregar a partida"
          mensagem={erro}
          aoTentarDeNovo={recarregar}
        />
      ) : carregando || !dados ? (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-[440px] w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <Placar partida={dados} siglas={siglas} />

          <section className="rounded-xl border bg-card p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">Em campo</h2>
                <p className="text-xs text-muted-foreground">
                  Titulares de cada clube na formação da partida e os valores
                  usados nos duelos, já com o efeito da condição.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <HeartPulse
                    aria-hidden="true"
                    className="size-3.5 text-[#b55200]"
                  />
                  Mal condicionado
                </span>
                <span className="flex items-center gap-1.5">
                  <CircleDot
                    aria-hidden="true"
                    className="size-3.5 text-success"
                  />
                  Gol no duelo
                </span>
              </div>
            </div>
            <CampoPartida partida={dados} />
          </section>

          <DuelosPartida partida={dados} siglas={siglas} />
        </>
      )}
    </div>
  );
}
