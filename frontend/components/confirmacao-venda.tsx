"use client";

import { Check, HandCoins, TriangleAlert } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { AvisoInformativo } from "@/components/aviso-informativo";
import { ResumoJogador } from "@/components/resumo-jogador";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { useEnvio } from "@/hooks/use-envio";
import { buscarEscalacao, mensagemDeErro, venderJogador } from "@/lib/api";
import {
  formatarDataHora,
  formatarMoeda,
  formatarVariacao,
} from "@/lib/formatar";
import type { JogadorDoElenco, ResultadoVenda } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface Props {
  jogador: JogadorDoElenco;
  nomeDoClube?: string;
  aoSalvar: () => void;
  aoFechar: () => void;
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="font-medium tabular-nums">{children}</dd>
    </div>
  );
}

function PilulaTaxa({ taxa }: { taxa: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        taxa === 0
          ? "border-success-soft-border bg-success-soft text-success-soft-foreground"
          : "border-warning-soft-border bg-warning-soft text-warning-soft-foreground",
      )}
    >
      {taxa === 0 && <Check aria-hidden="true" className="size-3" />}
      {taxa}%
    </span>
  );
}

export function ConfirmacaoVenda({
  jogador,
  nomeDoClube,
  aoSalvar,
  aoFechar,
}: Props) {
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoVenda | null>(null);
  const { enviando, executar } = useEnvio();

  const carregarEscalacao = useCallback(
    () =>
      jogador.club_id === null
        ? Promise.resolve(null)
        : buscarEscalacao(jogador.club_id),
    [jogador.club_id],
  );
  const { dados: escalacao } = useDados(carregarEscalacao);
  const titular = escalacao?.players.some((p) => p.id === jogador.id) ?? false;

  const vender = async () => {
    setErroApi(null);
    try {
      const vendido = await executar(() => venderJogador(jogador.id));
      if (!vendido) return;
      aoSalvar();
      setResultado(vendido);
    } catch (erro) {
      setErroApi(mensagemDeErro(erro));
    }
  };

  if (resultado) {
    return (
      <div className="space-y-4">
        <p className="flex items-center gap-2 rounded-[10px] border border-success-soft-border bg-success-soft p-3 text-sm text-success-soft-foreground">
          <Check aria-hidden="true" className="size-4 shrink-0" />
          <span>
            Venda de <strong>{resultado.player_name}</strong> concluída.
          </span>
        </p>
        <dl className="divide-y rounded-[10px] border">
          <Linha rotulo="Valor de compra">
            {formatarMoeda(resultado.purchase_value)}
          </Linha>
          <Linha rotulo="Valor de venda">
            {formatarMoeda(resultado.value)}
          </Linha>
          <Linha rotulo="Dias restantes">{resultado.remaining_days}</Linha>
          <Linha rotulo="Multa">
            <span className="mr-2">
              <PilulaTaxa taxa={resultado.penalty_rate} />
            </span>
            {formatarMoeda(resultado.penalty)}
          </Linha>
          <Linha rotulo="Lucro">{formatarVariacao(resultado.profit)}</Linha>
          <Linha rotulo="Comissão">{formatarMoeda(resultado.fee)}</Linha>
          <Linha rotulo="Crédito no caixa">
            {formatarMoeda(resultado.cash_change)}
          </Linha>
          <Linha rotulo="Novo caixa">
            {formatarMoeda(resultado.club_cash)}
          </Linha>
          <Linha rotulo="Contrato">{resultado.contract_status}</Linha>
        </dl>
        <div className="flex justify-end border-t pt-4">
          <Button onClick={aoFechar}>Fechar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {titular && (
        <div
          role="status"
          className="flex gap-3 rounded-[10px] border border-warning-soft-border bg-warning-soft p-3 text-sm text-warning-soft-foreground"
        >
          <TriangleAlert
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          <div>
            <p className="font-medium">{jogador.name} é titular</p>
            <p>
              Ao vender, ele sai da escalação, e o {nomeDoClube ?? "clube"} só
              volta a jogar partidas depois de escalar de novo os 5 titulares.
            </p>
          </div>
        </div>
      )}

      <ResumoJogador jogador={jogador} />

      <dl className="divide-y rounded-[10px] border">
        <Linha rotulo="Valor de compra">
          {formatarMoeda(jogador.contract.purchase_value)}
        </Linha>
        <Linha rotulo="Fim da fidelidade">
          {formatarDataHora(jogador.contract.loyalty_until)}
        </Linha>
        <Linha rotulo="Dias restantes">{jogador.contract.remaining_days}</Linha>
        <Linha rotulo="% de multa se vender agora">
          <PilulaTaxa taxa={jogador.contract.penalty_rate} />
        </Linha>
      </dl>

      <AvisoInformativo>
        A venda é pelo valor de mercado do momento. Multa (teto de 10,00),
        lucro, comissão e crédito são calculados ao confirmar.
      </AvisoInformativo>

      {erroApi && <AlertaErro mensagem={erroApi} />}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={aoFechar} disabled={enviando}>
          Cancelar
        </Button>
        <Button onClick={vender} disabled={enviando}>
          <HandCoins aria-hidden="true" />
          {enviando ? "Vendendo…" : "Confirmar venda"}
        </Button>
      </div>
    </div>
  );
}
