import type { transacoes } from '@prisma/client';
import { formatarDataBrasilia } from '../common/utils/datas';

export function transacaoParaResposta(t: transacoes) {
  return {
    id: t.id,
    club_id: t.clube_id,
    player_id: t.jogador_id,
    player_name: t.nome_jogador,
    type: t.tipo,
    value: t.valor.toNumber(),
    fee: t.taxa.toNumber(),
    penalty: t.multa.toNumber(),
    profit: t.lucro === null ? null : t.lucro.toNumber(),
    cash_change: t.variacao_caixa.toNumber(),
    created_at: formatarDataBrasilia(t.criado_em),
  };
}
