"use client";

import { useState, type FormEvent } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { CampoFormulario } from "@/components/campo-formulario";
import { Button } from "@/components/ui/button";
import { useEnvio } from "@/hooks/use-envio";
import { criarClube, mensagemDeErro } from "@/lib/api";
import { avisarSucesso } from "@/lib/avisos";
import {
  paraCorpoClube,
  validarClube,
  type DadosFormularioClube,
  type ErrosClube,
} from "@/lib/dados-clube";

interface Props {
  aoSalvar: () => void;
  aoFechar: () => void;
}

export function FormularioClube({ aoSalvar, aoFechar }: Props) {
  const [dados, setDados] = useState<DadosFormularioClube>({
    name: "",
    acronym: "",
  });
  const [erros, setErros] = useState<ErrosClube>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const { enviando, executar } = useEnvio();

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const encontrados = validarClube(dados);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setErroApi(null);
    try {
      const criado = await executar(() => criarClube(paraCorpoClube(dados)));
      if (!criado) return;
      aoSalvar();
      aoFechar();
      avisarSucesso("Clube criado.", criado.name);
    } catch (erro) {
      setErroApi(mensagemDeErro(erro));
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <CampoFormulario
        rotulo="Nome"
        value={dados.name}
        erro={erros.name}
        onChange={(e) => setDados({ ...dados, name: e.target.value })}
      />
      <CampoFormulario
        rotulo="Sigla (3 letras)"
        maxLength={3}
        value={dados.acronym}
        erro={erros.acronym}
        onChange={(e) => setDados({ ...dados, acronym: e.target.value })}
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
          {enviando ? "Salvando…" : "Criar clube"}
        </Button>
      </div>
    </form>
  );
}
