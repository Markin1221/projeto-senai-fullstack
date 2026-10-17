import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

@Injectable()
export class IdPipe implements PipeTransform<string, number> {
  transform(valor: string): number {
    if (!/^[1-9]\d*$/.test(valor) || Number(valor) > 2147483647) {
      throw new NotFoundException('Recurso não encontrado.');
    }
    return Number(valor);
  }
}
