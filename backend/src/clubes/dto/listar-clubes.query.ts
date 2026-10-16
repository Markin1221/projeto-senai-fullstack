import { IsIn, IsOptional } from 'class-validator';

export class ListarClubesQuery {
  @IsOptional()
  @IsIn(['name', 'net_worth_asc', 'net_worth_desc'])
  sort?: string;
}
