"use client";

import { ChevronRight, Shield, Swords } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { SeloSigla } from "@/components/selo-sigla";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { listarPartidas } from "@/lib/api";
import { textoResultado } from "@/lib/dados-partida";
import { formatarData, formatarHora } from "@/lib/formatar";
import type { Clube, Partida } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface Props {
  clubes: Clube[];
  versao: number;
  aoVerDuelos: (partida: Partida) => void;
}

function criarColunas(
  siglas: Map<number, string>,
  aoAbrir: (p: Partida) => void,
): Coluna<Partida>[] {
  return [
    {
      titulo: "Data e hora",
      celula: (p) => (
        <span className="whitespace-nowrap">
          {formatarData(p.played_at)}{" "}
          <span className="text-muted-foreground">
            {formatarHora(p.played_at)}
          </span>
        </span>
      ),
    },
    {
      titulo: "Mandante",
      celula: (p) => (
        <span className="flex items-center gap-2">
          <span className={cn(p.result === "MANDANTE" && "font-semibold")}>
            {p.home.club_name}
          </span>
          <SeloSigla sigla={siglas.get(p.home.club_id) ?? "—"} />
        </span>
      ),
    },
    {
      titulo: "Placar",
      celula: (p) => (
        <span className="font-semibold">
          {p.home.goals} × {p.away.goals}
        </span>
      ),
      numerica: true,
    },
    {
      titulo: "Visitante",
      celula: (p) => (
        <span className="flex items-center gap-2">
          <SeloSigla sigla={siglas.get(p.away.club_id) ?? "—"} />
          <span className={cn(p.result === "VISITANTE" && "font-semibold")}>
            {p.away.club_name}
          </span>
        </span>
      ),
    },
    {
      titulo: "Resultado",
      celula: (p) => (
        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap">
          {textoResultado(p)}
        </span>
      ),
    },
    {
      titulo: "",
      celula: (p) => (
        <Button variant="outline" size="sm" onClick={() => aoAbrir(p)}>
          Ver duelos
          <ChevronRight aria-hidden="true" />
        </Button>
      ),
    },
  ];
}

export function HistoricoPartidas({ clubes, versao, aoVerDuelos }: Props) {
  const [clubeId, setClubeId] = useState("");

  const carregar = useCallback(
    () => listarPartidas(clubeId || undefined),
    // versao força nova consulta depois de uma partida jogada
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clubeId, versao],
  );
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  const siglas = useMemo(
    () => new Map(clubes.map((c) => [c.id, c.acronym])),
    [clubes],
  );
  const colunas = useMemo(
    () => criarColunas(siglas, aoVerDuelos),
    [siglas, aoVerDuelos],
  );

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <h2 className="font-semibold">Histórico de partidas</h2>
          <p className="text-xs text-muted-foreground">
            Da mais recente para a mais antiga.
          </p>
        </div>
        <div className="relative">
          <Shield
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <select
            aria-label="Clube"
            className="h-9 w-52 rounded-lg border border-input bg-card pr-3 pl-9 text-sm"
            value={clubeId}
            onChange={(e) => setClubeId(e.target.value)}
          >
            <option value="">Clube: todos</option>
            {clubes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t [&_thead]:bg-muted/50">
        <TabelaDados
          semBorda
          colunas={colunas}
          linhas={dados ?? undefined}
          carregando={carregando}
          erro={erro}
          aoTentarDeNovo={recarregar}
          tituloErro="Não foi possível carregar as partidas"
          vazio={{
            titulo: "Nenhuma partida jogada",
            descricao:
              "Escale os titulares de dois clubes e jogue a primeira partida.",
            icone: <Swords />,
          }}
          chave={(p) => p.id}
        />
      </div>

      {dados && dados.length > 0 && (
        <p className="border-t px-5 py-3 text-sm text-muted-foreground">
          {dados.length} {dados.length === 1 ? "partida" : "partidas"}
        </p>
      )}
    </section>
  );
}
