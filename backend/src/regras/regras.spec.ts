import {
  Atributos,
  Condicao,
  Posicao,
  calcularOverall,
  calcularValorBase,
  calcularValorMercado,
} from './regras';

const atributos = ([
  pace,
  shooting,
  passing,
  dribbling,
  defending,
  physical,
]: number[]): Atributos => ({ pace, shooting, passing, dribbling, defending, physical });

describe('calcularOverall (RN06)', () => {
  it.each<[Posicao, number[], number]>([
    ['MEI', [68, 65, 80, 78, 52, 60], 73],
    ['ATA', [78, 75, 73, 82, 48, 68], 76],
    ['LAT', [72, 70, 78, 76, 70, 66], 72],
    ['ZAG', [50, 90, 60, 40, 80, 75], 73], // 72,50 arredonda para cima
    ['GOL', [55, 30, 65, 40, 72, 68], 68],
  ])('%s %j => %i', (posicao, attrs, esperado) => {
    expect(calcularOverall(posicao, atributos(attrs))).toBe(esperado);
  });
});

describe('calcularValorBase (RN06)', () => {
  it.each<[number, number, number, string]>([
    // overall, potencial, idade no cadastro, valor base
    [75, 86, 25, '40.00'],
    [60, 70, 30, '10.00'], // fim da primeira faixa
    [61, 70, 30, '12.00'], // início da segunda faixa
    [76, 80, 22, '46.00'],
    [85, 92, 27, '100.00'],
    [70, 84, 21, '34.20'], // jovem promessa
    [70, 84, 22, '30.00'], // 22 anos: sem bônus
    [45, 90, 18, '3.63'], // 3,625 arredonda para longe do zero
    [40, 66, 36, '1.00'], // piso
  ])('overall %i, potencial %i, idade %i => %s', (overall, potencial, idade, esperado) => {
    expect(calcularValorBase(overall, potencial, idade).toFixed(2)).toBe(esperado);
  });
});

describe('calcularValorMercado (RN02 a RN05)', () => {
  it.each<[number, Condicao, number, number, string]>([
    // valor base, condição, agilidade, idade, valor de mercado
    [82.0, 'APTO', 20, 25, '82.00'], // agilidade não age em APTO
    [82.0, 'APTO', 50, 19, '90.20'],
    [82.0, 'MAL_CONDICIONADO', 50, 25, '69.70'],
    [82.0, 'MAL_CONDICIONADO', 80, 21, '84.05'],
    [82.0, 'MAL_CONDICIONADO', 30, 33, '53.30'],
    [82.0, 'DOENTE', 90, 25, '69.70'],
    [82.0, 'DOENTE', 30, 25, '49.20'], // exatamente no teto de -40%
    [82.0, 'DOENTE', 10, 40, '49.20'], // -50% limitado a -40%
    [9.5, 'MAL_CONDICIONADO', 85, 25, '8.79'], // 8,7875 arredondado
    [1.0, 'MAL_CONDICIONADO', 50, 35, '1.00'], // 0,75 sobe para o piso
  ])(
    'base %d, %s, agilidade %i, idade %i => %s',
    (valorBase, condicao, agilidade, idade, esperado) => {
      expect(calcularValorMercado(valorBase, condicao, agilidade, idade).toFixed(2)).toBe(
        esperado,
      );
    },
  );
});
