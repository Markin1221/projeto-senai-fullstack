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
}
