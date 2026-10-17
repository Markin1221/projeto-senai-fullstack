import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { IdPipe } from '../common/pipes/id.pipe';
import { CriarPartidaDto } from './dto/criar-partida.dto';
import { PartidasService } from './partidas.service';

@Controller('matches')
export class PartidasController {
  constructor(private readonly service: PartidasService) {}

  @Post()
  @HttpCode(201)
  async criar(
    @Body() dto: CriarPartidaDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const partida = await this.service.criar(dto);
    res.setHeader('Location', `/api/v1/matches/${partida.id}`);
    return partida;
  }

  @Get(':id')
  buscar(@Param('id', IdPipe) id: number) {
    return this.service.buscarPorId(id);
  }
}
