import Decimal from 'decimal.js';
import {
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { interpretarDataBrasilia } from '../utils/datas';

@ValidatorConstraint({ name: 'inteiroTexto', async: false })
export class InteiroTextoConstraint implements ValidatorConstraintInterface {
  validate(valor: unknown, args: ValidationArguments): boolean {
    const [minimo, maximo] = args.constraints as [number, number];
    return (
      typeof valor === 'string' &&
      /^[1-9]\d*$/.test(valor) &&
      Number(valor) >= minimo &&
      Number(valor) <= maximo
    );
  }
  defaultMessage(args: ValidationArguments): string {
    const [minimo, maximo] = args.constraints as [number, number];
    return `${args.property} deve ser um inteiro de ${minimo} a ${maximo}, escrito só com dígitos.`;
  }
}
/** Query param inteiro: só dígitos, sem zero à esquerda. */
export const InteiroTexto = (minimo: number, maximo: number) =>
  Validate(InteiroTextoConstraint, [minimo, maximo]);

@ValidatorConstraint({ name: 'decimalTexto', async: false })
export class DecimalTextoConstraint implements ValidatorConstraintInterface {
  validate(valor: unknown, args: ValidationArguments): boolean {
    const [minimo, maximo] = args.constraints as [number, number];
    if (
      typeof valor !== 'string' ||
      !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(valor)
    ) {
      return false;
    }
    const numero = new Decimal(valor);
    return numero.gte(minimo) && numero.lte(maximo);
  }
  defaultMessage(args: ValidationArguments): string {
    const [minimo, maximo] = args.constraints as [number, number];
    return `${args.property} deve ser um decimal de ${minimo} a ${maximo}, com até 2 casas, no formato 10, 10.5 ou 10.55.`;
  }
}
export const DecimalTexto = (minimo: number, maximo: number) =>
  Validate(DecimalTextoConstraint, [minimo, maximo]);

@ValidatorConstraint({ name: 'menorOuIgualA', async: false })
export class MenorOuIgualAConstraint implements ValidatorConstraintInterface {
  validate(valor: unknown, args: ValidationArguments): boolean {
    const [outro] = args.constraints as [string];
    const limite = (args.object as Record<string, unknown>)[outro];
    if (typeof valor !== 'string' || typeof limite !== 'string') return true;
    try {
      return new Decimal(valor).lte(limite);
    } catch {
      return true; // o outro validador já recusa
    }
  }
  defaultMessage(args: ValidationArguments): string {
    return `${args.property} não pode ser maior que ${String(args.constraints[0])}.`;
  }
}
export const MenorOuIgualA = (outro: string) =>
  Validate(MenorOuIgualAConstraint, [outro]);

@ValidatorConstraint({ name: 'textoEntre', async: false })
export class TextoEntreConstraint implements ValidatorConstraintInterface {
  validate(valor: unknown, args: ValidationArguments): boolean {
    const [minimo, maximo] = args.constraints as [number, number];
    if (typeof valor !== 'string') return false;
    const tamanho = Array.from(valor).length;
    return tamanho >= minimo && tamanho <= maximo && !/\p{Cc}/u.test(valor);
  }
  defaultMessage(args: ValidationArguments): string {
    const [minimo, maximo] = args.constraints as [number, number];
    return `${args.property} deve ter de ${minimo} a ${maximo} caracteres, sem caracteres de controle.`;
  }
}
export const TextoEntre = (minimo: number, maximo: number) =>
  Validate(TextoEntreConstraint, [minimo, maximo]);

@ValidatorConstraint({ name: 'dataBrasilia', async: false })
export class DataBrasiliaConstraint implements ValidatorConstraintInterface {
  validate(valor: unknown): boolean {
    return interpretarDataBrasilia(valor) !== null;
  }
  defaultMessage(args: ValidationArguments): string {
    return `${args.property} deve estar no formato AAAA-MM-DDTHH:MM-03:00 e ser uma data válida.`;
  }
}
export const DataBrasilia = () => Validate(DataBrasiliaConstraint);
