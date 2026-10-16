import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { IdPipe } from '../../common/pipes/id.pipe';
import { FiltroTransacoesQuery } from '../../mercado/dto/filtro-transacoes.query';
import { HistoricoService } from './historico.service';

@Controller('clubs')
export class HistoricoController {
  constructor(private readonly historicoService: HistoricoService) {}

  @Get(':id/transactions')
  listar(
    @Param('id', IdPipe) id: number,
    @Query() filtros: FiltroTransacoesQuery,
  ) {
    return this.historicoService.listar(id, filtros);
  }

  @Get(':id/transactions/export')
  async exportar(
    @Param('id', IdPipe) id: number,
    @Query() filtros: FiltroTransacoesQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.historicoService.exportar(id, filtros);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="historico-clube-${id}.csv"`,
    );
    return csv;
  }
}
