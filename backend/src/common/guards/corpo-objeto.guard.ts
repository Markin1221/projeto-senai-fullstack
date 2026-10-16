import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SEM_CORPO } from '../decorators/sem-corpo.decorator';

@Injectable()
export class CorpoObjetoGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const semCorpo = this.reflector.getAllAndOverride<boolean>(SEM_CORPO, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (semCorpo) return true;

    const req = ctx.switchToHttp().getRequest();
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const b = req.body;
      if (
        b !== undefined &&
        (b === null || typeof b !== 'object' || Array.isArray(b))
      ) {
        throw new BadRequestException('O corpo deve ser um objeto JSON');
      }
    }
    return true;
  }
}
