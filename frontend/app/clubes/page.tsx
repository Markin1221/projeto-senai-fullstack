"use client";

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
      <Link
        href={`/clubes/${c.id}`}
        className="font-medium underline-offset-4 hover:underline"
      >
        {c.name}
      </Link>
    ),
  },
  { titulo: "Sigla", celula: (c) => c.acronym },
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
  const [ordem, setOrdem] = useState("name");
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(() => listarClubes({ sort: ordem }), [ordem]);
  const { dados, carregando, erro, recarregar } = useDados(carregar);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clubes</h1>
        <Button onClick={() => setCriando(true)}>Novo clube</Button>
      </div>

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
        vazio="Nenhum clube cadastrado. Crie o primeiro no botão acima."
        chave={(c) => c.id}
        aoTentarDeNovo={recarregar}
      />

      <Modal
        aberto={criando}
        titulo="Novo clube"
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
