"use client";

import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { useDados } from "@/hooks/use-dados";
import { buscarClassificacao } from "@/lib/api";
import type { LinhaClassificacao } from "@/lib/tipos";

const carregar = () => buscarClassificacao();

const COLUNAS: Coluna<LinhaClassificacao>[] = [
  { titulo: "#", celula: (l) => l.position, numerica: true },
  { titulo: "Clube", celula: (l) => l.club_name },
  { titulo: "J", celula: (l) => l.played, numerica: true },
  { titulo: "V", celula: (l) => l.wins, numerica: true },
  { titulo: "E", celula: (l) => l.draws, numerica: true },
  { titulo: "D", celula: (l) => l.losses, numerica: true },
  { titulo: "GP", celula: (l) => l.goals_for, numerica: true },
  { titulo: "GC", celula: (l) => l.goals_against, numerica: true },
  { titulo: "SG", celula: (l) => l.goal_difference, numerica: true },
  { titulo: "Pts", celula: (l) => l.points, numerica: true },
];

export default function PaginaClassificacao() {
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Classificação</h1>
      <TabelaDados
        colunas={COLUNAS}
        linhas={dados}
        carregando={carregando}
        erro={erro}
        vazio="Nenhum clube cadastrado."
        chave={(l) => l.club_id}
        aoTentarDeNovo={recarregar}
      />
    </section>
  );
}
