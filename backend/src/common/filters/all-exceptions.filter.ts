import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    let status = 500;
    let message = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const r: any = exception.getResponse();
      const m = typeof r === 'string' ? r : r?.message;
      message = Array.isArray(m) ? m.join('; ') : (m ?? exception.message);
    } else if (exception?.type === 'entity.parse.failed') {
      status = 400;
      message = 'JSON inválido';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2025') {
        status = 404;
        message = 'Recurso não encontrado';
      } else if (exception.code === 'P2002' || exception.code === 'P2003') {
        status = 409;
        message = 'Conflito com regra de negócio';
      }
    }

    if (status >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }
    res.status(status).json({ message });
  }
}
