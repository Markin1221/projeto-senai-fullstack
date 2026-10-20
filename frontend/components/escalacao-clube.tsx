"use client";

import { useCallback, useState } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { buscarEscalacao, mensagemDeErro, salvarEscalacao } from "@/lib/api";
import { FORMACOES, VAGAS_POR_FORMACAO } from "@/lib/dados-escalacao";
import { avisarSucesso } from "@/lib/avisos";
import { useDados } from "@/hooks/use-dados";
import { useEnvio } from "@/hooks/use-envio";
import type { Escalacao, Formacao, Jogador } from "@/lib/tipos";

interface Props {
  clubeId: number | string;
  elenco: Jogador[];
}

const classeSelect = "w-full rounded-md border bg-background px-3 py-2 text-sm";

export function EscalacaoClube({ clubeId, elenco }: Props) {
  const carregar = useCallback(() => buscarEscalacao(clubeId), [clubeId]);
  const { dados, carregando, erro, recarregar } = useDados<Escalacao>(carregar);
  const { enviando, executar } = useEnvio();
  const [escolhas, setEscolhas] = useState<string[]>([]);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [formacaoEscolhida, setFormacaoEscolhida] = useState<
    Formacao | "" | null
  >(null);
  const formacao: Formacao | "" = formacaoEscolhida ?? dados?.formation ?? "";

  const vagas = formacao ? VAGAS_POR_FORMACAO[formacao] : [];
  const completo = vagas.length > 0 && vagas.every((_, i) => escolhas[i]);

  function mudarFormacao(valor: string) {
    setFormacaoEscolhida(valor as Formacao | "");
    setEscolhas([]);
    setErroEnvio(null);
  }

  function escolher(indice: number, valor: string) {
    setEscolhas((atual) => {
      const copia = [...atual];
      copia[indice] = valor;
      return copia;
    });
  }

  function opcoesDaVaga(indice: number) {
    const permitidas = vagas[indice].posicoes;
    return elenco.filter(
      (j) =>
        permitidas.includes(j.position) &&
        j.condition !== "DOENTE" &&
        (String(j.id) === escolhas[indice] || !escolhas.includes(String(j.id))),
    );
  }

  async function salvar() {
    if (!formacao || !completo) return;
    setErroEnvio(null);
    await executar(async () => {
      try {
        await salvarEscalacao(clubeId, {
          formation: formacao,
          player_ids: escolhas.map(Number),
        });
        avisarSucesso("Escalação salva.");
        setEscolhas([]);
        recarregar();
      } catch (e) {
        setErroEnvio(mensagemDeErro(e));
      }
    });
  }

  if (carregando)
    return (
      <p className="text-sm text-muted-foreground">Carregando escalação...</p>
    );
  if (erro) return <AlertaErro mensagem={erro} />;

  return (
    <div className="space-y-6">
      {dados && !dados.complete && (
        <div
          role="alert"
          className="rounded-md border border-amber-500 bg-amber-50 p-3 text-sm text-amber-900"
        >
          Escalação incompleta: o clube não pode jogar partidas até escalar os 5
          titulares.
        </div>
      )}

      <section className="space-y-3">
        <h3 className="font-semibold">Escalar titulares</h3>
        <label className="block text-sm">
          Formação
          <select
            className={classeSelect}
            value={formacao}
            onChange={(e) => mudarFormacao(e.target.value)}
          >
            <option value="">Selecione...</option>
            {FORMACOES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        {vagas.map((vaga, i) => (
          <label key={vaga.rotulo} className="block text-sm">
            {vaga.rotulo}
            <select
              className={classeSelect}
              value={escolhas[i] ?? ""}
              onChange={(e) => escolher(i, e.target.value)}
            >
              <option value="">Selecione...</option>
              {opcoesDaVaga(i).map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name} ({j.position}
                  {j.condition === "MAL_CONDICIONADO"
                    ? ", mal condicionado"
                    : ""}
                  )
                </option>
              ))}
            </select>
          </label>
        ))}

        {erroEnvio && <AlertaErro mensagem={erroEnvio} />}

        <button
          type="button"
          onClick={salvar}
          disabled={!completo || enviando}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {enviando ? "Salvando..." : "Salvar escalação"}
        </button>
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold">
          Escalação atual {dados?.formation ? `(${dados.formation})` : ""}
        </h3>
        {dados && dados.players.length > 0 ? (
          <ul className="divide-y rounded-md border text-sm">
            {dados.players.map((j) => (
              <li key={j.id} className="flex justify-between px-3 py-2">
                <span>{j.name}</span>
                <span className="text-muted-foreground">{j.position}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Este clube ainda não tem escalação.
          </p>
        )}
      </section>
    </div>
  );
}
