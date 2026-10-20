"use client";

import { Wallet } from "lucide-react";
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
        placeholder="Ex.: Águias FC"
        value={dados.name}
        erro={erros.name}
        dica="De 3 a 60 caracteres. O nome não pode repetir o de outro clube."
        onChange={(e) => setDados({ ...dados, name: e.target.value })}
      />
      <CampoFormulario
        rotulo="Sigla"
        placeholder="Ex.: AGU"
        maxLength={3}
        value={dados.acronym}
        erro={erros.acronym}
        dica="3 letras, que não podem repetir a de outro clube. Fica em maiúsculas."
        onChange={(e) => setDados({ ...dados, acronym: e.target.value })}
      />

      <p className="flex items-center gap-2 rounded-[10px] border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
        <Wallet aria-hidden="true" className="size-4 shrink-0" />O clube começa
        com 300,00 em caixa e sem jogadores.
      </p>

      {erroApi && (
        <AlertaErro
          titulo="Não foi possível criar o clube"
          mensagem={erroApi}
        />
      )}

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
          {enviando ? "Criando…" : "Criar clube"}
        </Button>
      </div>
    </form>
  );
}
