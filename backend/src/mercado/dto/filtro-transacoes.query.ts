import {
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InteiroTexto } from '../../common/validators/validadores';

@ValidatorConstraint({ name: 'tiposTransacao', async: false })
export class TiposTransacao implements ValidatorConstraintInterface {
  validate(valor: unknown): boolean {
    if (typeof valor !== 'string') return false;
    const partes = valor.split(',');
    return (
      partes.every((p) => p === 'COMPRA' || p === 'VENDA') &&
      new Set(partes).size === partes.length
    );
  }
  defaultMessage(): string {
    return 'type aceita COMPRA e VENDA, em maiúsculas, separados por vírgula, sem espaços e sem repetir.';
  }
}

export class FiltroTransacoesQuery {
  @IsOptional()
  @Validate(TiposTransacao)
  type?: string;

  @IsOptional()
  @InteiroTexto(1, 2147483647)
  player_id?: string;
}
