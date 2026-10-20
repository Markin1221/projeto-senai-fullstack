import type { Formacao, Jogador, Posicao } from "@/lib/tipos";

export type Setor = "gol" | "defesa" | "meio" | "ataque";

export interface Vaga {
  titulo: string;
  setor: Setor;
  posicoes: Posicao[];
}

const GOLEIRO: Vaga = { titulo: "Goleiro", setor: "gol", posicoes: ["GOL"] };
const DEFESA: Vaga = {
  titulo: "Defesa",
  setor: "defesa",
  posicoes: ["ZAG", "LAT"],
};
const MEIO: Vaga = { titulo: "Meio", setor: "meio", posicoes: ["MEI"] };
const ATAQUE: Vaga = { titulo: "Ataque", setor: "ataque", posicoes: ["ATA"] };

export const VAGAS_POR_FORMACAO: Record<Formacao, Vaga[]> = {
  "3-1": [GOLEIRO, DEFESA, DEFESA, DEFESA, ATAQUE],
  "2-2": [GOLEIRO, DEFESA, DEFESA, ATAQUE, ATAQUE],
  "2-1-1": [GOLEIRO, DEFESA, DEFESA, MEIO, ATAQUE],
  "1-2-1": [GOLEIRO, DEFESA, MEIO, MEIO, ATAQUE],
};

export const FORMACOES = Object.keys(VAGAS_POR_FORMACAO) as Formacao[];

export const DESCRICAO_FORMACAO: Record<Formacao, string> = {
  "3-1": "Defesa 3, ataque 1",
  "2-2": "Defesa 2, ataque 2",
  "2-1-1": "Defesa 2, meio 1, ataque 1",
  "1-2-1": "Defesa 1, meio 2, ataque 1",
};

export const rotuloVaga = (vaga: Vaga) => vaga.posicoes.join(" ou ");

/** Atributo de ataque de cada posição (RN20). */
const ATAQUE_POR_POSICAO: Record<Posicao, [string, keyof Jogador]> = {
  GOL: ["Defesa", "defending"],
  ZAG: ["Drible", "dribbling"],
  LAT: ["Drible", "dribbling"],
  MEI: ["Passe", "passing"],
  ATA: ["Finalização", "shooting"],
};

export interface AtributoUsado {
  rotulo: string;
  valor: number;
}

/**
 * Atributos que entram nos duelos (RN20): o goleiro e o 1º jogador de linha só
 * defendem; o 2º ataca e defende; o 3º e o 4º só atacam.
 */
export function atributosUsados(
  indiceDaVaga: number,
  jogador: Jogador,
): AtributoUsado[] {
  const defesa = { rotulo: "Defesa", valor: jogador.defending };
  const [rotuloAtaque, campoAtaque] = ATAQUE_POR_POSICAO[jogador.position];
  const ataque = { rotulo: rotuloAtaque, valor: Number(jogador[campoAtaque]) };

  if (indiceDaVaga <= 1) return [defesa];
  if (indiceDaVaga === 2) return [ataque, defesa];
  return [ataque];
}

/** Distribui os titulares salvos nas vagas da formação, na ordem do elenco. */
export function preencherVagas(
  formacao: Formacao,
  titulares: Jogador[],
): string[] {
  const restantes = [...titulares];
  return VAGAS_POR_FORMACAO[formacao].map((vaga) => {
    const indice = restantes.findIndex((j) =>
      vaga.posicoes.includes(j.position),
    );
    if (indice === -1) return "";
    const [escolhido] = restantes.splice(indice, 1);
    return String(escolhido.id);
  });
}

const LINHA_Y: Record<Setor, number> = {
  ataque: 18,
  meio: 43,
  defesa: 66,
  gol: 86,
};

/** Posição (x e y, em %) de cada vaga no campo, do goleiro ao ataque. */
export function posicoesNoCampo(formacao: Formacao) {
  const vagas = VAGAS_POR_FORMACAO[formacao];
  return vagas.map((vaga, indice) => {
    const total = vagas.filter((v) => v.setor === vaga.setor).length;
    const ordem = vagas
      .slice(0, indice + 1)
      .filter((v) => v.setor === vaga.setor).length;
    const colunas: Record<number, number[]> = {
      1: [50],
      2: [28, 72],
      3: [20, 50, 80],
    };
    return { x: colunas[total][ordem - 1], y: LINHA_Y[vaga.setor] };
  });
}
