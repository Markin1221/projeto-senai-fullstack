import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { IdPipe } from '../common/pipes/id.pipe';
import { ClubesService } from './clubes.service';
import { CriarClubeDto } from './dto/criar-clube.dto';
import { ListarClubesQuery } from './dto/listar-clubes.query';
import { DefinirEscalacaoDto } from '../escalacao/dto/definir-escalacao.dto';

@Controller('clubs')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  @Post()
  async criar(
    @Body() dto: CriarClubeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const clube = await this.clubesService.criar(dto);
    res.location(`/api/v1/clubs/${clube.id}`);
    return clube;
  }

  @Get()
  listar(@Query() query: ListarClubesQuery) {
    return this.clubesService.listar(query.sort);
  }

  @Get(':id')
  buscarPorId(@Param('id', IdPipe) id: number) {
    return this.clubesService.buscarPorId(id);
  }
}
