import { Transform } from 'class-transformer';
import { Validate } from 'class-validator';
import { normalizarEspacos } from '../../common/utils/texto';
import { NomeClubeValido, SiglaCompativelComNome } from './validadores-clube';

export class CriarClubeDto {
  @Transform(({ value }) => normalizarEspacos(value))
  @Validate(NomeClubeValido)
  name: string;

  @Validate(SiglaCompativelComNome)
  acronym: string;
}
