import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoTransacao, transacoes } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  LinhaCsv,
  calcularResumo,
  montarCsvHistorico,
} from '../../regras/historico';
import { transacaoParaResposta } from '../../mercado/transacao.mapper';
import { FiltroTransacoesQuery } from '../../mercado/dto/filtro-transacoes.query';

const paraLinha = (t: transacoes): LinhaCsv => ({
  tipo: t.tipo,
  valor: t.valor.toString(),
  taxa: t.taxa.toString(),
  multa: t.multa.toString(),
  lucro: t.lucro === null ? null : t.lucro.toString(),
  variacao_caixa: t.variacao_caixa.toString(),
  criado_em: t.criado_em,
  nome_jogador: t.nome_jogador,
});

@Injectable()
export class HistoricoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(clubeId: number, filtros: FiltroTransacoesQuery) {
    const transacoes = await this.buscar(clubeId, filtros);
    const resumo = calcularResumo(transacoes.map(paraLinha));
    return {
      data: transacoes.map(transacaoParaResposta),
      summary: {
        total_spent: resumo.totalGasto.toNumber(),
        total_received: resumo.totalRecebido.toNumber(),
        total_fees: resumo.totalTaxas.toNumber(),
        total_penalties: resumo.totalMultas.toNumber(),
        total_profit: resumo.totalLucro.toNumber(),
      },
    };
  }

  async exportar(clubeId: number, filtros: FiltroTransacoesQuery) {
    const transacoes = await this.buscar(clubeId, filtros);
    return montarCsvHistorico(transacoes.map(paraLinha));
  }

  // RN17: mais recente primeiro; empate por id decrescente.
  private async buscar(clubeId: number, filtros: FiltroTransacoesQuery) {
    const clube = await this.prisma.clubes.findUnique({
      where: { id: clubeId },
    });
    if (!clube) throw new NotFoundException('Clube não encontrado');

    const where: Prisma.transacoesWhereInput = { clube_id: clubeId };
    if (filtros.type)
      where.tipo = { in: filtros.type.split(',') as TipoTransacao[] };
    if (filtros.player_id) {
      const jogadorId = Number(filtros.player_id);
      const jogador = await this.prisma.jogadores.findFirst({
        where: { id: jogadorId, excluido_em: null },
      });
      if (!jogador) throw new NotFoundException('Jogador não encontrado');
      where.jogador_id = jogadorId;
    }

    return this.prisma.transacoes.findMany({
      where,
      orderBy: [{ criado_em: 'desc' }, { id: 'desc' }],
    });
  }
}
