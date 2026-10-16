import { InteiroEntre } from '../../common/validators/inteiro-entre.validator';
import { DataBrasilia } from '../../common/validators/validadores';

export class ComprarJogadorDto {
  @InteiroEntre(1, 2147483647)
  club_id: number;

  @DataBrasilia()
  loyalty_until: string;
}
