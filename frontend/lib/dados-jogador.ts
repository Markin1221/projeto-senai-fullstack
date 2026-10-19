import type { EdicaoJogador, NovoJogador, Posicao } from "@/lib/tipos";

export interface DadosFormularioJogador {
  name: string;
  position: string;
  age: string;
  agility: string;
  pace: string;
  shooting: string;
  passing: string;
  dribbling: string;
  defending: string;
  physical: string;
  potential: string;
}

export type ErrosFormulario = Partial<
  Record<keyof DadosFormularioJogador, string>
>;

function validarInteiro(
  valor: string,
  minimo: number,
  maximo: number,
): string | undefined {
  const texto = valor.trim();
  if (texto === "") return "Campo obrigatório.";
  if (!/^\d+$/.test(texto)) return "Informe um número inteiro.";
  const numero = Number(texto);
  if (numero < minimo || numero > maximo)
    return `Informe um valor de ${minimo} a ${maximo}.`;
  return undefined;
}

function validarNome(nome: string): string | undefined {
  const texto = nome.trim();
  if (texto === "") return "Campo obrigatório.";
  if (texto.length < 3 || texto.length > 100)
    return "O nome deve ter de 3 a 100 caracteres.";
  return undefined;
}

function somenteComErro(erros: ErrosFormulario): ErrosFormulario {
  return Object.fromEntries(
    Object.entries(erros).filter(([, mensagem]) => mensagem),
  );
}

export function validarEdicao(dados: DadosFormularioJogador): ErrosFormulario {
  return somenteComErro({
    name: validarNome(dados.name),
    age: validarInteiro(dados.age, 16, 45),
    agility: validarInteiro(dados.agility, 1, 100),
  });
}

export function validarCadastro(
  dados: DadosFormularioJogador,
): ErrosFormulario {
  return somenteComErro({
    ...validarEdicao(dados),
    pace: validarInteiro(dados.pace, 1, 99),
    shooting: validarInteiro(dados.shooting, 1, 99),
    passing: validarInteiro(dados.passing, 1, 99),
    dribbling: validarInteiro(dados.dribbling, 1, 99),
    defending: validarInteiro(dados.defending, 1, 99),
    physical: validarInteiro(dados.physical, 1, 99),
    potential: validarInteiro(dados.potential, 1, 99),
  });
}

export function paraCorpoEdicao(dados: DadosFormularioJogador): EdicaoJogador {
  return {
    name: dados.name.trim(),
    position: dados.position as Posicao,
    age: Number(dados.age),
    agility: Number(dados.agility),
  };
}

export function paraCorpoCadastro(dados: DadosFormularioJogador): NovoJogador {
  return {
    ...paraCorpoEdicao(dados),
    pace: Number(dados.pace),
    shooting: Number(dados.shooting),
    passing: Number(dados.passing),
    dribbling: Number(dados.dribbling),
    defending: Number(dados.defending),
    physical: Number(dados.physical),
    potential: Number(dados.potential),
  };
}
