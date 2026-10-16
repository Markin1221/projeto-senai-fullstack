import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClubesModule } from './clubes/clubes.module';
import { HistoricoModule } from './historico/dto/historico.module';
import { JogadoresModule } from './jogadores/jogadores.module';
import { MercadoModule } from './mercado/mercado.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JogadoresModule,
    ClubesModule,
    MercadoModule,
    HistoricoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
