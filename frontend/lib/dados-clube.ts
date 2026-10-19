import type { NovoClube } from "@/lib/tipos";

export interface DadosFormularioClube {
  name: string;
  acronym: string;
}

export type ErrosClube = Partial<Record<keyof DadosFormularioClube, string>>;

export function validarClube(dados: DadosFormularioClube): ErrosClube {
  const erros: ErrosClube = {};

  const nome = dados.name.trim();
  if (nome === "") erros.name = "Campo obrigatório.";
  else if (nome.length < 3 || nome.length > 60)
    erros.name = "O nome deve ter de 3 a 60 caracteres.";

  const sigla = dados.acronym.trim();
  if (sigla === "") erros.acronym = "Campo obrigatório.";
  else if (!/^[A-Za-z]{3}$/.test(sigla))
    erros.acronym = "A sigla deve ter 3 letras.";

  return erros;
}

export function paraCorpoClube(dados: DadosFormularioClube): NovoClube {
  return {
    name: dados.name.trim(),
    acronym: dados.acronym.trim().toUpperCase(),
  };
}
