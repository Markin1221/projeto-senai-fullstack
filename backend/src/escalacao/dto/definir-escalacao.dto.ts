import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  Max,
  Min,
} from 'class-validator';

export const FORMACOES = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;

export class DefinirEscalacaoDto {
  @IsIn(FORMACOES, { message: 'formation deve ser 3-1, 2-2, 2-1-1 ou 1-2-1.' })
  formation!: (typeof FORMACOES)[number];

  @IsArray({ message: 'player_ids deve ser uma lista.' })
  @ArrayMinSize(5, { message: 'player_ids deve ter exatamente 5 jogadores.' })
  @ArrayMaxSize(5, { message: 'player_ids deve ter exatamente 5 jogadores.' })
  @ArrayUnique({ message: 'player_ids não pode ter repetidos.' })
  @IsInt({ each: true, message: 'player_ids deve conter inteiros positivos.' })
  @Min(1, { each: true, message: 'player_ids deve conter inteiros positivos.' })
  @Max(2147483647, {
    each: true,
    message: 'player_ids deve conter inteiros positivos.',
  })
  player_ids!: number[];
}
