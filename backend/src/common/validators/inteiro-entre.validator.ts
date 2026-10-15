import {
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'inteiroEntre', async: false })
export class InteiroEntreConstraint implements ValidatorConstraintInterface {
  validate(valor: unknown, args: ValidationArguments): boolean {
    const [minimo, maximo] = args.constraints as [number, number];
    return (
      typeof valor === 'number' &&
      Number.isInteger(valor) &&
      valor >= minimo &&
      valor <= maximo
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const [minimo, maximo] = args.constraints as [number, number];
    return `${args.property} deve ser um número inteiro de ${minimo} a ${maximo}.`;
  }
}

/** V2: número JSON inteiro dentro de um intervalo inclusivo. */
export const InteiroEntre = (minimo: number, maximo: number) =>
  Validate(InteiroEntreConstraint, [minimo, maximo]);
