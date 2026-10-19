"use client";

import { useState } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { Button } from "@/components/ui/button";
import { useEnvio } from "@/hooks/use-envio";
import { mensagemDeErro, venderJogador } from "@/lib/api";
import {
  formatarDataHora,
  formatarMoeda,
  formatarVariacao,
} from "@/lib/formatar";
import type { JogadorDoElenco, ResultadoVenda } from "@/lib/tipos";

interface Props {
  jogador: JogadorDoElenco;
  aoSalvar: () => void;
  aoFechar: () => void;
}

export function ConfirmacaoVenda({ jogador, aoSalvar, aoFechar }: Props) {
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoVenda | null>(null);
  const { enviando, executar } = useEnvio();

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
        <p className="text-sm">
          Venda de <strong>{resultado.player_name}</strong> concluída.
        </p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Valor de compra</dt>
            <dd>{formatarMoeda(resultado.purchase_value)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Valor de venda</dt>
            <dd>{formatarMoeda(resultado.value)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Dias restantes</dt>
            <dd>{resultado.remaining_days}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              Multa ({resultado.penalty_rate}%)
            </dt>
            <dd>{formatarMoeda(resultado.penalty)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Lucro</dt>
            <dd>{formatarVariacao(resultado.profit)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Comissão</dt>
            <dd>{formatarMoeda(resultado.fee)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Crédito no caixa</dt>
            <dd>{formatarMoeda(resultado.cash_change)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Novo caixa</dt>
            <dd>{formatarMoeda(resultado.club_cash)}</dd>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Contrato</dt>
              <dd>{resultado.contract_status}</dd>
            </div>
          </div>
        </dl>
        <div className="flex justify-end">
          <Button onClick={aoFechar}>Fechar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        O jogador sai do elenco e volta a ficar livre.
      </p>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="font-medium">{jogador.name}</p>
          <p className="text-xs text-muted-foreground">
            {jogador.position} · {jogador.age} anos
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Valor de mercado</p>
          <p className="font-semibold">{formatarMoeda(jogador.market_value)}</p>
        </div>
      </div>

      <dl className="divide-y rounded-lg border text-sm">
        <div className="flex justify-between p-3">
          <dt className="text-muted-foreground">Valor de compra</dt>
          <dd>{formatarMoeda(jogador.contract.purchase_value)}</dd>
        </div>
        <div className="flex justify-between p-3">
          <dt className="text-muted-foreground">Fim da fidelidade</dt>
          <dd>{formatarDataHora(jogador.contract.loyalty_until)}</dd>
        </div>
        <div className="flex justify-between p-3">
          <dt className="text-muted-foreground">Dias restantes</dt>
          <dd>{jogador.contract.remaining_days}</dd>
        </div>
        <div className="flex justify-between p-3">
          <dt className="text-muted-foreground">% de multa se vender agora</dt>
          <dd>{jogador.contract.penalty_rate}%</dd>
        </div>
      </dl>

      <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        A venda é pelo valor de mercado do momento. Multa (teto de 10,00),
        lucro, comissão e crédito são calculados ao confirmar.
      </p>

      {erroApi && <AlertaErro mensagem={erroApi} />}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={aoFechar} disabled={enviando}>
          Cancelar
        </Button>
        <Button onClick={vender} disabled={enviando}>
          {enviando ? "Vendendo…" : "Confirmar venda"}
        </Button>
      </div>
    </div>
  );
}
