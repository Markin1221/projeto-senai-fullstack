"use client";

import { ListOrdered, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { SeloSigla } from "@/components/selo-sigla";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { useDados } from "@/hooks/use-dados";
import { buscarClassificacao, listarClubes, listarPartidas } from "@/lib/api";
import { formatarDataHora } from "@/lib/formatar";
import type { LinhaClassificacao, Partida } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const ORDEM_DA_TABELA = [
  "Mais pontos",
  "Maior saldo de gols",
  "Mais gols marcados",
  "Nome do clube, de A a Z",
];

function criarColunas(
  siglas: Map<number, string>,
): Coluna<LinhaClassificacao>[] {
  return [
    {
      titulo: "#",
      celula: (l) => (
        <span
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-md text-xs font-semibold",
            l.position === 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {l.position}
        </span>
      ),
    },
    {
      titulo: "Clube",
      celula: (l) => (
        <Link
          href={`/clubes/${l.club_id}`}
          className="flex items-center gap-2 font-medium hover:underline"
        >
          <SeloSigla sigla={siglas.get(l.club_id) ?? "—"} />
          {l.club_name}
        </Link>
      ),
    },
    { titulo: "J", celula: (l) => l.played, numerica: true },
    { titulo: "V", celula: (l) => l.wins, numerica: true },
    { titulo: "E", celula: (l) => l.draws, numerica: true },
    { titulo: "D", celula: (l) => l.losses, numerica: true },
    { titulo: "GP", celula: (l) => l.goals_for, numerica: true },
    { titulo: "GC", celula: (l) => l.goals_against, numerica: true },
    {
      titulo: "SG",
      celula: (l) => formatarSaldo(l.goal_difference),
      numerica: true,
    },
    {
      titulo: "Pts",
      celula: (l) => <strong>{l.points}</strong>,
      numerica: true,
    },
  ];
}

const formatarSaldo = (saldo: number) =>
  saldo > 0 ? `+${saldo}` : saldo < 0 ? `−${Math.abs(saldo)}` : "0";

function LinhaPartida({ partida }: { partida: Partida }) {
  const { home, away } = partida;
  return (
    <li className="space-y-0.5 text-sm">
      <p className="text-xs text-muted-foreground">
        {formatarDataHora(partida.played_at)}
      </p>
      <p>
        <span className={cn(partida.result === "MANDANTE" && "font-semibold")}>
          {home.club_name}
        </span>{" "}
        <span className="tabular-nums">
          {home.goals} × {away.goals}
        </span>{" "}
        <span className={cn(partida.result === "VISITANTE" && "font-semibold")}>
          {away.club_name}
        </span>
      </p>
    </li>
  );
}

export default function PaginaClassificacao() {
  const carregar = useCallback(() => buscarClassificacao(), []);
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  const carregarClubes = useCallback(() => listarClubes({ size: 100 }), []);
  const { dados: clubes } = useDados(carregarClubes);
  const carregarPartidas = useCallback(() => listarPartidas(), []);
  const { dados: partidas } = useDados(carregarPartidas);

  const siglas = useMemo(
    () => new Map((clubes ?? []).map((c) => [c.id, c.acronym])),
    [clubes],
  );
  const colunas = useMemo(() => criarColunas(siglas), [siglas]);

  return (
    <section className="space-y-6">
      <CabecalhoPagina
        icone={ListOrdered}
        titulo="Classificação"
        descricao="Todos os clubes, com 3 pontos por vitória e 1 por empate."
      >
        <Link
          href="/partidas"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus aria-hidden="true" className="size-4" />
          Nova partida
        </Link>
      </CabecalhoPagina>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-xl border bg-card [&_thead]:bg-muted/50">
          <TabelaDados
            semBorda
            colunas={colunas}
            linhas={dados ?? undefined}
            carregando={carregando}
            erro={erro}
            aoTentarDeNovo={recarregar}
            tituloErro="Não foi possível carregar a classificação"
            vazio={{
              titulo: "Nenhum clube cadastrado",
              descricao:
                "A classificação mostra todos os clubes, mesmo os que ainda não jogaram.",
              icone: <ListOrdered />,
            }}
            chave={(l) => l.club_id}
          />
          <p className="border-t px-5 py-3 text-xs text-muted-foreground">
            J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols
            marcados · GC: gols sofridos · SG: saldo de gols · Pts: pontos
          </p>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border bg-card p-4">
            <h2 className="font-semibold">Últimas partidas</h2>
            <p className="text-xs text-muted-foreground">
              Da mais recente para a mais antiga.
            </p>
            {partidas && partidas.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhuma partida jogada ainda.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {(partidas ?? []).slice(0, 2).map((p) => (
                  <LinhaPartida key={p.id} partida={p} />
                ))}
              </ul>
            )}
            <Link
              href="/partidas"
              className="mt-3 inline-block text-sm font-medium hover:underline"
            >
              Ver todas as partidas →
            </Link>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="font-semibold">Ordem da tabela</h2>
            <p className="text-xs text-muted-foreground">
              Critérios de classificação, nesta ordem.
            </p>
            <ol className="mt-3 space-y-2 text-sm">
              {ORDEM_DA_TABELA.map((criterio, i) => (
                <li key={criterio} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-medium">
                    {i + 1}
                  </span>
                  {criterio}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </section>
  );
}
