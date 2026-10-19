"use client";

import { useState, type FormEvent } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { CampoSelect } from "@/components/campo-select";
import { Button } from "@/components/ui/button";
import { useEnvio } from "@/hooks/use-envio";
import { alterarCondicao, mensagemDeErro } from "@/lib/api";
import { OPCOES_CONDICAO } from "@/lib/filtros-jogadores";
import { formatarMoeda } from "@/lib/formatar";
import type { Condicao, Jogador } from "@/lib/tipos";

const CONDICOES = OPCOES_CONDICAO.filter((o) => o.valor !== "");

interface Props {
  jogador: Jogador;
  aoSalvar: () => void;
  aoFechar: () => void;
}

export function FormularioCondicao({ jogador, aoSalvar, aoFechar }: Props) {
  const [condicao, setCondicao] = useState<string>(jogador.condition);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [atualizado, setAtualizado] = useState<Jogador | null>(null);
  const { enviando, executar } = useEnvio();

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErroApi(null);
    try {
      const resultado = await executar(() =>
        alterarCondicao(jogador.id, condicao as Condicao),
      );
      if (!resultado) return;
      aoSalvar();
      setAtualizado(resultado);
    } catch (erro) {
      setErroApi(mensagemDeErro(erro));
    }
  };

  if (atualizado) {
    return (
      <div className="space-y-4">
        <p className="text-sm">
          Novo valor de mercado de <strong>{atualizado.name}</strong>:{" "}
          <strong>{formatarMoeda(atualizado.market_value)}</strong>
        </p>
        <div className="flex justify-end">
          <Button onClick={aoFechar}>Fechar</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <p className="text-sm text-muted-foreground">{jogador.name}</p>
      <CampoSelect
        rotulo="Condição"
        opcoes={CONDICOES}
        value={condicao}
        onChange={(e) => setCondicao(e.target.value)}
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
          {enviando ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
