import Decimal from 'decimal.js';
import { arredondar } from '../common/utils/dinheiro';
const MS_POR_DIA = 86_400_000;
export const LIMITE_ELENCO = 12;
const LIMITE_FIDELIDADE_DIAS = 1095;
const TETO_MULTA = new Decimal(10);

/** RN15: dias com fração, arredondado para cima; mínimo 0. */
export function diasRestantes(fidelidadeAte: Date, agora: Date): number {
  const diferenca = fidelidadeAte.getTime() - agora.getTime();
  return diferenca <= 0 ? 0 : Math.ceil(diferenca / MS_POR_DIA);
}

export function percentualMulta(dias: number): number {
  if (dias <= 0) return 0;
  if (dias <= 30) return 5;
  if (dias <= 180) return 10;
  return 20;
}

/** Depois do momento da compra e até 1.095 dias depois. */
export function fidelidadeValida(fim: Date, agora: Date): boolean {
  const diferenca = fim.getTime() - agora.getTime();
  return diferenca > 0 && diferenca <= LIMITE_FIDELIDADE_DIAS * MS_POR_DIA;
}

/** RN13: 5% do valor, só quando o valor passa de 30,00. */
export function calcularTaxaCompra(valorMercado: Decimal.Value): Decimal {
  const valor = new Decimal(valorMercado);
  return valor.greaterThan(30)
    ? arredondar(valor.times('0.05'))
    : new Decimal(0);
}

/** RN13: custo total até 50% do caixa, sem arredondar o limite. */
export function compraDentroDoLimite(
  custoTotal: Decimal.Value,
  caixa: Decimal.Value,
): boolean {
  return new Decimal(custoTotal).times(2).lessThanOrEqualTo(caixa);
}

/** RN15: percentual do valor, arredondado, limitado a 10,00. */
export function calcularMulta(
  valorMercado: Decimal.Value,
  dias: number,
): Decimal {
  const bruta = arredondar(
    new Decimal(valorMercado).times(percentualMulta(dias)).div(100),
  );
  return Decimal.min(bruta, TETO_MULTA);
}

/** RN16: 10% do lucro até 10,00 + 20% do que passar; só com lucro. */
export function calcularComissao(lucro: Decimal.Value): Decimal {
  const valor = new Decimal(lucro);
  if (valor.lessThanOrEqualTo(0)) return new Decimal(0);
  const ateDez = Decimal.min(valor, 10);
  const acima = valor.minus(ateDez);
  return arredondar(ateDez.times('0.1').plus(acima.times('0.2')));
}

/** RN15 e RN16: tudo o que a venda calcula, em um lugar só. */
export function calcularVenda(
  valorVenda: Decimal.Value,
  valorCompra: Decimal.Value,
  dias: number,
) {
  const venda = new Decimal(valorVenda);
  const multa = calcularMulta(venda, dias);
  const lucro = venda.minus(valorCompra);
  const comissao = calcularComissao(lucro);
  return {
    percentualMulta: percentualMulta(dias),
    multa,
    lucro,
    comissao,
    credito: venda.minus(multa).minus(comissao),
    situacaoContrato: (dias > 0 ? 'RESCINDIDO' : 'ENCERRADO') as
      'RESCINDIDO' | 'ENCERRADO',
  };
}
