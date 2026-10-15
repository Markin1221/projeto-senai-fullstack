import { Transform } from 'class-transformer';
import { IsIn, Validate } from 'class-validator';
import { normalizarEspacos } from '../../common/utils/texto';
import { InteiroEntre } from '../../common/validators/inteiro-entre.validator';
import type { Posicao } from '../../regras/regras';
import {
  AgilidadeCompativelComIdade,
  NomeJogadorValido,
  PotencialCompativel,
  SomaDosAtributos,
} from './validadores-jogador';

export const POSICOES = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const;

export class CriarJogadorDto {
  @Transform(({ value }) => normalizarEspacos(value))
  @Validate(NomeJogadorValido)
  name: string;

  @IsIn(POSICOES, {
    message: `position deve ser um de: ${POSICOES.join(', ')}.`,
  })
  position: Posicao;

  @InteiroEntre(1, 100)
  @Validate(AgilidadeCompativelComIdade)
  agility: number;

  @InteiroEntre(16, 45)
  age: number;

  @InteiroEntre(1, 99)
  pace: number;

  @InteiroEntre(1, 99)
  shooting: number;

  @InteiroEntre(1, 99)
  passing: number;

  @InteiroEntre(1, 99)
  dribbling: number;

  @InteiroEntre(1, 99)
  defending: number;

  @InteiroEntre(1, 99)
  @Validate(SomaDosAtributos)
  physical: number;

  @InteiroEntre(1, 99)
  @Validate(PotencialCompativel)
  potential: number;
}
