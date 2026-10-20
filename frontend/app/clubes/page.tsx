"use client";

import { ChevronRight, Plus, Shield } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { useCallback, useState } from "react";
import { CampoSelect, type OpcaoSelect } from "@/components/campo-select";
import { FormularioClube } from "@/components/formulario-clube";
import { Modal } from "@/components/modal";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { listarClubes } from "@/lib/api";
import { formatarMoeda } from "@/lib/formatar";
import type { Clube } from "@/lib/tipos";
import Link from "next/link";

const OPCOES_ORDEM_CLUBES: OpcaoSelect[] = [
  { valor: "name", rotulo: "Nome" },
  { valor: "net_worth_desc", rotulo: "Patrimônio (maior primeiro)" },
  { valor: "net_worth_asc", rotulo: "Patrimônio (menor primeiro)" },
];

const COLUNAS: Coluna<Clube>[] = [
  {
    titulo: "Clube",
    celula: (c) => (
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-md border bg-muted text-xs font-semibold"
        >
          {c.acronym}
        </span>
        <Link
          href={`/clubes/${c.id}`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {c.name}
        </Link>
      </span>
    ),
  },
  {
    titulo: "Sigla",
    celula: (c) => (
      <span className="rounded-md border px-1.5 py-0.5 text-xs font-semibold">
        {c.acronym}
      </span>
    ),
  },
  { titulo: "Caixa", celula: (c) => formatarMoeda(c.cash), numerica: true },
  {
    titulo: "Valor do elenco",
    celula: (c) => formatarMoeda(c.squad_value),
    numerica: true,
  },
  {
    titulo: "Patrimônio",
    celula: (c) => <strong>{formatarMoeda(c.net_worth)}</strong>,
    numerica: true,
  },
  {
    titulo: "Ações",
    celula: (c) => (
      <Link
        href={`/clubes/${c.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium"
      >
        Ver clube
        <ChevronRight aria-hidden="true" className="size-4" />
      </Link>
    ),
  },
];

export default function PaginaClubes() {
  const [ordem, setOrdem] = useState("name");
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(() => listarClubes({ sort: ordem }), [ordem]);
  const { dados, carregando, erro, recarregar } = useDados(carregar);

  return (
    <section className="space-y-4">
      <CabecalhoPagina
        icone={Shield}
        titulo="Clubes"
        descricao="Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes."
      >
        <Button onClick={() => setCriando(true)}>
          <Plus aria-hidden="true" className="size-4" />
          Novo clube
        </Button>
      </CabecalhoPagina>

      <div className="max-w-xs">
        <CampoSelect
          rotulo="Ordenar por"
          opcoes={OPCOES_ORDEM_CLUBES}
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
        />
      </div>

      <TabelaDados
        colunas={COLUNAS}
        linhas={dados}
        carregando={carregando}
        erro={erro}
        tituloErro="Não foi possível carregar os clubes"
        vazio={{
          titulo: "Nenhum clube cadastrado",
          descricao: "Crie o primeiro clube para começar.",
          icone: <Shield />,
          acao: (
            <Button onClick={() => setCriando(true)}>
              <Plus aria-hidden="true" className="size-4" />
              Novo clube
            </Button>
          ),
        }}
        chave={(c) => c.id}
        aoTentarDeNovo={recarregar}
      />

      <Modal
        aberto={criando}
        titulo="Novo clube"
        descricao="Dê um nome e uma sigla de 3 letras ao clube."
        largura="max-w-[480px]"
        aoFechar={() => setCriando(false)}
      >
        <FormularioClube
          aoSalvar={recarregar}
          aoFechar={() => setCriando(false)}
        />
      </Modal>
    </section>
  );
}
