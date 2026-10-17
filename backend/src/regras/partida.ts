import { Atributos, Condicao, Posicao } from './regras';

export type AtributoDuelo = 'shooting' | 'passing' | 'dribbling' | 'defending';
export type Lado = 'MANDANTE' | 'VISITANTE';
export type ResultadoPartida = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

export interface Titular {
  id: number;
  nome: string;
  posicao: Posicao;
  condicao: Condicao;
  atributos: Atributos;
}

export interface ParticipanteDuelo {
  id: number;
  nome: string;
  posicao: Posicao;
  condicao: Condicao;
  atributo: AtributoDuelo;
  valor: number;
}

export interface Duelo {
  ordem: number;
  lado: Lado; // quem ataca
  atacante: ParticipanteDuelo;
  defensor: ParticipanteDuelo;
  gol: boolean;
}

export interface Simulacao {
  golsMandante: number;
  golsVisitante: number;
  resultado: ResultadoPartida;
  duelos: Duelo[];
}

/** MAL_CONDICIONADO: x0,85 arredondado com o meio para cima (inteiros, sem float). */
export function aplicarCondicao(valor: number, condicao: Condicao): number {
  return condicao === 'MAL_CONDICIONADO'
    ? Math.floor((valor * 85 + 50) / 100)
    : valor;
}

export function atributoDeAtaque(posicao: Posicao): AtributoDuelo {
  if (posicao === 'ATA') return 'shooting';
  if (posicao === 'MEI') return 'passing';
  return 'dribbling'; // ZAG e LAT
}

export function resultadoDoPlacar(
  golsMandante: number,
  golsVisitante: number,
): ResultadoPartida {
  if (golsMandante > golsVisitante) return 'MANDANTE';
  if (golsMandante < golsVisitante) return 'VISITANTE';
  return 'EMPATE';
}

function participante(j: Titular, atributo: AtributoDuelo): ParticipanteDuelo {
  return {
    id: j.id,
    nome: j.nome,
    posicao: j.posicao,
    condicao: j.condicao,
    atributo,
    valor: aplicarCondicao(j.atributos[atributo], j.condicao),
  };
}

interface Time {
  goleiro: Titular;
  linha: Titular[]; // do 1º (mais recuado) ao 4º (mais avançado), na ordem do elenco
}

function separar(titulares: Titular[]): Time {
  const goleiro = titulares.find((t) => t.posicao === 'GOL');
  const linha = titulares.filter((t) => t.posicao !== 'GOL');
  if (!goleiro || linha.length !== 4) {
    throw new Error('O time precisa de 1 goleiro e 4 jogadores de linha.');
  }
  return { goleiro, linha };
}

function ataquesDe(
  lado: Lado,
  ataca: Time,
  defende: Time,
  primeiraOrdem: number,
): Duelo[] {
  const pares: [Titular, Titular][] = [
    [ataca.linha[3], defende.goleiro],
    [ataca.linha[2], defende.linha[0]],
    [ataca.linha[1], defende.linha[1]],
  ];
  return pares.map(([a, d], i) => {
    const atacante = participante(a, atributoDeAtaque(a.posicao));
    const defensor = participante(d, 'defending');
    return {
      ordem: primeiraOrdem + i,
      lado,
      atacante,
      defensor,
      gol: atacante.valor > defensor.valor,
    };
  });
}

/** Recebe os 5 titulares de cada lado, já na ordem do elenco. Sem banco. */
export function simularPartida(
  mandante: Titular[],
  visitante: Titular[],
): Simulacao {
  const casa = separar(mandante);
  const fora = separar(visitante);
  const duelos = [
    ...ataquesDe('MANDANTE', casa, fora, 1),
    ...ataquesDe('VISITANTE', fora, casa, 4),
  ];
  const golsMandante = duelos.filter(
    (d) => d.lado === 'MANDANTE' && d.gol,
  ).length;
  const golsVisitante = duelos.filter(
    (d) => d.lado === 'VISITANTE' && d.gol,
  ).length;
  return {
    golsMandante,
    golsVisitante,
    resultado: resultadoDoPlacar(golsMandante, golsVisitante),
    duelos,
  };
}
