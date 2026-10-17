import { InteiroEntre } from '../../common/validators/inteiro-entre.validator';

export class CriarPartidaDto {
  @InteiroEntre(1, 2147483647)
  home_club_id!: number;

  @InteiroEntre(1, 2147483647)
  away_club_id!: number;
}
