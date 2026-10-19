"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { CartaoIndicador } from "@/components/cartao-indicador";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Badge } from "@/components/ui/badge";
import { useDados } from "@/hooks/use-dados";
import { buscarClube } from "@/lib/api";
import {
  formatarDataHora,
  formatarMoeda,
  rotuloCondicao,
} from "@/lib/formatar";
import type { JogadorDoElenco } from "@/lib/tipos";

const COLUNAS: Coluna<JogadorDoElenco>[] = [
  { titulo: "Nome", celula: (j) => j.name },
  { titulo: "Posição", celula: (j) => j.position },
  { titulo: "Overall", celula: (j) => j.overall, numerica: true },
  {
    titulo: "Condição",
    celula: (j) => (
      <Badge variant={j.condition === "APTO" ? "secondary" : "outline"}>
        {rotuloCondicao(j.condition)}
      </Badge>
    ),
  },
  {
    titulo: "Valor de mercado",
    celula: (j) => formatarMoeda(j.market_value),
    numerica: true,
  },
  {
    titulo: "Valor de compra",
    celula: (j) => formatarMoeda(j.contract.purchase_value),
    numerica: true,
  },
  {
    titulo: "Fidelidade até",
    celula: (j) => formatarDataHora(j.contract.loyalty_until),
  },
  {
    titulo: "Dias restantes",
    celula: (j) => j.contract.remaining_days,
    numerica: true,
  },
  {
    titulo: "Multa",
    celula: (j) => `${j.contract.penalty_rate}%`,
    numerica: true,
  },
];

export default function PaginaClube() {
  const { id } = useParams<{ id: string }>();
  const carregar = useCallback(() => buscarClube(id), [id]);
  const { dados: clube, carregando, erro, recarregar } = useDados(carregar);

  return (
    <section className="space-y-4">
      <Link
        href="/clubes"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Voltar para clubes
      </Link>

      {erro ? (
        <AlertaErro mensagem={erro} aoTentarDeNovo={recarregar} />
      ) : (
        <>
          <h1 className="text-2xl font-semibold">
            {clube ? `${clube.name} (${clube.acronym})` : "Clube"}
          </h1>

          <div className="grid grid-cols-3 gap-3">
            <CartaoIndicador
              rotulo="Caixa"
              valor={clube ? formatarMoeda(clube.cash) : "—"}
            />
            <CartaoIndicador
              rotulo="Valor do elenco"
              valor={clube ? formatarMoeda(clube.squad_value) : "—"}
            />
            <CartaoIndicador
              rotulo="Patrimônio"
              valor={clube ? formatarMoeda(clube.net_worth) : "—"}
            />
          </div>

          <h2 className="text-lg font-semibold">Elenco</h2>
          <TabelaDados
            colunas={COLUNAS}
            linhas={clube?.players}
            carregando={carregando}
            vazio="Este clube ainda não tem jogadores."
            chave={(j) => j.id}
          />
        </>
      )}
    </section>
  );
}
