import {
  Atributos,
  Condicao,
  Posicao,
  calcularOverall,
  calcularValorBase,
  calcularValorMercado,
  Formacao,
  posicoesFecham,
} from './regras';

const atributos = ([
  pace,
  shooting,
  passing,
  dribbling,
  defending,
  physical,
]: number[]): Atributos => ({
  pace,
  shooting,
  passing,
  dribbling,
  defending,
  physical,
});

describe('calcularOverall (RN06)', () => {
  it.each<[Posicao, number[], number]>([
    ['MEI', [68, 65, 80, 78, 52, 60], 73],
    ['ATA', [78, 75, 73, 82, 48, 68], 76],
    ['LAT', [72, 70, 78, 76, 70, 66], 72],
    ['ZAG', [50, 90, 60, 40, 80, 75], 73],
    ['GOL', [55, 30, 65, 40, 72, 68], 68],
  ])('%s com atributos %j deve retornar %i', (posicao, attrs, esperado) => {
    expect(calcularOverall(posicao, atributos(attrs))).toBe(esperado);
  });
});

describe('calcularValorBase (RN06)', () => {
  it.each<[number, number, number, string]>([
    // overall, potencial, idade, valor base
    [75, 86, 25, '40.00'],
    [60, 70, 30, '10.00'],
    [61, 70, 30, '12.00'],
    [76, 80, 22, '46.00'],
    [85, 92, 27, '100.00'],
    [70, 84, 21, '34.20'],
    [70, 84, 22, '30.00'],
    [45, 90, 18, '3.63'],
    [40, 66, 36, '1.00'],
  ])(
    'overall %i, potencial %i, idade %i deve retornar %s',
    (overall, potencial, idade, esperado) => {
      expect(calcularValorBase(overall, potencial, idade).toFixed(2)).toBe(
        esperado,
      );
    },
  );
});

describe('calcularValorMercado (RN02 a RN05)', () => {
  it.each<[number, Condicao, number, number, string]>([
    // valor base, condição, agilidade, idade, valor de mercado
    [82.0, 'APTO', 20, 25, '82.00'],
    [82.0, 'APTO', 50, 19, '90.20'],
    [82.0, 'MAL_CONDICIONADO', 50, 25, '69.70'],
    [82.0, 'MAL_CONDICIONADO', 80, 21, '84.05'],
    [82.0, 'MAL_CONDICIONADO', 30, 33, '53.30'],
    [82.0, 'DOENTE', 90, 25, '69.70'],
    [82.0, 'DOENTE', 30, 25, '49.20'],
    [82.0, 'DOENTE', 10, 40, '49.20'],
    [9.5, 'MAL_CONDICIONADO', 85, 25, '8.79'],
    [1.0, 'MAL_CONDICIONADO', 50, 35, '1.00'],
  ])(
    'base %d, condição %s, agilidade %i, idade %i deve retornar %s',
    (valorBase, condicao, agilidade, idade, esperado) => {
      expect(
        calcularValorMercado(valorBase, condicao, agilidade, idade).toFixed(2),
      ).toBe(esperado);
    },
  );

  describe('posicoesFecham (RN19)', () => {
    it.each<[Formacao, Posicao[]]>([
      ['3-1', ['GOL', 'ZAG', 'ZAG', 'LAT', 'ATA']],
      ['2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA']],
      ['2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
      ['1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA']],
    ])(
      'deve aceitar a formação %s com as posições corretas',
      (formacao, posicoes) => {
        expect(posicoesFecham(formacao, posicoes)).toBe(true);
      },
    );

    it.each<[Formacao, Posicao[]]>([
      ['3-1', ['GOL', 'ZAG', 'MEI', 'ATA', 'ATA']],
      ['2-2', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
      ['2-1-1', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA']],
      ['1-2-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ])(
      'deve rejeitar posições incompatíveis com a formação %s',
      (formacao, posicoes) => {
        expect(posicoesFecham(formacao, posicoes)).toBe(false);
      },
    );

    it('deve rejeitar uma escalação sem goleiro', () => {
      const posicoes: Posicao[] = ['ZAG', 'ZAG', 'LAT', 'MEI', 'ATA'];

      expect(posicoesFecham('2-1-1', posicoes)).toBe(false);
    });

    it('deve rejeitar uma escalação com dois goleiros', () => {
      const posicoes: Posicao[] = ['GOL', 'GOL', 'ZAG', 'MEI', 'ATA'];

      expect(posicoesFecham('2-1-1', posicoes)).toBe(false);
    });

    it('deve rejeitar uma escalação com quantidade diferente de cinco jogadores', () => {
      const posicoes: Posicao[] = ['GOL', 'ZAG', 'MEI', 'ATA'];

      expect(posicoesFecham('2-1-1', posicoes)).toBe(false);
    });
  });
});
