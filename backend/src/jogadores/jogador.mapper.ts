import type { jogadores, Posicoes } from '@prisma/client';
import Decimal from 'decimal.js';
import { compararNomes } from '../common/utils/texto';
import { calcularOverall, calcularValorMercado } from '../regras/regras';

export const ORDEM_POSICAO: Record<Posicoes, number> = {
  GOL: 0,
  ZAG: 1,
  LAT: 2,
  MEI: 3,
  ATA: 4,
};

/** Posição (GOL a ATA), depois nome, depois id (RN07 e RN11). */
export function compararElenco(a: jogadores, b: jogadores): number {
  return (
    ORDEM_POSICAO[a.posicao] - ORDEM_POSICAO[b.posicao] ||
    compararNomes(a.nome, b.nome) ||
    a.id - b.id
  );
}

export function valorMercadoDoJogador(jogador: jogadores): Decimal {
  return calcularValorMercado(
    jogador.valor_base.toString(),
    jogador.condicao,
    jogador.agilidade,
    jogador.idade,
  );
}

/** Formato de resposta do jogador (snake_case), reutilizado por todos os endpoints. */
export function paraResposta(jogador: jogadores) {
  const overall = calcularOverall(jogador.posicao, {
    pace: jogador.velocidade,
    shooting: jogador.finalizacao,
    passing: jogador.passe,
    dribbling: jogador.drible,
    defending: jogador.defesa,
    physical: jogador.fisico,
  });

  return {
    id: jogador.id,
    name: jogador.nome,
    position: jogador.posicao,
    agility: jogador.agilidade,
    age: jogador.idade,
    condition: jogador.condicao,
    base_value: jogador.valor_base.toNumber(),
    market_value: valorMercadoDoJogador(jogador).toNumber(),
    pace: jogador.velocidade,
    shooting: jogador.finalizacao,
    passing: jogador.passe,
    dribbling: jogador.drible,
    defending: jogador.defesa,
    physical: jogador.fisico,
    potential: jogador.potencial,
    overall,
    club_id: jogador.clube_id,
  };
}
