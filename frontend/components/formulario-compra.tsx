"use client";

import { useState, type FormEvent } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { CampoFormulario } from "@/components/campo-formulario";
import { CampoSelect, type OpcaoSelect } from "@/components/campo-select";
import { Button } from "@/components/ui/button";
import { useEnvio } from "@/hooks/use-envio";
import { comprarJogador, mensagemDeErro } from "@/lib/api";
import {
  paraCorpoCompra,
  validarCompra,
  type DadosFormularioCompra,
  type ErrosCompra,
} from "@/lib/dados-compra";
import { formatarDataHora, formatarMoeda } from "@/lib/formatar";
import type { Clube, Jogador, ResultadoCompra } from "@/lib/tipos";

interface Props {
  jogador: Jogador;
  clubes: Clube[];
  aoSalvar: () => void;
  aoFechar: () => void;
}

export function FormularioCompra({
  jogador,
  clubes,
  aoSalvar,
  aoFechar,
}: Props) {
  const [dados, setDados] = useState<DadosFormularioCompra>({
    clube: "",
    fidelidade: "",
  });
  const [erros, setErros] = useState<ErrosCompra>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoCompra | null>(null);
  const { enviando, executar } = useEnvio();

  const opcoesClube: OpcaoSelect[] = [
    { valor: "", rotulo: "Escolha um clube" },
    ...clubes.map((c) => ({ valor: String(c.id), rotulo: c.name })),
  ];

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const encontrados = validarCompra(dados);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setErroApi(null);
    try {
      const comprado = await executar(() =>
        comprarJogador(jogador.id, paraCorpoCompra(dados)),
      );
      if (!comprado) return;
      aoSalvar();
      setResultado(comprado);
    } catch (erro) {
      setErroApi(mensagemDeErro(erro));
    }
  };

  if (resultado) {
    return (
      <div className="space-y-4">
        <p className="text-sm">
          Compra de <strong>{resultado.player_name}</strong> concluída.
        </p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Valor</dt>
            <dd>{formatarMoeda(resultado.value)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Taxa</dt>
            <dd>{formatarMoeda(resultado.fee)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Custo total</dt>
            <dd>{formatarMoeda(Math.abs(resultado.cash_change))}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Novo caixa</dt>
            <dd>{formatarMoeda(resultado.club_cash)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Fidelidade até</dt>
            <dd>{formatarDataHora(resultado.contract.loyalty_until)}</dd>
          </div>
        </dl>
        <div className="flex justify-end">
          <Button onClick={aoFechar}>Fechar</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {jogador.name} · valor de mercado {formatarMoeda(jogador.market_value)}
      </p>
      <CampoSelect
        rotulo="Clube"
        opcoes={opcoesClube}
        value={dados.clube}
        erro={erros.clube}
        onChange={(e) => setDados({ ...dados, clube: e.target.value })}
      />
      <CampoFormulario
        rotulo="Fim da fidelidade (horário de Brasília)"
        type="datetime-local"
        value={dados.fidelidade}
        erro={erros.fidelidade}
        onChange={(e) => setDados({ ...dados, fidelidade: e.target.value })}
      />

      {erroApi && <AlertaErro mensagem={erroApi} />}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={aoFechar}
          disabled={enviando}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando ? "Comprando…" : "Comprar"}
        </Button>
      </div>
    </form>
  );
}
