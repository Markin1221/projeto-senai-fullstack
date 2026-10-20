"use client";

import { useState, type FormEvent } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { CampoFormulario } from "@/components/campo-formulario";
import { CampoCalculado } from "@/components/campo-calculado";
import { PreviaAtributos } from "@/components/previa-atributos";
import { SeletorPosicao } from "@/components/seletor-posicao";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnvio } from "@/hooks/use-envio";
import { cadastrarJogador, editarJogador, mensagemDeErro } from "@/lib/api";
import { avisarSucesso } from "@/lib/avisos";
import {
  paraCorpoCadastro,
  paraCorpoEdicao,
  validarCadastro,
  validarEdicao,
  type DadosFormularioJogador,
  type ErrosFormulario,
} from "@/lib/dados-jogador";
import { OPCOES_POSICAO } from "@/lib/filtros-jogadores";
import { formatarMoeda } from "@/lib/formatar";
import type { Jogador } from "@/lib/tipos";

const POSICOES = OPCOES_POSICAO.filter((o) => o.valor !== "");

const INDICADORES = [
  ["pace", "Velocidade"],
  ["shooting", "Finalização"],
  ["passing", "Passe"],
  ["dribbling", "Drible"],
  ["defending", "Defesa"],
  ["physical", "Físico"],
  ["potential", "Potencial"],
] as const;

const dadosIniciais = (jogador?: Jogador): DadosFormularioJogador => ({
  name: jogador?.name ?? "",
  position: jogador?.position ?? "GOL",
  age: jogador ? String(jogador.age) : "",
  agility: jogador ? String(jogador.agility) : "",
  pace: "",
  shooting: "",
  passing: "",
  dribbling: "",
  defending: "",
  physical: "",
  potential: "",
});

interface Props {
  jogador?: Jogador;
  aoSalvar: () => void;
  aoFechar: () => void;
}

export function FormularioJogador({ jogador, aoSalvar, aoFechar }: Props) {
  const [dados, setDados] = useState(dadosIniciais(jogador));
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [criado, setCriado] = useState<Jogador | null>(null);
  const { enviando, executar } = useEnvio();
  const posicaoTravada = jogador !== undefined && jogador.club_id !== null;

  const alterar = (campo: keyof DadosFormularioJogador, valor: string) =>
    setDados((atual) => ({ ...atual, [campo]: valor }));

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const encontrados = jogador ? validarEdicao(dados) : validarCadastro(dados);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setErroApi(null);
    try {
      const salvo = await executar(() =>
        jogador
          ? editarJogador(jogador.id, paraCorpoEdicao(dados))
          : cadastrarJogador(paraCorpoCadastro(dados)),
      );
      if (!salvo) return;
      aoSalvar();
      if (jogador) {
        avisarSucesso("Jogador atualizado.", salvo.name);
        aoFechar();
      } else {
        setCriado(salvo);
      }
    } catch (erro) {
      setErroApi(mensagemDeErro(erro));
    }
  };

  if (criado) {
    return (
      <div className="space-y-4">
        <p className="text-sm">
          Jogador <strong>{criado.name}</strong> cadastrado.
        </p>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Valor base</dt>
            <dd>{formatarMoeda(criado.base_value)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Overall</dt>
            <dd>{criado.overall}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Valor de mercado</dt>
            <dd>{formatarMoeda(criado.market_value)}</dd>
          </div>
        </dl>
        <div className="flex justify-end">
          <Button onClick={aoFechar}>Fechar</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <div className="space-y-5">
        <CampoFormulario
          rotulo="Nome"
          value={dados.name}
          erro={erros.name}
          dica="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
          onChange={(e) => alterar("name", e.target.value)}
        />

        <div className="space-y-1.5">
          <SeletorPosicao
            valor={dados.position}
            posicoes={POSICOES.map((o) => o.valor)}
            desabilitado={posicaoTravada}
            aoMudar={(valor) => alterar("position", valor)}
          />
          {posicaoTravada && (
            <p className="text-xs text-muted-foreground">
              Jogador com clube não muda de posição.
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <CampoFormulario
            rotulo="Idade"
            type="number"
            value={dados.age}
            erro={erros.age}
            dica="De 16 a 45 anos."
            onChange={(e) => alterar("age", e.target.value)}
          />
          <CampoFormulario
            rotulo="Agilidade"
            type="number"
            value={dados.agility}
            erro={erros.agility}
            dica="De 1 a 100 (até 85 com 35 anos ou mais)."
            onChange={(e) => alterar("agility", e.target.value)}
          />
          {!jogador && (
            <CampoCalculado
              rotulo="Valor base (moedas)"
              texto="Após salvar"
              dica="Calculado no cadastro."
            />
          )}
        </div>
      </div>

      {!jogador && (
        <section className="space-y-4 border-t pt-5">
          <div>
            <h3 className="font-semibold">Indicadores técnicos</h3>
            <p className="text-sm text-muted-foreground">
              Seis atributos e o potencial, de 1 a 99. Não mudam depois do
              cadastro; a soma dos seis atributos não pode passar de 480.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-[1fr_16rem]">
            <div className="grid grid-cols-4 gap-x-3 gap-y-4">
              {INDICADORES.map(([campo, rotulo]) => (
                <CampoFormulario
                  key={campo}
                  rotulo={rotulo}
                  type="number"
                  value={dados[campo]}
                  erro={erros[campo]}
                  dica={
                    campo === "potential"
                      ? "≥ maior atributo; igual a ele com 33+ anos"
                      : undefined
                  }
                  onChange={(e) => alterar(campo, e.target.value)}
                />
              ))}
              <CampoCalculado
                rotulo="Overall"
                texto="Após salvar"
                dica="Calculado automaticamente"
              />
            </div>
            <PreviaAtributos valores={dados} />
          </div>
        </section>
      )}

      {erroApi && <AlertaErro mensagem={erroApi} />}

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {!jogador && (
            <>
              <Info aria-hidden="true" className="size-3.5" />O jogador começa
              livre e Apto.
            </>
          )}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={aoFechar}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando
              ? "Salvando…"
              : jogador
                ? "Salvar alterações"
                : "Salvar jogador"}
          </Button>
        </div>
      </div>
    </form>
  );
}
