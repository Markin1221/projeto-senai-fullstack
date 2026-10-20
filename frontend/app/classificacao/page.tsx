"use client";

import { useCallback, useMemo } from "react";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { useDados } from "@/hooks/use-dados";
import { buscarClassificacao } from "@/lib/api";
import type { LinhaClassificacao } from "@/lib/tipos";

function criarColunas(): Coluna<LinhaClassificacao>[] {
  return [
    { titulo: "Pos.", celula: (l) => l.position, numerica: true },
    { titulo: "Clube", celula: (l) => l.club_name },
    { titulo: "J", celula: (l) => l.played, numerica: true },
    { titulo: "V", celula: (l) => l.wins, numerica: true },
    { titulo: "E", celula: (l) => l.draws, numerica: true },
    { titulo: "D", celula: (l) => l.losses, numerica: true },
    { titulo: "GP", celula: (l) => l.goals_for, numerica: true },
    { titulo: "GC", celula: (l) => l.goals_against, numerica: true },
    { titulo: "SG", celula: (l) => l.goal_difference, numerica: true },
    {
      titulo: "Pontos",
      celula: (l) => <strong>{l.points}</strong>,
      numerica: true,
    },
  ];
}

export default function PaginaClassificacao() {
  const carregar = useCallback(() => buscarClassificacao(), []);
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  const colunas = useMemo(() => criarColunas(), []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Classificação</h1>
      <TabelaDados
        colunas={colunas}
        linhas={dados ?? undefined}
        carregando={carregando}
        erro={erro}
        aoTentarDeNovo={recarregar}
        vazio="Nenhum clube cadastrado ainda."
        chave={(l) => l.club_id}
      />
      <p className="text-xs text-muted-foreground">
        J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols pró · GC:
        gols contra · SG: saldo de gols
      </p>
    </section>
  );
}
