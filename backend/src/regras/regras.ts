import Decimal from 'decimal.js';
import { arredondar } from '../common/utils/dinheiro';

export type Posicao = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';
export type Condicao = 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';
export type Formacao = '3-1' | '2-2' | '2-1-1' | '1-2-1';

export interface Atributos {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

// Pesos de cada atributo por posição, em % (RN06). Cada linha soma 100.
const PESOS: Record<Posicao, Atributos> = {
  GOL: {
    pace: 10,
    shooting: 0,
    passing: 20,
    dribbling: 0,
    defending: 40,
    physical: 30,
  },
  ZAG: {
    pace: 10,
    shooting: 0,
    passing: 15,
    dribbling: 0,
    defending: 45,
    physical: 30,
  },
  LAT: {
    pace: 25,
    shooting: 0,
    passing: 20,
    dribbling: 15,
    defending: 25,
    physical: 15,
  },
  MEI: {
    pace: 10,
    shooting: 15,
    passing: 35,
    dribbling: 25,
    defending: 5,
    physical: 10,
  },
  ATA: {
    pace: 20,
    shooting: 40,
    passing: 10,
    dribbling: 20,
    defending: 0,
    physical: 10,
  },
};

const DESCONTO_POR_CONDICAO: Record<Condicao, number> = {
  APTO: 0,
  MAL_CONDICIONADO: 15,
  DOENTE: 30,
};

const TETO_DESCONTO_TOTAL = -40;
const PISO_VALOR = new Decimal(1);

/** RN06: soma dos atributos × peso da posição, dividida por 100, arredondada com meio para cima. */
export function calcularOverall(
  posicao: Posicao,
  atributos: Atributos,
): number {
  const pesos = PESOS[posicao];
  const soma = (Object.keys(pesos) as (keyof Atributos)[]).reduce(
    (total, chave) => total + atributos[chave] * pesos[chave],
    0,
  );
  return Math.floor((soma + 50) / 100);
}

/** RN06: valor base, calculado uma única vez, no cadastro. */
export function calcularValorBase(
  overall: number,
  potencial: number,
  idadeNoCadastro: number,
): Decimal {
  const pontosFaixa1 = Math.max(0, Math.min(overall, 60) - 40);
  const pontosFaixa2 = Math.max(0, Math.min(overall, 75) - 60);
  const pontosFaixa3 = Math.max(0, overall - 75);

  let parteDoOverall = new Decimal(pontosFaixa1)
    .times('0.5')
    .plus(new Decimal(pontosFaixa2).times(2))
    .plus(new Decimal(pontosFaixa3).times(6));

  if (idadeNoCadastro <= 21) {
    parteDoOverall = parteDoOverall.times(100 + potencial - overall).div(100);
  }

  const valor = arredondar(parteDoOverall);
  return valor.lessThan(PISO_VALOR) ? PISO_VALOR : valor;
}

/** RN02 e RN03: desconto por condição, ajustado pela agilidade (só quando não está APTO). */
function descontoPorCondicao(condicao: Condicao, agilidade: number): Decimal {
  const desconto = new Decimal(DESCONTO_POR_CONDICAO[condicao]);
  if (condicao === 'APTO') return desconto;
  if (agilidade >= 80) return desconto.div(2);
  if (agilidade <= 30) return desconto.plus(10);
  return desconto;
}

/** RN04: ajuste pela idade atual. */
function ajustePorIdade(idade: number): number {
  if (idade <= 21) return 10;
  if (idade >= 32) return -10;
  return 0;
}

/** RN05: valor de mercado, calculado a cada consulta. */
export function calcularValorMercado(
  valorBase: Decimal.Value,
  condicao: Condicao,
  agilidade: number,
  idade: number,
): Decimal {
  const percentualTotal = Decimal.max(
    new Decimal(ajustePorIdade(idade)).minus(
      descontoPorCondicao(condicao, agilidade),
    ),
    TETO_DESCONTO_TOTAL,
  );

  const valor = arredondar(
    new Decimal(valorBase).times(percentualTotal.plus(100)).div(100),
  );
  return valor.lessThan(PISO_VALOR) ? PISO_VALOR : valor;
}

export function posicoesFecham(
  formacao: Formacao,
  posicoes: Posicao[],
): boolean {
  const distribuicao: Record<
    Formacao,
    { defesa: number; meio: number; ataque: number }
  > = {
    '3-1': { defesa: 3, meio: 0, ataque: 1 },
    '2-2': { defesa: 2, meio: 0, ataque: 2 },
    '2-1-1': { defesa: 2, meio: 1, ataque: 1 },
    '1-2-1': { defesa: 1, meio: 2, ataque: 1 },
  };

  // A escalação precisa ter exatamente 5 jogadores.
  if (posicoes.length !== 5) return false;

  // Precisa ter exatamente 1 goleiro.
  const goleiros = posicoes.filter((p) => p === 'GOL').length;
  if (goleiros !== 1) return false;

  // Conta os jogadores de linha por setor.
  const defesa = posicoes.filter((p) => p === 'ZAG' || p === 'LAT').length;

  const meio = posicoes.filter((p) => p === 'MEI').length;
  const ataque = posicoes.filter((p) => p === 'ATA').length;

  const esperado = distribuicao[formacao];

  return (
    defesa === esperado.defesa &&
    meio === esperado.meio &&
    ataque === esperado.ataque
  );
}
