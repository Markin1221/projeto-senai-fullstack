import {
  calcularComissao,
  calcularMulta,
  calcularTaxaCompra,
  calcularVenda,
  compraDentroDoLimite,
  diasRestantes,
  fidelidadeValida,
  percentualMulta,
} from './mercado';

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;
const agora = new Date('2026-11-05T19:40:00.000Z');
const daqui = (ms: number) => new Date(agora.getTime() + ms);

describe('diasRestantes (RN15)', () => {
  it.each<[string, number, number]>([
    ['já passou', -DIA, 0],
    ['é o próprio momento', 0, 0],
    ['10 dias e 2 horas', 10 * DIA + 2 * HORA, 11],
    [
      '116 dias, 17 horas e 35 minutos',
      116 * DIA + 17 * HORA + 35 * MINUTO,
      117,
    ],
    ['exatamente 30 dias', 30 * DIA, 30],
    ['30 dias e 1 minuto', 30 * DIA + MINUTO, 31],
    ['exatamente 180 dias', 180 * DIA, 180],
    ['180 dias e 1 minuto', 180 * DIA + MINUTO, 181],
    ['200 dias', 200 * DIA, 200],
  ])('%s => %i', (_caso, ms, esperado) => {
    expect(diasRestantes(daqui(ms), agora)).toBe(esperado);
  });
});

describe('percentualMulta (RN15)', () => {
  it.each<[number, number]>([
    [0, 0],
    [1, 5],
    [11, 5],
    [30, 5],
    [31, 10],
    [180, 10],
    [181, 20],
    [200, 20],
  ])('%i dias => %i%%', (dias, esperado) => {
    expect(percentualMulta(dias)).toBe(esperado);
  });
});

describe('fidelidadeValida', () => {
  it.each<[string, number, boolean]>([
    ['1 minuto à frente', MINUTO, true],
    ['exatamente 1.095 dias', 1095 * DIA, true],
    ['1.095 dias e 1 minuto', 1095 * DIA + MINUTO, false],
    ['o próprio momento', 0, false],
    ['no passado', -MINUTO, false],
  ])('%s => %s', (_caso, ms, esperado) => {
    expect(fidelidadeValida(daqui(ms), agora)).toBe(esperado);
  });
});

describe('calcularTaxaCompra (RN13)', () => {
  it.each<[number, string]>([
    [28, '0.00'],
    [30, '0.00'],
    [30.01, '1.50'],
    [46, '2.30'],
  ])('valor %d => taxa %s', (valor, esperado) => {
    expect(calcularTaxaCompra(valor).toFixed(2)).toBe(esperado);
  });
});

describe('compraDentroDoLimite (RN13)', () => {
  it.each<[number, number, boolean]>([
    [50, 100, true], // igual ao limite
    [50.4, 100, false],
    [130.57, 261.15, true],
    [130.58, 261.15, false], // limite é 130,575
  ])('custo %d, caixa %d => %s', (custo, caixa, esperado) => {
    expect(compraDentroDoLimite(custo, caixa)).toBe(esperado);
  });
});

describe('calcularMulta (RN15)', () => {
  it.each<[number, number, string]>([
    [40, 100, '4.00'],
    [42.5, 200, '8.50'],
    [30, 20, '1.50'],
    [25, 0, '0.00'],
    [75, 200, '10.00'], // 15,00 limitado ao teto
  ])('valor %d, %i dias => %s', (valor, dias, esperado) => {
    expect(calcularMulta(valor, dias).toFixed(2)).toBe(esperado);
  });
});

describe('calcularComissao (RN16)', () => {
  it.each<[number, string]>([
    [3, '0.30'],
    [3.85, '0.39'],
    [10, '1.00'],
    [10.01, '1.00'],
    [15, '2.00'],
    [-7.5, '0.00'],
  ])('lucro %d => %s', (lucro, esperado) => {
    expect(calcularComissao(lucro).toFixed(2)).toBe(esperado);
  });
});

describe('calcularVenda (RN15 e RN16)', () => {
  it.each<[number, number, number, string, string, string, string]>([
    // compra, venda, dias, multa, lucro, comissão, crédito
    [37, 40, 100, '4.00', '3.00', '0.30', '35.70'],
    [50, 42.5, 200, '8.50', '-7.50', '0.00', '34.00'],
    [26.15, 30, 20, '1.50', '3.85', '0.39', '28.11'],
    [25, 25, 0, '0.00', '0.00', '0.00', '25.00'],
    [60, 75, 200, '10.00', '15.00', '2.00', '63.00'],
  ])(
    'compra %d, venda %d, %i dias',
    (compra, venda, dias, multa, lucro, comissao, credito) => {
      const r = calcularVenda(venda, compra, dias);
      expect(r.multa.toFixed(2)).toBe(multa);
      expect(r.lucro.toFixed(2)).toBe(lucro);
      expect(r.comissao.toFixed(2)).toBe(comissao);
      expect(r.credito.toFixed(2)).toBe(credito);
    },
  );

  it('contrato RESCINDIDO com multa e ENCERRADO sem multa', () => {
    expect(calcularVenda(40, 37, 100).situacaoContrato).toBe('RESCINDIDO');
    expect(calcularVenda(25, 25, 0).situacaoContrato).toBe('ENCERRADO');
  });
});
