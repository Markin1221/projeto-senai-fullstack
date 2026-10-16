import { IsEnum } from 'class-validator';
import { Condicao } from '@prisma/client';

export class MudarCondicaoDto {
  @IsEnum(Condicao, {
    message: 'Condição inválida',
  })
  condition: Condicao;
}
