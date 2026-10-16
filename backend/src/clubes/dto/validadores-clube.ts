import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { semAcentos } from '../../common/utils/texto';

/** 3 a 60 caracteres, só letras, espaços, hífen e ponto, de 2 a 5 palavras. */
@ValidatorConstraint({ name: 'nomeClubeValido', async: false })
export class NomeClubeValido implements ValidatorConstraintInterface {
  validate(valor: unknown): boolean {
    if (typeof valor !== 'string') return false;
    const tamanho = Array.from(valor).length;
    if (tamanho < 3 || tamanho > 60) return false;
    if (!/^[\p{L} .-]+$/u.test(valor)) return false;
    const palavras = valor.split(' ').filter((p) => /\p{L}/u.test(p)).length;
    return palavras >= 2 && palavras <= 5;
  }
  defaultMessage(): string {
    return 'name deve ter de 3 a 60 caracteres e de 2 a 5 palavras, só com letras, espaços, hífen e ponto.';
  }
}

/** 3 letras A-Z que aparecem no nome em ordem; a primeira é a primeira letra do nome. */
@ValidatorConstraint({ name: 'siglaCompativelComNome', async: false })
export class SiglaCompativelComNome implements ValidatorConstraintInterface {
  validate(sigla: unknown, args: ValidationArguments): boolean {
    if (typeof sigla !== 'string' || !/^[A-Z]{3}$/.test(sigla)) return false;
    if (sigla[0] === sigla[1] && sigla[1] === sigla[2]) return false;

    const { name } = args.object as Record<string, unknown>;
    if (typeof name !== 'string') return true; // o validador do nome já recusa

    const letras = semAcentos(name)
      .toLowerCase()
      .replace(/[^a-z]/g, '');
    if (letras[0] !== sigla[0].toLowerCase()) return false;

    let posicao = 0;
    for (const letra of sigla.toLowerCase()) {
      const achou = letras.indexOf(letra, posicao);
      if (achou === -1) return false;
      posicao = achou + 1;
    }
    return true;
  }
  defaultMessage(): string {
    return 'acronym deve ter 3 letras de A a Z, que aparecem no nome nessa ordem, começando pela primeira letra do nome, e não pode ter as 3 letras iguais.';
  }
}
