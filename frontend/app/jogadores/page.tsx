"use client";

import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Badge } from "@/components/ui/badge";
import { useDados } from "@/hooks/use-dados";
import { listarJogadores } from "@/lib/api";
import { formatarMoeda, rotuloCondicao } from "@/lib/formatar";
import type { Jogador } from "@/lib/tipos";

const carregar = () => listarJogadores({ page: 1, limit: 10 });

const COLUNAS: Coluna<Jogador>[] = [
  { titulo: "Nome", celula: (j) => j.name },
  { titulo: "Posição", celula: (j) => j.position },
  { titulo: "Overall", celula: (j) => j.overall, numerica: true },
  { titulo: "Agilidade", celula: (j) => j.agility, numerica: true },
  { titulo: "Idade", celula: (j) => j.age, numerica: true },
  {
    titulo: "Condição",
    celula: (j) => (
      <Badge variant={j.condition === "APTO" ? "secondary" : "outline"}>
        {rotuloCondicao(j.condition)}
      </Badge>
    ),
  },
  {
    titulo: "Valor base",
    celula: (j) => formatarMoeda(j.base_value),
    numerica: true,
  },
  {
    titulo: "Valor de mercado",
    celula: (j) => formatarMoeda(j.market_value),
    numerica: true,
  },
  {
    titulo: "Clube",
    celula: (j) => (j.club_id === null ? "Livre" : `#${j.club_id}`),
  },
];

export default function PaginaJogadores() {
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Jogadores</h1>
      <TabelaDados
        colunas={COLUNAS}
        linhas={dados?.data}
        carregando={carregando}
        erro={erro}
        vazio="Nenhum jogador cadastrado."
        chave={(j) => j.id}
        aoTentarDeNovo={recarregar}
      />
    </section>
  );
}
