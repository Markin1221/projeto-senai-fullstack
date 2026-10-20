"use client";

import { Calendar, Clock, ShoppingCart, Shield } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { AvisoInformativo } from "@/components/aviso-informativo";
import { CampoSelect, type OpcaoSelect } from "@/components/campo-select";
import { ResumoJogador } from "@/components/resumo-jogador";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [clube, setClube] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const idData = useId();
  const idHora = useId();
  const fidelidade = data && hora ? `${data}T${hora}` : "";
  const dados: DadosFormularioCompra = { clube, fidelidade };
  const [erros, setErros] = useState<ErrosCompra>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoCompra | null>(null);
  const { enviando, executar } = useEnvio();

  const opcoesClube: OpcaoSelect[] = [
    { valor: "", rotulo: "Escolha um clube" },
    ...clubes.map((c) => ({
      valor: String(c.id),
      rotulo: `${c.name} (${c.acronym}) · caixa ${formatarMoeda(c.cash)}`,
    })),
  ];
  const clubeEscolhido = clubes.find((c) => String(c.id) === clube);

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
      <ResumoJogador jogador={jogador} />
      <CampoSelect
        rotulo="Clube comprador"
        icone={<Shield aria-hidden="true" className="size-4" />}
        opcoes={opcoesClube}
        value={clube}
        erro={erros.clube}
        dica={
          clubeEscolhido
            ? `Caixa atual: ${formatarMoeda(clubeEscolhido.cash)}. O custo total (valor + taxa) pode ir até 50% do caixa.`
            : undefined
        }
        onChange={(e) => setClube(e.target.value)}
      />
      <div className="space-y-1.5">
        <Label htmlFor={idData}>Fim da fidelidade</Label>
        <div className="grid grid-cols-[1fr_8rem] gap-3">
          <div className="relative">
            <Calendar
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={idData}
              type="date"
              className="pl-9"
              value={data}
              aria-invalid={Boolean(erros.fidelidade)}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div className="relative">
            <Clock
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={idHora}
              type="time"
              aria-label="Hora do fim da fidelidade"
              className="pl-9"
              value={hora}
              aria-invalid={Boolean(erros.fidelidade)}
              onChange={(e) => setHora(e.target.value)}
            />
          </div>
        </div>
        {erros.fidelidade ? (
          <p className="text-sm text-destructive">{erros.fidelidade}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Depois do momento da compra e até 1.095 dias. Horário de Brasília;
            enviado com o fuso (-03:00).
          </p>
        )}
      </div>

      <AvisoInformativo>
        A taxa é de 5% do valor de mercado, só quando ele passa de 30,00. Taxa,
        custo e novo caixa são calculados ao confirmar.
      </AvisoInformativo>

      {erroApi && <AlertaErro mensagem={erroApi} />}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={aoFechar}
          disabled={enviando}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          <ShoppingCart aria-hidden="true" />
          {enviando ? "Comprando…" : "Confirmar compra"}
        </Button>
      </div>
    </form>
  );
}
