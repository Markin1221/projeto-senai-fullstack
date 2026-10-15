import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularOverall, calcularValorBase } from '../regras/regras';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { paraResposta } from './jogador.mapper';

@Injectable()
export class JogadoresService {
  constructor(private readonly prisma: PrismaService) {}

  /** RN06: o jogador nasce livre e APTO, e o valor base é calculado uma única vez, aqui. */
  async criar(dto: CriarJogadorDto) {
    const overall = calcularOverall(dto.position, dto);
    const valorBase = calcularValorBase(overall, dto.potential, dto.age);

    const jogador = await this.prisma.jogadores.create({
      data: {
        nome: dto.name,
        posicao: dto.position,
        agilidade: dto.agility,
        idade: dto.age,
        valor_base: valorBase.toFixed(2),
        condicao: 'APTO',
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
}
