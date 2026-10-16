import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { SemCorpo } from '../common/decorators/sem-corpo.decorator';
import { IdPipe } from '../common/pipes/id.pipe';
import { ComprarJogadorDto } from './dto/comprar-jogador.dto';
import { MercadoService } from './mercado.service';

@Controller('players')
export class MercadoController {
  constructor(private readonly mercadoService: MercadoService) {}

  @Post(':id/buy')
  @HttpCode(200)
  comprar(@Param('id', IdPipe) id: number, @Body() dto: ComprarJogadorDto) {
    return this.mercadoService.comprar(id, dto);
  }

  @Post(':id/sell')
  @HttpCode(200)
  @SemCorpo()
  vender(@Param('id', IdPipe) id: number) {
    return this.mercadoService.vender(id);
  }
}
