import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { IdPipe } from '../common/pipes/id.pipe';
import { AtualizarJogadorDto } from './dto/atualizar-jogador.dto';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { ListarJogadoresQuery } from './dto/listar-jogadores.query';
import { MudarCondicaoDto } from './dto/mudar-condicao.dto';
import { JogadoresService } from './jogadores.service';

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

  @Get()
  listar(@Query() query: ListarJogadoresQuery) {
    return this.jogadoresService.listar(query);
  }

  @Get(':id')
  buscarPorId(@Param('id', IdPipe) id: number) {
    return this.jogadoresService.buscarJogadoresPorId(id);
  }

  @Put(':id')
  atualizar(@Param('id', IdPipe) id: number, @Body() dto: AtualizarJogadorDto) {
    return this.jogadoresService.atualizarJogador(id, dto);
  }

  @Patch(':id/condition')
  mudarCondicao(
    @Param('id', IdPipe) id: number,
    @Body() dto: MudarCondicaoDto,
  ) {
    return this.jogadoresService.mudarCondicao(id, dto.condition);
  }

  @Delete(':id')
  @HttpCode(204)
  excluir(@Param('id', IdPipe) id: number) {
    return this.jogadoresService.excluir(id);
  }
}
