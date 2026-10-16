import Decimal from 'decimal.js';
import { formatarDataBrasilia } from '../common/utils/datas';
import { formatarMoeda } from '../common/utils/dinheiro';

export interface LinhaHistorico {
  tipo: 'COMPRA' | 'VENDA';
  valor: Decimal.Value;
  taxa: Decimal.Value;
  multa: Decimal.Value;
  lucro: Decimal.Value | null;
  variacao_caixa: Decimal.Value;
}

export interface LinhaCsv extends LinhaHistorico {
  criado_em: Date;
  nome_jogador: string;
}

/** RN17: totais sobre as transações já filtradas. */
export function calcularResumo(linhas: LinhaHistorico[]) {
  let totalGasto = new Decimal(0);
  let totalRecebido = new Decimal(0);
  let totalTaxas = new Decimal(0);
  let totalMultas = new Decimal(0);
  let totalLucro = new Decimal(0);

  for (const linha of linhas) {
    totalTaxas = totalTaxas.plus(linha.taxa);
    if (linha.tipo === 'COMPRA') {
      totalGasto = totalGasto.plus(linha.valor).plus(linha.taxa);
    } else {
      totalRecebido = totalRecebido.plus(linha.variacao_caixa);
      totalMultas = totalMultas.plus(linha.multa);
      totalLucro = totalLucro.plus(linha.lucro ?? 0);
    }
  }
  return { totalGasto, totalRecebido, totalTaxas, totalMultas, totalLucro };
}

function escaparCampo(texto: string): string {
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** RN18: separador ;, vírgula decimal, LF em todas as linhas, sem BOM. */
export function montarCsvHistorico(linhas: LinhaCsv[]): string {
  const cabecalho =
    'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';
  const corpo = linhas.map((l) =>
    [
      formatarDataBrasilia(l.criado_em),
      l.tipo,
      escaparCampo(l.nome_jogador),
      formatarMoeda(l.valor),
      formatarMoeda(l.taxa),
      formatarMoeda(l.multa),
      l.lucro === null ? '' : formatarMoeda(l.lucro),
      formatarMoeda(l.variacao_caixa),
    ].join(';'),
  );
  return [cabecalho, ...corpo].map((linha) => `${linha}\n`).join('');
}
