"use client";

import { useCallback, useMemo, useState } from "react";
import { CampoSelect, type OpcaoSelect } from "@/components/campo-select";
import { CartaoIndicador } from "@/components/cartao-indicador";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { useEnvio } from "@/hooks/use-envio";
import { baixarCsvDoClube, listarTransacoes } from "@/lib/api";
import { avisarErro, avisarSucesso } from "@/lib/avisos";
import { nomeDeArquivoSeguro, salvarArquivo } from "@/lib/download";
import {
  formatarDataHora,
  formatarMoeda,
  formatarVariacao,
} from "@/lib/formatar";
import type { Transacao } from "@/lib/tipos";

const TIPOS = [
  { valor: "COMPRA", rotulo: "Compra" },
  { valor: "VENDA", rotulo: "Venda" },
];

const COLUNAS: Coluna<Transacao>[] = [
  { titulo: "Data e hora", celula: (t) => formatarDataHora(t.created_at) },
  {
    titulo: "Tipo",
    celula: (t) => (
      <Badge variant={t.type === "COMPRA" ? "outline" : "secondary"}>
        {t.type === "COMPRA" ? "Compra" : "Venda"}
      </Badge>
    ),
  },
  { titulo: "Jogador", celula: (t) => t.player_name },
  { titulo: "Valor", celula: (t) => formatarMoeda(t.value), numerica: true },
  {
    titulo: "Taxa ou comissão",
    celula: (t) => formatarMoeda(t.fee),
    numerica: true,
  },
  { titulo: "Multa", celula: (t) => formatarMoeda(t.penalty), numerica: true },
  {
    titulo: "Lucro",
    celula: (t) => (t.profit === null ? "—" : formatarVariacao(t.profit)),
    numerica: true,
  },
  {
    titulo: "Variação do caixa",
    celula: (t) => formatarVariacao(t.cash_change),
    numerica: true,
  },
];

interface Props {
  clubeId: number;
  clubeNome: string;
}

export function HistoricoTransacoes({ clubeId, clubeNome }: Props) {
  const [tipos, setTipos] = useState<string[]>([]);
  const [jogador, setJogador] = useState("");
  const { enviando, executar } = useEnvio();

  const consulta = useMemo(
    () => ({ type: tipos.join(","), player_id: jogador }),
    [tipos, jogador],
  );
  const carregar = useCallback(
    () => listarTransacoes(clubeId, consulta),
    [clubeId, consulta],
  );
  const carregarTodas = useCallback(() => listarTransacoes(clubeId), [clubeId]);
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  const { dados: todas } = useDados(carregarTodas);

  const opcoesJogador = useMemo<OpcaoSelect[]>(() => {
    const nomes = new Map(
      (todas?.data ?? []).map((t) => [t.player_id, t.player_name]),
    );
    return [
      { valor: "", rotulo: "Todos os jogadores" },
      ...[...nomes]
        .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
        .map(([id, nome]) => ({ valor: String(id), rotulo: nome })),
    ];
  }, [todas]);

  const alternarTipo = (valor: string) =>
    setTipos((atual) =>
      TIPOS.map((t) => t.valor).filter((v) =>
        v === valor ? !atual.includes(v) : atual.includes(v),
      ),
    );

  const exportar = async () => {
    try {
      const arquivo = await executar(() => baixarCsvDoClube(clubeId, consulta));
      if (!arquivo) return;
      salvarArquivo(
        arquivo,
        `Histórico de ${nomeDeArquivoSeguro(clubeNome)}.csv`,
      );
      avisarSucesso("CSV exportado.");
    } catch (erroExportacao) {
      avisarErro(erroExportacao);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">Tipo</legend>
          <div className="flex gap-4">
            {TIPOS.map((tipo) => (
              <label
                key={tipo.valor}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={tipos.includes(tipo.valor)}
                  onChange={() => alternarTipo(tipo.valor)}
                />
                {tipo.rotulo}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="w-64">
          <CampoSelect
            rotulo="Jogador"
            opcoes={opcoesJogador}
            value={jogador}
            onChange={(e) => setJogador(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={exportar} disabled={enviando}>
          {enviando ? "Exportando…" : "Exportar CSV"}
        </Button>
      </div>

      <TabelaDados
        colunas={COLUNAS}
        linhas={dados?.data}
        carregando={carregando}
        erro={erro}
        vazio="Nenhuma compra ou venda encontrada."
        chave={(t) => t.id}
        aoTentarDeNovo={recarregar}
      />

      {dados && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <CartaoIndicador
            rotulo="Total pago em compras"
            valor={formatarMoeda(dados.summary.total_spent)}
          />
          <CartaoIndicador
            rotulo="Total recebido em vendas"
            valor={formatarMoeda(dados.summary.total_received)}
          />
          <CartaoIndicador
            rotulo="Total de taxas e comissões"
            valor={formatarMoeda(dados.summary.total_fees)}
          />
          <CartaoIndicador
            rotulo="Total de multas"
            valor={formatarMoeda(dados.summary.total_penalties)}
          />
          <CartaoIndicador
            rotulo="Lucro total"
            valor={formatarVariacao(dados.summary.total_profit)}
          />
        </div>
      )}
    </div>
  );
}
