import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { compararElenco } from '../jogadores/jogador.mapper';
import { posicoesFecham } from '../regras/regras';
import { simularPartida, Titular } from '../regras/partida';
import { CriarPartidaDto } from './dto/criar-partida.dto';
import { montarPartida } from './partida.mapper';
import { calcularClassificacao } from '../regras/classificacao';

type ClubeLinha = { id: number; nome: string; formacao: string | null };

@Injectable()
export class PartidasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CriarPartidaDto) {
    if (dto.home_club_id === dto.away_club_id) {
      throw new BadRequestException(
        'O mandante e o visitante devem ser clubes diferentes.',
      );
    }

    const partidaId = await this.prisma.$transaction(async (tx) => {
      const mandante = await tx.clubes.findUnique({
        where: { id: dto.home_club_id },
      });
      if (!mandante)
        throw new NotFoundException('Clube mandante não encontrado.');
      const visitante = await tx.clubes.findUnique({
        where: { id: dto.away_club_id },
      });
      if (!visitante)
        throw new NotFoundException('Clube visitante não encontrado.');

      const titMandante = await this.titulares(tx, mandante);
      const titVisitante = await this.titulares(tx, visitante);
      const r = simularPartida(titMandante, titVisitante);

      const partida = await tx.partidas.create({
        data: {
          mandante_id: mandante.id,
          visitante_id: visitante.id,
          gols_mandante: r.golsMandante,
          gols_visitante: r.golsVisitante,
          formacao_mandante: mandante.formacao!,
          formacao_visitante: visitante.formacao!,
        },
      });

      await tx.duelos_partida.createMany({
        data: r.duelos.map((d) => {
          const atacaCasa = d.lado === 'MANDANTE';
          return {
            partida_id: partida.id,
            ordem: d.ordem,
            clube_atacante_id: atacaCasa ? mandante.id : visitante.id,
            atacante_id: d.atacante.id,
            defensor_id: d.defensor.id,
            nome_atacante: d.atacante.nome,
            nome_defensor: d.defensor.nome,
            posicao_atacante: d.atacante.posicao,
            posicao_defensor: d.defensor.posicao,
            condicao_atacante: d.atacante.condicao,
            condicao_defensor: d.defensor.condicao,
            atributo_ataque: d.atacante.atributo,
            atributo_defesa: d.defensor.atributo,
            valor_ataque: d.atacante.valor,
            valor_defesa: d.defensor.valor,
            gol: d.gol,
          };
        }),
      });

      return partida.id;
    });

    return this.buscarPorId(partidaId);
  }

  async buscarPorId(id: number) {
    const p = await this.prisma.partidas.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Partida não encontrada.');
    const duelos = await this.prisma.duelos_partida.findMany({
      where: { partida_id: id },
      orderBy: { ordem: 'asc' },
    });
    const clubes = await this.prisma.clubes.findMany({
      where: { id: { in: [p.mandante_id, p.visitante_id] } },
    });
    const nome = (cid: number) => clubes.find((c) => c.id === cid)!.nome;
    return montarPartida(p, nome(p.mandante_id), nome(p.visitante_id), duelos);
  }
  async listar(clubIdBruto?: unknown) {
    let clubId: number | undefined;
    if (clubIdBruto !== undefined) {
      if (
        typeof clubIdBruto !== 'string' ||
        !/^[1-9]\d*$/.test(clubIdBruto) ||
        Number(clubIdBruto) > 2147483647
      ) {
        throw new BadRequestException('club_id deve ser um inteiro positivo.');
      }
      clubId = Number(clubIdBruto);
      const existe = await this.prisma.clubes.findUnique({
        where: { id: clubId },
      });
      if (!existe) throw new NotFoundException('Clube não encontrado.');
    }

    const partidas = await this.prisma.partidas.findMany({
      where: clubId
        ? { OR: [{ mandante_id: clubId }, { visitante_id: clubId }] }
        : undefined,
      orderBy: [{ jogada_em: 'desc' }, { id: 'desc' }],
    });

    const ids = [
      ...new Set(partidas.flatMap((p) => [p.mandante_id, p.visitante_id])),
    ];
    const clubes = await this.prisma.clubes.findMany({
      where: { id: { in: ids } },
    });
    const nome = (cid: number) => clubes.find((c) => c.id === cid)!.nome;

    return partidas.map((p) =>
      montarPartida(p, nome(p.mandante_id), nome(p.visitante_id)),
    );
  }

  async classificacao() {
    const [clubes, partidas] = await Promise.all([
      this.prisma.clubes.findMany(),
      this.prisma.partidas.findMany(),
    ]);
    return calcularClassificacao(
      clubes.map((c) => ({ id: c.id, nome: c.nome })),
      partidas.map((p) => ({
        mandanteId: p.mandante_id,
        visitanteId: p.visitante_id,
        golsMandante: p.gols_mandante,
        golsVisitante: p.gols_visitante,
      })),
    );
  }

  private async titulares(
    tx: Prisma.TransactionClient,
    clube: ClubeLinha,
  ): Promise<Titular[]> {
    const linhas = await tx.escalacoes.findMany({
      where: { clube_id: clube.id },
    });
    const jogadores = await tx.jogadores.findMany({
      where: {
        id: { in: linhas.map((l) => l.jogador_id) },
        clube_id: clube.id,
        excluido_em: null,
        condicao: { not: 'DOENTE' },
      },
    });
    jogadores.sort(compararElenco);

    if (
      !clube.formacao ||
      jogadores.length !== 5 ||
      !posicoesFecham(
        clube.formacao as any,
        jogadores.map((j) => j.posicao),
      )
    ) {
      throw new ConflictException(
        `Escalação incompleta: o ${clube.nome} não tem os 5 titulares.`,
      );
    }

    return jogadores.map((j) => ({
      id: j.id,
      nome: j.nome,
      posicao: j.posicao,
      condicao: j.condicao,
      atributos: {
        pace: j.velocidade,
        shooting: j.finalizacao,
        passing: j.passe,
        dribbling: j.drible,
        defending: j.defesa,
        physical: j.fisico,
      },
    }));
  }
}
