import { Condicao, Posicoes } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { normalizarEspacos } from '../../common/utils/texto';
import {
  DecimalTexto,
  InteiroTexto,
  MenorOuIgualA,
  TextoEntre,
} from '../../common/validators/validadores';

const ID_MAX = 2147483647;
const CRITERIOS = [
  'name',
  'position',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
];

@ValidatorConstraint({ name: 'ordenacaoJogadores', async: false })
export class OrdenacaoJogadores implements ValidatorConstraintInterface {
  validate(valor: unknown): boolean {
    if (typeof valor !== 'string') return false;
    const partes = valor.split(',');
    if (partes.length > 2 || !partes.every((p) => CRITERIOS.includes(p)))
      return false;
    const campos = partes.map((p) => p.replace(/_(asc|desc)$/, ''));
    return new Set(campos).size === campos.length;
  }
  defaultMessage(): string {
    return 'sort aceita até dois critérios válidos, separados por vírgula, sem repetir o campo.';
  }
}

@ValidatorConstraint({ name: 'livreSemClube', async: false })
export class LivreSemClube implements ValidatorConstraintInterface {
  validate(valor: unknown, args: ValidationArguments): boolean {
    const { club_id } = args.object as Record<string, unknown>;
    return !(valor === 'true' && club_id !== undefined);
  }
  defaultMessage(): string {
    return 'free=true não combina com club_id.';
  }
}

export class ListarJogadoresQuery {
  @IsOptional()
  @Transform(({ value }) => normalizarEspacos(value))
  @TextoEntre(2, 100)
  search?: string;

  @IsOptional()
  @IsIn(Object.values(Posicoes))
  position?: Posicoes;

  @IsOptional()
  @IsIn(Object.values(Condicao))
  condition?: Condicao;

  @IsOptional()
  @IsIn(['true', 'false'])
  @Validate(LivreSemClube)
  free?: string;

  @IsOptional()
  @InteiroTexto(1, ID_MAX)
  club_id?: string;

  @IsOptional()
  @InteiroTexto(16, 45)
  @MenorOuIgualA('max_age')
  min_age?: string;

  @IsOptional()
  @InteiroTexto(16, 45)
  max_age?: string;

  @IsOptional()
  @DecimalTexto(0, 550)
  @MenorOuIgualA('max_value')
  min_value?: string;

  @IsOptional()
  @DecimalTexto(0, 550)
  max_value?: string;

  @IsOptional()
  @Validate(OrdenacaoJogadores)
  sort?: string;

  @IsOptional()
  @InteiroTexto(1, ID_MAX)
  page?: string;

  @IsOptional()
  @InteiroTexto(1, 50)
  limit?: string;
}
