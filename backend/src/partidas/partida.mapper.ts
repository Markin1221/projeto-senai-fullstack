import { duelos_partida, partidas } from '@prisma/client';
import { resultadoDoPlacar } from '../regras/partida';
import { formatarDataBrasilia } from '../common/utils/datas';

function lado(d: duelos_partida, tipo: 'atacante' | 'defensor') {
  const a = tipo === 'atacante';
  return {
    player_id: a ? d.atacante_id : d.defensor_id,
    player_name: a ? d.nome_atacante : d.nome_defensor,
    position: a ? d.posicao_atacante : d.posicao_defensor,
    condition: a ? d.condicao_atacante : d.condicao_defensor,
    attribute: a ? d.atributo_ataque : d.atributo_defesa,
    value: a ? d.valor_ataque : d.valor_defesa,
  };
}

export function montarPartida(
  p: partidas,
  nomeMandante: string,
  nomeVisitante: string,
  duelos?: duelos_partida[],
) {
  const base = {
    id: p.id,
    played_at: formatarDataBrasilia(p.jogada_em),
    home: {
      club_id: p.mandante_id,
      club_name: nomeMandante,
      formation: p.formacao_mandante,
      goals: p.gols_mandante,
    },
    away: {
      club_id: p.visitante_id,
      club_name: nomeVisitante,
      formation: p.formacao_visitante,
      goals: p.gols_visitante,
    },
    result: resultadoDoPlacar(p.gols_mandante, p.gols_visitante),
  };
  if (!duelos) return base;
  return {
    ...base,
    duels: duelos.map((d) => ({
      order: d.ordem,
      attacking_club_id: d.clube_atacante_id,
      attacker: lado(d, 'atacante'),
      defender: lado(d, 'defensor'),
      goal: d.gol,
    })),
  };
}
