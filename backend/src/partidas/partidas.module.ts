import { Module } from '@nestjs/common';
import {
  ClassificacaoController,
  PartidasController,
} from './partidas.controller';
import { PartidasService } from './partidas.service';

@Module({
  controllers: [PartidasController, ClassificacaoController],
  providers: [PartidasService],
})
export class PartidasModule {}
