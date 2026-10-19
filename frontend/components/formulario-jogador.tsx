"use client";

import { useState, type FormEvent } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { CampoFormulario } from "@/components/campo-formulario";
import { CampoSelect } from "@/components/campo-select";
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
  ["pace", "Velocidade (pace)"],
  ["shooting", "Finalização (shooting)"],
  ["passing", "Passe (passing)"],
  ["dribbling", "Drible (dribbling)"],
  ["defending", "Defesa (defending)"],
  ["physical", "Físico (physical)"],
  ["potential", "Potencial (potential)"],
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
    <form onSubmit={enviar} noValidate className="space-y-4">
      <CampoFormulario
        rotulo="Nome"
        value={dados.name}
        erro={erros.name}
        onChange={(e) => alterar("name", e.target.value)}
      />
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <CampoSelect
            rotulo="Posição"
            opcoes={POSICOES}
            value={dados.position}
            disabled={posicaoTravada}
            onChange={(e) => alterar("position", e.target.value)}
          />
          {posicaoTravada && (
            <p className="text-xs text-muted-foreground">
              Jogador com clube não muda de posição.
            </p>
          )}
        </div>
        <CampoFormulario
          rotulo="Idade"
          type="number"
          value={dados.age}
          erro={erros.age}
          onChange={(e) => alterar("age", e.target.value)}
        />
        <CampoFormulario
          rotulo="Agilidade"
          type="number"
          value={dados.agility}
          erro={erros.agility}
          onChange={(e) => alterar("agility", e.target.value)}
        />
      </div>

      {!jogador && (
        <div className="grid grid-cols-2 gap-3">
          {INDICADORES.map(([campo, rotulo]) => (
            <CampoFormulario
              key={campo}
              rotulo={rotulo}
              type="number"
              value={dados[campo]}
              erro={erros[campo]}
              onChange={(e) => alterar(campo, e.target.value)}
            />
          ))}
        </div>
      )}

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
