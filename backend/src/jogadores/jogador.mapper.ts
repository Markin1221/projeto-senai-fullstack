import type { jogadores } from '@prisma/client';
import { calcularOverall, calcularValorMercado } from '../regras/regras';

/** Formato de resposta do jogador (snake_case, como no enunciado), reutilizado por todos os endpoints. */
export function paraResposta(jogador: jogadores) {
  const overall = calcularOverall(jogador.posicao, {
    pace: jogador.velocidade,
    shooting: jogador.finalizacao,
    passing: jogador.passe,
    dribbling: jogador.drible,
    defending: jogador.defesa,
    physical: jogador.fisico,
  });

  const valorMercado = calcularValorMercado(
    jogador.valor_base.toString(),
    jogador.condicao,
    jogador.agilidade,
    jogador.idade,
  );

  return {
    id: jogador.id,
    name: jogador.nome,
    position: jogador.posicao,
    agility: jogador.agilidade,
    age: jogador.idade,
    condition: jogador.condicao,
    base_value: jogador.valor_base.toNumber(),
    market_value: valorMercado.toNumber(),
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
