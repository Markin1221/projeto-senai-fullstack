import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class CorpoObjetoGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const b = req.body;
      if (b === null || typeof b !== 'object' || Array.isArray(b)) {
        throw new BadRequestException('O corpo deve ser um objeto JSON');
      }
    }
    return true;
  }
}
