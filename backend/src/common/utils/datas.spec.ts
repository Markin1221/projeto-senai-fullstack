import { formatarDataBrasilia, interpretarDataBrasilia } from './datas';

describe('interpretarDataBrasilia (RN01)', () => {
  it('converte para o instante UTC', () => {
    expect(
      interpretarDataBrasilia('2027-03-02T10:15-03:00')?.toISOString(),
    ).toBe('2027-03-02T13:15:00.000Z');
  });

  it('aceita 29/02 em ano bissexto', () => {
    expect(interpretarDataBrasilia('2028-02-29T10:00-03:00')).not.toBeNull();
  });

  it.each([
    ['sem fuso', '2027-03-02T10:15'],
    ['outro fuso', '2027-03-02T10:15-02:00'],
    ['com segundos', '2027-03-02T10:15:00-03:00'],
    ['dia inexistente', '2027-02-30T10:15-03:00'],
    ['29/02 fora de ano bissexto', '2027-02-29T10:15-03:00'],
    ['hora 24:00', '2027-03-02T24:00-03:00'],
    ['minuto 60', '2027-03-02T10:60-03:00'],
    ['mês 13', '2027-13-02T10:15-03:00'],
    ['texto qualquer', 'amanhã'],
  ])('recusa %s', (_caso, texto) => {
    expect(interpretarDataBrasilia(texto)).toBeNull();
  });

  it('recusa valor que não é texto', () => {
    expect(interpretarDataBrasilia(20270302)).toBeNull();
  });
});

describe('formatarDataBrasilia', () => {
  it('mostra no horário de Brasília', () => {
    expect(formatarDataBrasilia(new Date('2026-11-05T19:40:00.000Z'))).toBe(
      '2026-11-05T16:40:00-03:00',
    );
  });
});
