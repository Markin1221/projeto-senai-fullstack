import Decimal from 'decimal.js';

export function arredondar(valor: Decimal.Value): Decimal {
  return new Decimal(valor).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** 2 casas e vírgula decimal: 1234.5 -> "1234,50". */
export function formatarMoeda(valor: Decimal.Value): string {
  return new Decimal(valor).toFixed(2).replace('.', ',');
}

/** Como formatarMoeda, mas mantém a 3ª casa quando existe (ex.: limite 130,575). */
export function formatarLimite(valor: Decimal.Value): string {
  const d = new Decimal(valor);
  return (d.decimalPlaces() > 2 ? d.toString() : d.toFixed(2)).replace(
    '.',
    ',',
  );
}
