"use client";

import { Lock, TriangleAlert } from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { AvatarIniciais } from "@/components/avatar-iniciais";
import { SeloCondicao } from "@/components/selo-condicao";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { useEnvio } from "@/hooks/use-envio";
import { alterarCondicao, buscarEscalacao, mensagemDeErro } from "@/lib/api";
import { avisarSucesso } from "@/lib/avisos";
import { NOMES_POSICAO, formatarMoeda, rotuloCondicao } from "@/lib/formatar";
import type { Condicao, Jogador } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const OPCOES: { valor: Condicao; descricao: string }[] = [
  { valor: "APTO", descricao: "Sem desconto por condição." },
  {
    valor: "MAL_CONDICIONADO",
    descricao:
      "Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.",
  },
  {
    valor: "DOENTE",
    descricao: "Desconto de 30%, com o mesmo ajuste de agilidade.",
  },
];

interface Props {
  jogador: Jogador;
  nomeDoClube?: string;
  aoSalvar: () => void;
  aoFechar: () => void;
}

export function FormularioCondicao({
  jogador,
  nomeDoClube,
  aoSalvar,
  aoFechar,
}: Props) {
  const [condicao, setCondicao] = useState<Condicao>(jogador.condition);
  const [erroApi, setErroApi] = useState<string | null>(null);
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

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErroApi(null);
    try {
      const resultado = await executar(() =>
        alterarCondicao(jogador.id, condicao),
      );
      if (!resultado) return;
      aoSalvar();
      avisarSucesso(
        "Condição alterada",
        `${resultado.name} agora está ${rotuloCondicao(resultado.condition)}. Valor de mercado: ${formatarMoeda(resultado.market_value)}.`,
      );
      aoFechar();
    } catch (erro) {
      setErroApi(mensagemDeErro(erro));
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
        <AvatarIniciais nome={jogador.name} id={jogador.id} />
        <div className="flex-1 leading-tight">
          <p className="text-sm font-medium">{jogador.name}</p>
          <p className="text-xs text-muted-foreground">
            {jogador.position} · {NOMES_POSICAO[jogador.position]} ·{" "}
            {jogador.age} anos
          </p>
        </div>
        <SeloCondicao condicao={jogador.condition} />
      </div>

      <div role="radiogroup" aria-label="Condição" className="space-y-2">
        {OPCOES.map((opcao) => {
          const bloqueada =
            opcao.valor === "APTO" && jogador.condition === "DOENTE";
          return (
            <label
              key={opcao.valor}
              className={cn(
                "flex gap-3 rounded-lg border p-3",
                condicao === opcao.valor && "border-primary bg-primary/5",
                bloqueada
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:bg-muted/50",
              )}
            >
              <input
                type="radio"
                name="condicao"
                value={opcao.valor}
                checked={condicao === opcao.valor}
                disabled={bloqueada}
                onChange={() => setCondicao(opcao.valor)}
                className="mt-1 size-4 accent-primary"
              />
              <span className="space-y-0.5">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {rotuloCondicao(opcao.valor)}
                  {opcao.valor === jogador.condition && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-normal">
                      Atual
                    </span>
                  )}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {opcao.descricao}
                </span>
                {bloqueada && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock aria-hidden="true" className="size-3" />
                    De Doente não passa direto para Apto.
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {titular && condicao === "DOENTE" && (
        <div
          role="status"
          className="flex gap-3 rounded-lg border border-warning-soft-border bg-warning-soft p-3 text-sm text-warning-soft-foreground"
        >
          <TriangleAlert
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          <div>
            <p className="font-medium">{jogador.name} é titular</p>
            <p>
              Ao passar a Doente, ele sai da escalação
              {nomeDoClube
                ? `, e o ${nomeDoClube} só volta a jogar partidas depois de escalar de novo os 5 titulares.`
                : ", e o clube só volta a jogar partidas depois de escalar de novo os 5 titulares."}
            </p>
          </div>
        </div>
      )}

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
          {enviando ? "Salvando…" : "Salvar condição"}
        </Button>
      </div>
    </form>
  );
}
