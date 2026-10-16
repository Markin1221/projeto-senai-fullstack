import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularOverall, calcularValorBase } from '../regras/regras';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { AtualizarJogadorDto } from './dto/atualizar-jogador.dto';
import { paraResposta } from './jogador.mapper';
import { Condicao } from '@prisma/client';
import { jogadores, Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import { chaveDeNome, compararNomes } from '../common/utils/texto';
import { ListarJogadoresQuery } from './dto/listar-jogadores.query';
import { ORDEM_POSICAO, valorMercadoDoJogador } from './jogador.mapper';

type Item = { jogador: jogadores; valor: Decimal };
@Injectable()
export class JogadoresService {
  constructor(private readonly prisma: PrismaService) {}

  // RN06: o jogador nasce livre e APTO, e o valor base é calculado no cadastro.
  async criar(dto: CriarJogadorDto) {
    if (dto.age >= 35 && dto.agility > 85) {
      throw new BadRequestException(
        'Jogadores com 35 anos ou mais podem ter agilidade máxima de 85',
      );
    }

    const nome = dto.name.trim().replace(/\s+/g, ' ');

    const overall = calcularOverall(dto.position, dto);
    const valorBase = calcularValorBase(overall, dto.potential, dto.age);

    const jogador = await this.prisma.jogadores.create({
      data: {
        nome,
        posicao: dto.position,
        agilidade: dto.agility,
        idade: dto.age,
        valor_base: valorBase.toFixed(2),
        condicao: Condicao.APTO,
        velocidade: dto.pace,
        finalizacao: dto.shooting,
        passe: dto.passing,
        drible: dto.dribbling,
        defesa: dto.defending,
        fisico: dto.physical,
        potencial: dto.potential,
      },
    });

    return paraResposta(jogador);
  }

  async buscarJogadoresPorId(id: number) {
    const jogador = await this.prisma.jogadores.findFirst({
      where: {
        id,
        excluido_em: null,
      },
    });

    if (!jogador) {
      throw new NotFoundException('Jogador não encontrado');
    }

    return paraResposta(jogador);
  }

  async mudarCondicao(id: number, condicaoNova: Condicao) {
    const jogador = await this.prisma.$transaction(async (tx) => {
      const jogadorAtual = await tx.jogadores.findFirst({
        where: {
          id,
          excluido_em: null,
        },
      });

      if (!jogadorAtual) {
        throw new NotFoundException('Jogador não encontrado');
      }

      if (
        jogadorAtual.condicao === Condicao.DOENTE &&
        condicaoNova === Condicao.APTO
      ) {
        throw new ConflictException(
          'Não é permitido passar diretamente de DOENTE para APTO',
        );
      }

      const jogadorAtualizado = await tx.jogadores.update({
        where: { id },
        data: {
          condicao: condicaoNova,
        },
      });

      if (condicaoNova === Condicao.DOENTE) {
        await tx.escalacoes.deleteMany({
          where: {
            jogador_id: id,
          },
        });
      }

      return jogadorAtualizado;
    });

    return paraResposta(jogador);
  }

  async atualizarJogador(id: number, dto: AtualizarJogadorDto) {
    const jogadorAtual = await this.prisma.jogadores.findFirst({
      where: {
        id,
        excluido_em: null,
      },
    });

    if (!jogadorAtual) {
      throw new NotFoundException('Jogador não encontrado');
    }

    if (dto.age < jogadorAtual.idade) {
      throw new ConflictException('A idade do jogador não pode diminuir');
    }

    if (
      jogadorAtual.clube_id !== null &&
      dto.position !== jogadorAtual.posicao
    ) {
      throw new ConflictException(
        'Não é permitido mudar a posição de um jogador que tem clube',
      );
    }

    if (dto.age >= 35 && dto.agility > 85) {
      throw new BadRequestException(
        'Jogadores com 35 anos ou mais podem ter agilidade máxima de 85',
      );
    }

    const nome = dto.name.trim().replace(/\s+/g, ' ');

    const jogador = await this.prisma.jogadores.update({
      where: { id },
      data: {
        nome,
        posicao: dto.position,
        agilidade: dto.agility,
        idade: dto.age,
      },
    });

    return paraResposta(jogador);
  }

  COMPARADORES: Record<string, (a: Item, b: Item) => number> = {
    name: (a, b) => compararNomes(a.jogador.nome, b.jogador.nome),
    position: (a, b) =>
      ORDEM_POSICAO[a.jogador.posicao] - ORDEM_POSICAO[b.jogador.posicao],
    value_asc: (a, b) => a.valor.comparedTo(b.valor),
    value_desc: (a, b) => b.valor.comparedTo(a.valor),
    age_asc: (a, b) => a.jogador.idade - b.jogador.idade,
    age_desc: (a, b) => b.jogador.idade - a.jogador.idade,
  };

  // RN09: exclusão lógica, só de jogador livre.
  async excluir(id: number) {
    const jogador = await this.prisma.jogadores.findFirst({
      where: { id, excluido_em: null },
    });
    if (!jogador) throw new NotFoundException('Jogador não encontrado');
    if (jogador.clube_id !== null) {
      throw new ConflictException('Só é possível excluir jogador livre');
    }
    const excluidos = await this.prisma.jogadores.updateMany({
      where: { id, clube_id: null, excluido_em: null },
      data: { excluido_em: new Date() },
    });
    if (excluidos.count !== 1) {
      throw new ConflictException('O jogador mudou de situação. Tente de novo');
    }
  }

  // RN07: busca, filtros, ordenação e paginação em memória.
  async listar(query: ListarJogadoresQuery) {
    const clubeId = query.club_id ? Number(query.club_id) : undefined;
    if (clubeId !== undefined) {
      const clube = await this.prisma.clubes.findUnique({
        where: { id: clubeId },
      });
      if (!clube) throw new NotFoundException('Clube não encontrado');
    }

    const where: Prisma.jogadoresWhereInput = { excluido_em: null };
    if (query.position) where.posicao = query.position;
    if (query.condition) where.condicao = query.condition;
    if (clubeId !== undefined) where.clube_id = clubeId;
    else if (query.free)
      where.clube_id = query.free === 'true' ? null : { not: null };
    if (query.min_age || query.max_age) {
      where.idade = {
        gte: Number(query.min_age ?? 16),
        lte: Number(query.max_age ?? 45),
      };
    }

    const busca = query.search ? chaveDeNome(query.search) : null;
    const minimo = new Decimal(query.min_value ?? 0);
    const maximo = new Decimal(query.max_value ?? 550);

    const itens: Item[] = (await this.prisma.jogadores.findMany({ where }))
      .map((jogador) => ({ jogador, valor: valorMercadoDoJogador(jogador) }))
      .filter(
        ({ jogador, valor }) =>
          (!busca || chaveDeNome(jogador.nome).includes(busca)) &&
          valor.gte(minimo) &&
          valor.lte(maximo),
      );

    const criterios = (query.sort ?? 'name').split(',');
    itens.sort((a, b) => {
      for (const criterio of criterios) {
        const resultado = this.COMPARADORES[criterio](a, b);
        if (resultado !== 0) return resultado;
      }
      return (
        compararNomes(a.jogador.nome, b.jogador.nome) ||
        a.jogador.id - b.jogador.id
      );
    });

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const total = itens.length;
    return {
      data: itens
        .slice((page - 1) * limit, page * limit)
        .map(({ jogador }) => paraResposta(jogador)),
      meta: {
        page,
        limit,
        total_items: total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}
