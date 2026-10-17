import { compararNomes } from '../common/utils/texto';

export interface ClubeBase {
  id: number;
  nome: string;
}

export interface PartidaPlacar {
  mandanteId: number;
  visitanteId: number;
  golsMandante: number;
  golsVisitante: number;
}

export interface LinhaClassificacao {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

type Linha = Omit<LinhaClassificacao, 'position'>;

export function calcularClassificacao(
  clubes: ClubeBase[],
  partidas: PartidaPlacar[],
): LinhaClassificacao[] {
  const mapa = new Map<number, Linha>();
  for (const c of clubes) {
    mapa.set(c.id, {
      club_id: c.id,
      club_name: c.nome,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    });
  }

  const registrar = (id: number, gf: number, gc: number) => {
    const l = mapa.get(id);
    if (!l) return;
    l.played++;
    l.goals_for += gf;
    l.goals_against += gc;
    l.goal_difference = l.goals_for - l.goals_against;
    if (gf > gc) {
      l.wins++;
      l.points += 3;
    } else if (gf === gc) {
      l.draws++;
      l.points += 1;
    } else l.losses++;
  };

  for (const p of partidas) {
    registrar(p.mandanteId, p.golsMandante, p.golsVisitante);
    registrar(p.visitanteId, p.golsVisitante, p.golsMandante);
  }

  return [...mapa.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goal_difference - a.goal_difference ||
        b.goals_for - a.goals_for ||
        compararNomes(a.club_name, b.club_name) ||
        a.club_id - b.club_id,
    )
    .map((l, i) => ({ position: i + 1, ...l }));
}
