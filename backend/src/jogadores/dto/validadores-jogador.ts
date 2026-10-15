import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

type Corpo = Record<string, unknown>;

const ATRIBUTOS = [
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defending',
  'physical',
] as const;

const ehInteiro = (valor: unknown): valor is number =>
  typeof valor === 'number' && Number.isInteger(valor);

/** Os seis atributos, se todos forem inteiros; senão null (os outros validadores já recusam). */
function lerAtributos(corpo: Corpo): number[] | null {
  const valores = ATRIBUTOS.map((campo) => corpo[campo]);
  return valores.every(ehInteiro) ? valores : null;
}

/** Nome do jogador: 3 a 100 caracteres (pontos de código), sem controle, sem dígitos e com 2+ palavras. */
@ValidatorConstraint({ name: 'nomeJogadorValido', async: false })
export class NomeJogadorValido implements ValidatorConstraintInterface {
  validate(valor: unknown): boolean {
    if (typeof valor !== 'string') return false;
    const tamanho = [...valor].length;
    if (tamanho < 3 || tamanho > 100) return false;
    if (/\p{Cc}/u.test(valor) || /[0-9]/.test(valor)) return false;
    const palavras = valor.split(' ').filter((parte) => /\p{L}/u.test(parte));
    return palavras.length >= 2;
  }

  defaultMessage(): string {
    return 'name deve ter de 3 a 100 caracteres, com pelo menos duas palavras e sem números.';
  }
}

/** Com 35 anos ou mais, a agilidade vai até 85. */
@ValidatorConstraint({ name: 'agilidadeCompativelComIdade', async: false })
export class AgilidadeCompativelComIdade
  implements ValidatorConstraintInterface
{
  validate(agilidade: unknown, args: ValidationArguments): boolean {
    const { age } = args.object as Corpo;
    if (!ehInteiro(agilidade) || !ehInteiro(age)) return true;
    return !(age >= 35 && agilidade > 85);
  }

  defaultMessage(): string {
    return 'agility deve ser no máximo 85 para jogador com 35 anos ou mais.';
  }
}

/** A soma dos seis atributos não pode passar de 480. */
@ValidatorConstraint({ name: 'somaDosAtributos', async: false })
export class SomaDosAtributos implements ValidatorConstraintInterface {
  validate(_valor: unknown, args: ValidationArguments): boolean {
    const atributos = lerAtributos(args.object as Corpo);
    if (!atributos) return true;
    return atributos.reduce((soma, valor) => soma + valor, 0) <= 480;
  }

  defaultMessage(): string {
    return 'A soma dos seis atributos não pode passar de 480.';
  }
}

/** Potencial: nunca menor que o maior atributo e, com 33 anos ou mais, igual a ele. */
@ValidatorConstraint({ name: 'potencialCompativel', async: false })
export class PotencialCompativel implements ValidatorConstraintInterface {
  validate(potencial: unknown, args: ValidationArguments): boolean {
    const corpo = args.object as Corpo;
    const atributos = lerAtributos(corpo);
    if (!ehInteiro(potencial) || !ehInteiro(corpo.age) || !atributos) {
      return true;
    }
    const maior = Math.max(...atributos);
    if (potencial < maior) return false;
    return !(corpo.age >= 33 && potencial !== maior);
  }

  defaultMessage(): string {
    return 'potential não pode ser menor que o maior atributo e, com 33 anos ou mais, deve ser igual a ele.';
  }
}
