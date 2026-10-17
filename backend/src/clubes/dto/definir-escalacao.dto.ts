import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsPositive,
} from 'class-validator';
import type { Formacao } from '../../regras/regras';

export class DefinirEscalacaoDto {
  @IsDefined()
  @IsIn(['3-1', '2-2', '2-1-1', '1-2-1'])
  formation: Formacao;

  @IsDefined()
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  player_ids: number[];
}
