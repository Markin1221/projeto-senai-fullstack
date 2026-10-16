import type { clubes, jogadores } from '@prisma/client';
import Decimal from 'decimal.js';
import { valorMercadoDoJogador } from '../jogadores/jogador.mapper';

/** RN11: valor do elenco e patrimônio, calculados a cada consulta. */
export function resumoDoClube(clube: clubes, elenco: jogadores[]) {
  const valorElenco = elenco.reduce(
    (soma, jogador) => soma.plus(valorMercadoDoJogador(jogador)),
    new Decimal(0),
  );
  const patrimonio = new Decimal(clube.caixa.toString()).plus(valorElenco);
  return {
    id: clube.id,
    name: clube.nome,
    acronym: clube.sigla,
    cash: clube.caixa.toNumber(),
    squad_value: valorElenco.toNumber(),
    net_worth: patrimonio.toNumber(),
  };
}
