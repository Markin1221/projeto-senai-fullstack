"use client";

import {
  Check,
  ClipboardCheck,
  Lock,
  Swords,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useState } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { AvatarIniciais } from "@/components/avatar-iniciais";
import { CampoEscalacao, MiniCampo } from "@/components/campo-escalacao";
import { SeloCondicao } from "@/components/selo-condicao";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { useEnvio } from "@/hooks/use-envio";
import { buscarEscalacao, mensagemDeErro, salvarEscalacao } from "@/lib/api";
import { avisarSucesso } from "@/lib/avisos";
import {
  DESCRICAO_FORMACAO,
  FORMACOES,
  VAGAS_POR_FORMACAO,
  atributosUsados,
  preencherVagas,
  rotuloVaga,
} from "@/lib/dados-escalacao";
import { NOMES_POSICAO } from "@/lib/formatar";
import type { Escalacao, Formacao, Jogador } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface Props {
  clubeId: number | string;
  nomeDoClube: string;
  elenco: Jogador[];
}

const classeSelect =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";

function listaDeNomes(nomes: string[]): string {
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

export function EscalacaoClube({ clubeId, nomeDoClube, elenco }: Props) {
  const carregar = useCallback(() => buscarEscalacao(clubeId), [clubeId]);
  const { dados, carregando, erro, recarregar } = useDados<Escalacao>(carregar);
  const { enviando, executar } = useEnvio();

  const [formacaoEscolhida, setFormacaoEscolhida] = useState<Formacao | null>(
    null,
  );
  const [escolhas, setEscolhas] = useState<string[] | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const formacao: Formacao = formacaoEscolhida ?? dados?.formation ?? "2-1-1";
  const vagas = VAGAS_POR_FORMACAO[formacao];
  const salvas =
    dados && dados.formation === formacao
      ? preencherVagas(formacao, dados.players)
      : [];
  const selecionadas = escolhas ?? salvas;
  const idsEscolhidos = vagas.map((_, i) => selecionadas[i] ?? "");
  const completo = idsEscolhidos.every((id) => id !== "");

  const porId = new Map(elenco.map((j) => [String(j.id), j]));
  const titulares = idsEscolhidos.map((id) => porId.get(id));
  const reservas = elenco.filter((j) => !idsEscolhidos.includes(String(j.id)));
  const malCondicionados = titulares.filter(
    (j): j is Jogador => j?.condition === "MAL_CONDICIONADO",
  );

  function mudarFormacao(nova: Formacao) {
    setFormacaoEscolhida(nova);
    setEscolhas(null);
    setErroEnvio(null);
  }

  function escolher(indice: number, valor: string) {
    const copia = [...idsEscolhidos];
    copia[indice] = valor;
    setEscolhas(copia);
    setErroEnvio(null);
  }

  function cancelar() {
    setFormacaoEscolhida(null);
    setEscolhas(null);
    setErroEnvio(null);
  }

  function candidatos(indice: number) {
    return elenco.filter(
      (j) =>
        vagas[indice].posicoes.includes(j.position) &&
        j.condition !== "DOENTE" &&
        (String(j.id) === idsEscolhidos[indice] ||
          !idsEscolhidos.includes(String(j.id))),
    );
  }

  async function salvar() {
    if (!completo) return;
    setErroEnvio(null);
    await executar(async () => {
      try {
        await salvarEscalacao(clubeId, {
          formation: formacao,
          player_ids: idsEscolhidos.map(Number),
        });
        avisarSucesso("Escalação salva", `Formação ${formacao}.`);
        setFormacaoEscolhida(null);
        setEscolhas(null);
        recarregar();
      } catch (e) {
        setErroEnvio(mensagemDeErro(e));
      }
    });
  }

  if (carregando) {
    return (
      <p className="text-sm text-muted-foreground">Carregando escalação...</p>
    );
  }
  if (erro) return <AlertaErro mensagem={erro} aoTentarDeNovo={recarregar} />;

  const incompleta = dados ? !dados.complete : false;

  return (
    <div className="space-y-5">
      {incompleta && (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-warning-soft-border bg-warning-soft p-4 text-sm text-warning-soft-foreground"
        >
          <TriangleAlert
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          <div>
            <p className="font-medium">
              Escalação incompleta: o {nomeDoClube} não pode jogar partidas
            </p>
            <p>
              {elenco.length < 5
                ? `O elenco tem ${elenco.length} ${elenco.length === 1 ? "jogador" : "jogadores"}, e a escalação precisa de 5: 1 goleiro e 4 jogadores de linha. Compre jogadores e salve a escalação com os 5 titulares.`
                : "Escolha um titular para cada vaga e salve a escalação com os 5 titulares."}
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-xl border">
          <div className="flex items-start justify-between gap-3 border-b p-5">
            <div>
              <h2 className="font-semibold">Titulares</h2>
              <p className="text-sm text-muted-foreground">
                1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar
                troca os 5 de uma vez.
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                incompleta || dados?.formation === null
                  ? "border-warning-soft-border bg-warning-soft text-warning-soft-foreground"
                  : "border-success-soft-border bg-success-soft text-success-soft-foreground",
              )}
            >
              {incompleta || dados?.formation === null ? (
                <TriangleAlert aria-hidden="true" className="size-3" />
              ) : (
                <ClipboardCheck aria-hidden="true" className="size-3" />
              )}
              {incompleta || dados?.formation === null
                ? "Incompleta"
                : "Completa"}
            </span>
          </div>

          <fieldset className="space-y-3 p-5">
            <legend className="font-medium">Formação</legend>
            <p className="-mt-2 text-sm text-muted-foreground">
              Os números contam os jogadores de linha de trás para frente. O
              goleiro fica fora da conta.
            </p>
            <div
              role="radiogroup"
              className="grid grid-cols-2 gap-3 xl:grid-cols-4"
            >
              {FORMACOES.map((f) => (
                <label
                  key={f}
                  className={cn(
                    "flex cursor-pointer gap-2 rounded-lg border bg-card p-3",
                    f === formacao
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50",
                  )}
                >
                  <MiniCampo formacao={f} />
                  <span className="space-y-0.5 text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      <input
                        type="radio"
                        name="formacao"
                        value={f}
                        checked={f === formacao}
                        onChange={() => mudarFormacao(f)}
                        className="size-3.5 accent-primary"
                      />
                      {f}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {DESCRICAO_FORMACAO[f]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="overflow-x-auto border-t">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-left">
                  <th className="px-5 py-3 font-normal">Vaga</th>
                  <th className="px-3 py-3 font-normal">Titular</th>
                  <th className="px-3 py-3 font-normal">Condição</th>
                  <th className="px-3 py-3 text-right font-normal">Overall</th>
                  <th className="px-3 py-3 font-normal">Atributos usados</th>
                </tr>
              </thead>
              <tbody>
                {vagas.map((vaga, i) => {
                  const lista = candidatos(i);
                  const escolhido = titulares[i];
                  return (
                    <tr key={i} className="border-t">
                      <td className="px-5 py-3 leading-tight">
                        <p className="font-medium">{vaga.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {rotuloVaga(vaga)}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          aria-label={`Titular da vaga ${vaga.titulo} ${i + 1}`}
                          className={classeSelect}
                          value={idsEscolhidos[i]}
                          disabled={lista.length === 0}
                          onChange={(e) => escolher(i, e.target.value)}
                        >
                          <option value="">
                            {lista.length === 0
                              ? `Sem ${rotuloVaga(vaga)} no elenco`
                              : "Selecione..."}
                          </option>
                          {lista.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.name} ({j.position})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        {escolhido && (
                          <SeloCondicao condicao={escolhido.condition} />
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">
                        {escolhido?.overall}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {escolhido &&
                          atributosUsados(i, escolhido).map((a) => (
                            <span key={a.rotulo} className="mr-3">
                              <span className="text-muted-foreground">
                                {a.rotulo}{" "}
                              </span>
                              <span className="font-semibold tabular-nums">
                                {a.valor}
                              </span>
                            </span>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {malCondicionados.length > 0 && (
            <div className="m-5 flex gap-3 rounded-lg border border-warning-soft-border bg-warning-soft p-3 text-sm text-warning-soft-foreground">
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <div>
                <p className="font-medium">
                  {listaDeNomes(malCondicionados.map((j) => j.name))}{" "}
                  {malCondicionados.length === 1 ? "está" : "estão"} mal{" "}
                  {malCondicionados.length === 1
                    ? "condicionado"
                    : "condicionados"}
                </p>
                <p>
                  Podem jogar, mas cada atributo vale 15% a menos durante a
                  partida.
                </p>
              </div>
            </div>
          )}

          {erroEnvio && (
            <div className="px-5 pb-4">
              <AlertaErro mensagem={erroEnvio} />
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t p-5">
            <p className="text-xs text-muted-foreground">
              {completo
                ? "A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar depois de escalar de novo."
                : "Escolha a formação e um titular para cada vaga para salvar."}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={cancelar}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={salvar}
                disabled={!completo || enviando}
              >
                <Check aria-hidden="true" className="size-4" />
                {enviando ? "Salvando…" : "Salvar escalação"}
              </Button>
            </div>
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border">
            <div className="border-b p-5">
              <h2 className="font-semibold">Em campo</h2>
              <p className="text-sm text-muted-foreground">
                Prévia da formação {formacao}
                {completo
                  ? ", do goleiro ao ataque."
                  : "; as vagas vazias ficam tracejadas."}
              </p>
            </div>
            <div className="p-4">
              <CampoEscalacao formacao={formacao} titulares={titulares} />
            </div>
            <p className="flex gap-2 border-t bg-muted/40 p-4 text-xs text-muted-foreground">
              <Swords aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              Na partida, atacam os 3 jogadores de linha mais avançados e
              defendem o goleiro e os 2 mais recuados. É gol quando o ataque é
              maior que a defesa.
            </p>
          </section>

          <section className="rounded-xl border">
            <div className="border-b p-5">
              <h2 className="font-semibold">Reservas</h2>
              <p className="text-sm text-muted-foreground">
                Jogadores do elenco fora da escalação.
              </p>
            </div>
            {reservas.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                Nenhuma reserva: os {elenco.length} jogadores do elenco estão
                escolhidos.
              </p>
            ) : (
              <ul className="divide-y">
                {reservas.map((j) => (
                  <li key={j.id} className="space-y-2 p-4">
                    <div className="flex items-center gap-3">
                      <AvatarIniciais nome={j.name} id={j.id} />
                      <div className="flex-1 leading-tight">
                        <p className="text-sm">{j.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {NOMES_POSICAO[j.position]}
                        </p>
                      </div>
                      <SeloCondicao condicao={j.condition} />
                    </div>
                    {j.condition === "DOENTE" && (
                      <p className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                        <Lock aria-hidden="true" className="size-3" />
                        Doente não pode ser escalado.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
