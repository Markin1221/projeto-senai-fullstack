"use client";

import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { useDados } from "@/hooks/use-dados";
import { listarClubes } from "@/lib/api";
import { formatarMoeda } from "@/lib/formatar";
import type { Clube } from "@/lib/tipos";

const carregar = () => listarClubes();

const COLUNAS: Coluna<Clube>[] = [
  { titulo: "Clube", celula: (c) => `${c.name} (${c.acronym})` },
  { titulo: "Caixa", celula: (c) => formatarMoeda(c.cash), numerica: true },
  {
    titulo: "Valor do elenco",
    celula: (c) => formatarMoeda(c.squad_value),
    numerica: true,
  },
  {
    titulo: "Patrimônio",
    celula: (c) => formatarMoeda(c.net_worth),
    numerica: true,
  },
];

export default function PaginaClubes() {
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Clubes</h1>
      <TabelaDados
        colunas={COLUNAS}
        linhas={dados}
        carregando={carregando}
        erro={erro}
        vazio="Nenhum clube cadastrado."
        chave={(c) => c.id}
        aoTentarDeNovo={recarregar}
      />
    </section>
  );
}
