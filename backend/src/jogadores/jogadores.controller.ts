import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { JogadoresService } from './jogadores.service';
import { MudarCondicaoDto } from './dto/mudar-condicao.dto';

@Controller('players')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Post()
  async criar(
    @Body() dto: CriarJogadorDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jogador = await this.jogadoresService.criar(dto);
    res.location(`/api/v1/players/${jogador.id}`);
    return jogador;
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.jogadoresService.buscarJogadoresPorId(Number(id));
  }
  @Patch(':id/condition')
  async mudarCondicao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MudarCondicaoDto,
  ) {
    return this.jogadoresService.mudarCondicao(id, dto.condition);
  }
}
