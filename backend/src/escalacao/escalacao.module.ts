import { Module } from '@nestjs/common';
import { EscalacaoController } from './escalacao.controller';
import { EscalacaoService } from './escalacao.service';

@Module({ controllers: [EscalacaoController], providers: [EscalacaoService] })
export class EscalacaoModule {}
