import { LinhaCsv, calcularResumo, montarCsvHistorico } from './historico';

const compra: LinhaCsv = {
  tipo: 'COMPRA',
  valor: '37.00',
  taxa: '1.85',
  multa: '0.00',
  lucro: null,
  variacao_caixa: '-38.85',
  criado_em: new Date('2026-11-02T13:15:00.000Z'),
  nome_jogador: 'Meia Lua',
};
const venda: LinhaCsv = {
  tipo: 'VENDA',
  valor: '40.00',
  taxa: '0.30',
  multa: '4.00',
  lucro: '3.00',
  variacao_caixa: '35.70',
  criado_em: new Date('2026-11-05T19:40:00.000Z'),
  nome_jogador: 'Meia Lua',
};

describe('calcularResumo (RN17)', () => {
  it('compra e venda juntas', () => {
    const r = calcularResumo([venda, compra]);
    expect(r.totalGasto.toFixed(2)).toBe('38.85');
    expect(r.totalRecebido.toFixed(2)).toBe('35.70');
    expect(r.totalTaxas.toFixed(2)).toBe('2.15');
    expect(r.totalMultas.toFixed(2)).toBe('4.00');
    expect(r.totalLucro.toFixed(2)).toBe('3.00');
  });

  it('só venda: total gasto zerado', () => {
    const r = calcularResumo([venda]);
    expect(r.totalGasto.toFixed(2)).toBe('0.00');
    expect(r.totalTaxas.toFixed(2)).toBe('0.30');
  });

  it('sem transações: tudo zerado', () => {
    const r = calcularResumo([]);
    expect(r.totalGasto.toFixed(2)).toBe('0.00');
    expect(r.totalLucro.toFixed(2)).toBe('0.00');
  });
});

describe('montarCsvHistorico (RN18)', () => {
  it('gera o exemplo do enunciado', () => {
    expect(montarCsvHistorico([venda, compra])).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n' +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('sem transações: só o cabeçalho', () => {
    expect(montarCsvHistorico([])).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n',
    );
  });

  it('nome com aspas e ponto e vírgula vai entre aspas, duplicando as internas', () => {
    const csv = montarCsvHistorico([
      { ...compra, nome_jogador: 'Zé "Foguete" Lima' },
    ]);
    expect(csv).toContain(';"Zé ""Foguete"" Lima";');
    const csv2 = montarCsvHistorico([{ ...compra, nome_jogador: 'Ana; Lima' }]);
    expect(csv2).toContain(';"Ana; Lima";');
  });
});
