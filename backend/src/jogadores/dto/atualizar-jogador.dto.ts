import { Transform } from 'class-transformer';
import { IsIn, Validate } from 'class-validator';
import { normalizarEspacos } from '../../common/utils/texto';
import { InteiroEntre } from '../../common/validators/inteiro-entre.validator';
import { POSICOES } from './criar-jogador.dto';
import {
  AgilidadeCompativelComIdade,
  NomeJogadorValido,
} from './validadores-jogador';
import type { Posicao } from '../../regras/regras';

export class AtualizarJogadorDto {
  @Transform(({ value }) => normalizarEspacos(value))
  @Validate(NomeJogadorValido)
  name: string;

  @IsIn(POSICOES)
  position: Posicao;

  @InteiroEntre(1, 100)
  @Validate(AgilidadeCompativelComIdade)
  agility: number;

  @InteiroEntre(16, 45)
  age: number;
}
