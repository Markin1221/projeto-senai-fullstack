import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { IdPipe } from '../common/pipes/id.pipe';
import { DefinirEscalacaoDto } from './dto/definir-escalacao.dto';
import { EscalacaoService } from './escalacao.service';

@Controller('clubs/:id/lineup')
export class EscalacaoController {
  constructor(private readonly service: EscalacaoService) {}

  @Put()
  definir(@Param('id', IdPipe) id: number, @Body() dto: DefinirEscalacaoDto) {
    return this.service.definir(id, dto);
  }

  @Get()
  buscar(@Param('id', IdPipe) id: number) {
    return this.service.buscar(id);
  }
}
