import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
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
}
