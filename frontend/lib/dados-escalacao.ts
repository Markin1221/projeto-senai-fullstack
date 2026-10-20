import type { Formacao, Posicao } from "@/lib/tipos";

export interface Vaga {
  rotulo: string;
  posicoes: Posicao[];
}

const GOLEIRO: Vaga = { rotulo: "Goleiro", posicoes: ["GOL"] };
const defesa = (n: number): Vaga => ({
  rotulo: `Defesa ${n}`,
  posicoes: ["ZAG", "LAT"],
});
const meio = (n: number): Vaga => ({ rotulo: `Meio ${n}`, posicoes: ["MEI"] });
const ataque = (n: number): Vaga => ({
  rotulo: `Ataque ${n}`,
  posicoes: ["ATA"],
});

export const VAGAS_POR_FORMACAO: Record<Formacao, Vaga[]> = {
  "3-1": [GOLEIRO, defesa(1), defesa(2), defesa(3), ataque(1)],
  "2-2": [GOLEIRO, defesa(1), defesa(2), ataque(1), ataque(2)],
  "2-1-1": [GOLEIRO, defesa(1), defesa(2), meio(1), ataque(1)],
  "1-2-1": [GOLEIRO, defesa(1), meio(1), meio(2), ataque(1)],
};

export const FORMACOES = Object.keys(VAGAS_POR_FORMACAO) as Formacao[];
