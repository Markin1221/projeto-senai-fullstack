import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { formatarDataBrasilia } from '../common/utils/datas';
import { compararNomes } from '../common/utils/texto';
import { compararElenco, paraResposta } from '../jogadores/jogador.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { diasRestantes, percentualMulta } from '../regras/mercado';
import { resumoDoClube } from './clube.mapper';
import { CriarClubeDto } from './dto/criar-clube.dto';
import { posicoesFecham, Formacao, Posicao } from '../regras/regras';

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

  async definirEscalacao(
    clubId: number,
    formacao: Formacao,
    playerIds: number[],
  ) {
    // 1. Validar os dados recebidos
    const formacoesPermitidas: Formacao[] = ['3-1', '2-2', '2-1-1', '1-2-1'];

    if (!formacoesPermitidas.includes(formacao)) {
      throw new BadRequestException('Formação inválida');
    }

    if (
      !Array.isArray(playerIds) ||
      playerIds.length !== 5 ||
      !playerIds.every((id) => Number.isInteger(id) && id > 0) ||
      new Set(playerIds).size !== 5
    ) {
      throw new BadRequestException(
        'Informe exatamente 5 IDs positivos, inteiros e distintos',
      );
    }

    // 2. Verificar se o clube existe
    const clube = await this.prisma.clubes.findUnique({
      where: { id: clubId },
    });

    if (!clube) {
      throw new NotFoundException('Clube não encontrado');
    }

    // 3. Buscar os jogadores
    const jogadores = await this.prisma.jogadores.findMany({
      where: {
        id: { in: playerIds },
      },
    });

    if (jogadores.length !== 5) {
      throw new NotFoundException('Um ou mais jogadores não foram encontrados');
    }

    // 4. Verificar se todos pertencem ao clube
    const jogadoresForaDoClube = jogadores.some(
      (jogador) => jogador.clube_id !== clubId,
    );

    if (jogadoresForaDoClube) {
      throw new ConflictException(
        'Todos os jogadores devem pertencer ao clube',
      );
    }

    // 5. Verificar se algum jogador está doente
    const jogadorDoente = jogadores.some(
      (jogador) => jogador.condicao === 'DOENTE',
    );

    if (jogadorDoente) {
      throw new ConflictException('Jogadores DOENTE não podem ser escalados');
    }

    // 6. Validar a formação com as posições
    const posicoes = jogadores.map((jogador) => jogador.posicao as Posicao);

    if (!posicoesFecham(formacao, posicoes)) {
      throw new ConflictException(
        'As posições dos jogadores não correspondem à formação',
      );
    }

    // 7. Salvar a formação no clube
    // A persistência dos titulares depende da estrutura
    return this.prisma.$transaction(async (tx) => {
      await tx.clubes.update({
        where: { id: clubId },
        data: { formacao },
      });

      // Ajusta esta parte conforme os campos e relações
      await tx.escalacoes.deleteMany({
        where: { clube_id: clubId },
      });

      await tx.escalacoes.createMany({
        data: playerIds.map((playerId) => ({
          clube_id: clubId,
          jogador_id: playerId,
        })),
      });

      return {
        club_id: clubId,
        formation: formacao,
        complete: true,
        players: jogadores,
      };
    });
  }
}
