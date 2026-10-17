import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CorpoObjetoGuard } from './common/guards/corpo-objeto.guard';
import { requestLogger } from './common/middleware/request-logger.middleware';
import { ValidacaoPipe } from './common/pipes/validacao.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const origens = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (origens.length === 0 || origens.includes('*')) {
    throw new Error('Defina CORS_ORIGIN no .env (nunca "*")');
  }

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: origens });
  app.use(requestLogger);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalGuards(new CorpoObjetoGuard(app.get(Reflector)));
  app.useGlobalPipes(new ValidacaoPipe({ whitelist: true, transform: true }));
  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Passe API')
      .setDescription(
        'Mercado de jogadores, clubes, escalação, partidas e classificação.',
      )
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, documento);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
