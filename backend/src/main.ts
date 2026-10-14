import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CorpoObjetoGuard } from './common/guards/corpo-objeto.guard';
import { requestLogger } from './common/middleware/request-logger.middleware';

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
  app.useGlobalGuards(new CorpoObjetoGuard());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
