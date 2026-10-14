import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class IdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!/^[1-9]\d*$/.test(value) || Number(value) > 2147483647) {
      throw new NotFoundException('Recurso não encontrado');
    }
    return Number(value);
  }
}
