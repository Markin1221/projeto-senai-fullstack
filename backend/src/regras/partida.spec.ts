import { aplicarCondicao, simularPartida, Titular } from './partida';
import { Atributos, Condicao, Posicao } from './regras';

const BASE: Atributos = {
  pace: 50,
  shooting: 50,
  passing: 50,
  dribbling: 50,
  defending: 50,
  physical: 50,
};

function t(
  id: number,
  nome: string,
  posicao: Posicao,
  atributos: Partial<Atributos>,
  condicao: Condicao = 'APTO',
): Titular {
  return { id, nome, posicao, condicao, atributos: { ...BASE, ...atributos } };
}

describe('aplicarCondicao', () => {
  it.each([
    [74, 'MAL_CONDICIONADO', 63],
    [66, 'MAL_CONDICIONADO', 56],
    [50, 'MAL_CONDICIONADO', 43],
    [74, 'APTO', 74],
  ] as [number, Condicao, number][])(
    '%d com %s = %d',
    (valor, cond, esperado) => {
      expect(aplicarCondicao(valor, cond)).toBe(esperado);
    },
  );
});

describe('simularPartida: exemplo do README (Águias 1 x 2 Delta)', () => {
  const aguias = [
    t(30, 'Rui Prado', 'GOL', { defending: 77 }),
    t(32, 'Téo Brandão', 'ZAG', { defending: 84 }),
    t(
      31,
      'Davi Lins',
      'LAT',
      { dribbling: 74, defending: 66 },
      'MAL_CONDICIONADO',
    ),
    t(33, 'Lauro Neves', 'MEI', { passing: 82 }),
    t(34, 'Otto Rangel', 'ATA', { shooting: 75 }),
  ];
  const delta = [
    t(40, 'Ivo Teles', 'GOL', { defending: 72 }),
    t(41, 'Hugo Vaz', 'ZAG', { defending: 84 }),
    t(42, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
    t(43, 'Nei Soares', 'MEI', { passing: 70 }),
    t(44, 'Ugo Falcão', 'ATA', { shooting: 81 }),
  ];
  const r = simularPartida(aguias, delta);

  it('placar e resultado', () => {
    expect(r.golsMandante).toBe(1);
    expect(r.golsVisitante).toBe(2);
    expect(r.resultado).toBe('VISITANTE');
  });

  it('6 duelos: ordem, valores e gols', () => {
    expect(
      r.duelos.map((d) => [d.ordem, d.atacante.valor, d.defensor.valor, d.gol]),
    ).toEqual([
      [1, 75, 72, true],
      [2, 82, 84, false],
      [3, 63, 63, false], // empate de valores não é gol
      [4, 81, 77, true],
      [5, 70, 84, false],
      [6, 79, 56, true],
    ]);
  });

  it('quem ataca e quem defende em cada duelo', () => {
    expect(r.duelos.map((d) => d.atacante.id)).toEqual([
      34, 33, 31, 44, 43, 42,
    ]);
    expect(r.duelos.map((d) => d.defensor.id)).toEqual([
      40, 41, 42, 30, 32, 31,
    ]);
    expect(r.duelos.map((d) => d.atacante.atributo)).toEqual([
      'shooting',
      'passing',
      'dribbling',
      'shooting',
      'passing',
      'dribbling',
    ]);
    expect(r.duelos.every((d) => d.defensor.atributo === 'defending')).toBe(
      true,
    );
    expect(r.duelos[2].atacante.condicao).toBe('MAL_CONDICIONADO');
  });
});

describe('simularPartida: uma por formação', () => {
  const CASOS: [string, Posicao[], string[], Posicao[]][] = [
    [
      '3-1',
      ['ZAG', 'LAT', 'LAT', 'ATA'],
      ['shooting', 'dribbling', 'dribbling'],
      ['GOL', 'ZAG', 'LAT'],
    ],
    [
      '2-2',
      ['ZAG', 'LAT', 'ATA', 'ATA'],
      ['shooting', 'shooting', 'dribbling'],
      ['GOL', 'ZAG', 'LAT'],
    ],
    [
      '2-1-1',
      ['ZAG', 'LAT', 'MEI', 'ATA'],
      ['shooting', 'passing', 'dribbling'],
      ['GOL', 'ZAG', 'LAT'],
    ],
    [
      '1-2-1',
      ['ZAG', 'MEI', 'MEI', 'ATA'],
      ['shooting', 'passing', 'passing'],
      ['GOL', 'ZAG', 'MEI'],
    ],
  ];

  function time(base: number, linha: Posicao[]): Titular[] {
    return [
      t(base, 'Goleiro', 'GOL', {}),
      ...linha.map((p, i) => t(base + 1 + i, `Linha${i + 1}`, p, {})),
    ];
  }

  it.each(CASOS)('%s', (_f, linha, atributos, defensores) => {
    const r = simularPartida(time(100, linha), time(200, linha));
    // duelos 1-3 (mandante) e 4-6 (visitante) seguem a mesma regra
    for (const inicio of [0, 3]) {
      const d = r.duelos.slice(inicio, inicio + 3);
      expect(d.map((x) => x.atacante.atributo)).toEqual(atributos);
      expect(d.map((x) => x.defensor.posicao)).toEqual(defensores);
    }
    const base = (n: number) => (n === 0 ? 100 : 200);
    // 4º, 3º e 2º de linha atacam; ids = base+4, base+3, base+2
    expect(r.duelos.slice(0, 3).map((x) => x.atacante.id)).toEqual([
      base(0) + 4,
      base(0) + 3,
      base(0) + 2,
    ]);
    expect(r.duelos.slice(3).map((x) => x.atacante.id)).toEqual([
      base(1) + 4,
      base(1) + 3,
      base(1) + 2,
    ]);
    expect(r.duelos.map((x) => x.ordem)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
