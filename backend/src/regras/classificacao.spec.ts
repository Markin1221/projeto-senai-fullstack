import { calcularClassificacao } from './classificacao';

describe('calcularClassificacao: exemplo do README', () => {
  const clubes = [
    { id: 1, nome: 'Águias FC' },
    { id: 2, nome: 'Delta FC' },
    { id: 3, nome: 'Épsilon EC' },
    { id: 4, nome: 'Gama SC' },
    { id: 5, nome: 'Mangue FC' },
    { id: 6, nome: 'Tubarões EC' },
  ];
  const partidas = [
    { mandanteId: 1, visitanteId: 2, golsMandante: 1, golsVisitante: 2 }, // Águias 1x2 Delta
    { mandanteId: 4, visitanteId: 3, golsMandante: 2, golsVisitante: 1 }, // Gama 2x1 Épsilon
    { mandanteId: 3, visitanteId: 1, golsMandante: 3, golsVisitante: 2 }, // Épsilon 3x2 Águias
    { mandanteId: 2, visitanteId: 4, golsMandante: 0, golsVisitante: 1 }, // Delta 0x1 Gama
  ];
  const t = calcularClassificacao(clubes, partidas);

  it('ordem final e posições', () => {
    expect(t.map((l) => l.club_name)).toEqual([
      'Gama SC',
      'Épsilon EC',
      'Delta FC',
      'Mangue FC',
      'Tubarões EC',
      'Águias FC',
    ]);
    expect(t.map((l) => l.position)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('pontos, saldo e gols', () => {
    const por = (n: string) => t.find((l) => l.club_name === n)!;
    expect(por('Gama SC')).toMatchObject({
      points: 6,
      wins: 2,
      played: 2,
      goals_for: 3,
      goals_against: 1,
      goal_difference: 2,
    });
    expect(por('Épsilon EC')).toMatchObject({
      points: 3,
      goal_difference: 0,
      goals_for: 4,
    });
    expect(por('Delta FC')).toMatchObject({
      points: 3,
      goal_difference: 0,
      goals_for: 2,
    });
    expect(por('Águias FC')).toMatchObject({
      points: 0,
      losses: 2,
      goal_difference: -2,
    });
    expect(por('Mangue FC')).toMatchObject({ played: 0, points: 0 });
  });
});

describe('calcularClassificacao: desempates', () => {
  it('empate em tudo: nome sem acento e em minúsculas', () => {
    const t = calcularClassificacao(
      [
        { id: 1, nome: 'Zebra' },
        { id: 2, nome: 'Águas' },
        { id: 3, nome: 'bola' },
      ],
      [],
    );
    expect(t.map((l) => l.club_name)).toEqual(['Águas', 'bola', 'Zebra']);
  });

  it('empate de pontos e saldo: mais gols marcados primeiro', () => {
    const t = calcularClassificacao(
      [
        { id: 1, nome: 'A' },
        { id: 2, nome: 'B' },
        { id: 3, nome: 'C' },
      ],
      [
        { mandanteId: 1, visitanteId: 3, golsMandante: 1, golsVisitante: 0 },
        { mandanteId: 2, visitanteId: 3, golsMandante: 3, golsVisitante: 2 },
      ],
    );
    expect(t.map((l) => l.club_name)).toEqual(['B', 'A', 'C']);
  });
});
