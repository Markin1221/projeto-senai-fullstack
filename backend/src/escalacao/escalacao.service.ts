import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { posicoesFecham } from '../regras/regras'; // ajuste o caminho se o seu for outro
import { compararElenco, paraResposta } from '../jogadores/jogador.mapper';
import { DefinirEscalacaoDto } from './dto/definir-escalacao.dto';

@Injectable()
export class EscalacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async definir(clubeId: number, dto: DefinirEscalacaoDto) {
    await this.prisma.$transaction(async (tx) => {
      const clube = await tx.clubes.findUnique({ where: { id: clubeId } });
      if (!clube) throw new NotFoundException('Clube não encontrado.');

      const jogadores = await tx.jogadores.findMany({
        where: { id: { in: dto.player_ids }, excluido_em: null },
      });
      if (jogadores.length !== dto.player_ids.length) {
        throw new NotFoundException('Jogador não encontrado.');
      }
      if (jogadores.some((j) => j.clube_id !== clubeId)) {
        throw new ConflictException('Jogador não pertence ao elenco do clube.');
      }
      if (jogadores.some((j) => j.condicao === 'DOENTE')) {
        throw new ConflictException('Jogador doente não pode ser escalado.');
      }
      if (
        !posicoesFecham(
          dto.formation,
          jogadores.map((j) => j.posicao),
        )
      ) {
        throw new ConflictException(
          'As posições não fecham a formação escolhida.',
        );
      }

      await tx.escalacoes.deleteMany({ where: { clube_id: clubeId } });
      await tx.escalacoes.createMany({
        data: dto.player_ids.map((jogador_id) => ({
          clube_id: clubeId,
          jogador_id,
        })),
      });
      await tx.clubes.update({
        where: { id: clubeId },
        data: { formacao: dto.formation },
      });
    });

    return this.buscar(clubeId);
  }

  async buscar(clubeId: number) {
    const clube = await this.prisma.clubes.findUnique({
      where: { id: clubeId },
    });
    if (!clube) throw new NotFoundException('Clube não encontrado.');

    const linhas = await this.prisma.escalacoes.findMany({
      where: { clube_id: clubeId },
    });
    const jogadores = await this.prisma.jogadores.findMany({
      where: {
        id: { in: linhas.map((l) => l.jogador_id) },
        clube_id: clubeId,
        excluido_em: null,
        condicao: { not: 'DOENTE' },
      },
    });
    jogadores.sort(compararElenco);

    return {
      club_id: clube.id,
      formation: clube.formacao,
      complete: jogadores.length === 5,
      players: jogadores.map(paraResposta),
    };
  }
}
