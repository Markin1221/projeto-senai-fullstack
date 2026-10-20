import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { formatarDataBrasilia } from '../common/utils/datas';
import { compararNomes } from '../common/utils/texto';
import { compararElenco, paraResposta } from '../jogadores/jogador.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { diasRestantes, percentualMulta } from '../regras/mercado';
import { resumoDoClube } from './clube.mapper';
import { CriarClubeDto } from './dto/criar-clube.dto';

const LIMITE_CLUBES = 20;

@Injectable()
export class ClubesService {
  constructor(private readonly prisma: PrismaService) {}

  // RN10: caixa inicial 300,00 (default do banco); nome único sem diferenciar maiúsculas, acentos contam.
  async criar(dto: CriarClubeDto) {
    const nomeNormalizado = dto.name.toLowerCase();
    const [mesmoNome, mesmaSigla, total] = await Promise.all([
      this.prisma.clubes.findFirst({
        where: { nome_normalizado: nomeNormalizado },
      }),
      this.prisma.clubes.findUnique({ where: { sigla: dto.acronym } }),
      this.prisma.clubes.count(),
    ]);
    if (mesmoNome) {
      throw new ConflictException(
        `Já existe um clube com o nome “${mesmoNome.nome}”`,
      );
    }
    if (mesmaSigla) {
      throw new ConflictException(`A sigla ${dto.acronym} já está em uso`);
    }
    if (total >= LIMITE_CLUBES) {
      throw new ConflictException(
        `A liga aceita no máximo ${LIMITE_CLUBES} clubes`,
      );
    }

    const clube = await this.prisma.clubes.create({
      data: {
        nome: dto.name,
        nome_normalizado: nomeNormalizado,
        sigla: dto.acronym,
      },
    });
    return resumoDoClube(clube, []);
  }

  async listar(sort = 'name') {
    const clubes = await this.prisma.clubes.findMany({
      include: { jogadores: { where: { excluido_em: null } } },
    });
    const resumos = clubes.map((clube) =>
      resumoDoClube(clube, clube.jogadores),
    );

    return resumos.sort((a, b) => {
      if (sort === 'net_worth_asc' && a.net_worth !== b.net_worth) {
        return a.net_worth - b.net_worth;
      }
      if (sort === 'net_worth_desc' && a.net_worth !== b.net_worth) {
        return b.net_worth - a.net_worth;
      }
      return compararNomes(a.name, b.name) || a.id - b.id;
    });
  }

  async buscarPorId(id: number) {
    const clube = await this.prisma.clubes.findUnique({
      where: { id },
      include: {
        jogadores: {
          where: { excluido_em: null },
          include: { contratos: { where: { situacao: 'ATIVO' } } },
        },
      },
    });
    if (!clube) throw new NotFoundException('Clube não encontrado');

    const agora = new Date();
    const elenco = [...clube.jogadores].sort(compararElenco);

    return {
      ...resumoDoClube(clube, clube.jogadores),
      players: elenco.map((jogador) => {
        const contrato = jogador.contratos[0];
        const dias = contrato
          ? diasRestantes(contrato.fidelidade_ate, agora)
          : 0;
        return {
          ...paraResposta(jogador),
          contract: contrato
            ? {
                purchase_value: contrato.valor_compra.toNumber(),
                loyalty_until: formatarDataBrasilia(contrato.fidelidade_ate),
                remaining_days: dias,
                penalty_rate: percentualMulta(dias),
              }
            : null,
        };
      }),
    };
  }
}
