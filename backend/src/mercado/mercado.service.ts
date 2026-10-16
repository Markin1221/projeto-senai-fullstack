import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  formatarDataBrasilia,
  interpretarDataBrasilia,
} from '../common/utils/datas';
import { formatarLimite, formatarMoeda } from '../common/utils/dinheiro';
import { valorMercadoDoJogador } from '../jogadores/jogador.mapper';
import { PrismaService } from '../prisma/prisma.service';
import {
  LIMITE_ELENCO,
  calcularTaxaCompra,
  calcularVenda,
  compraDentroDoLimite,
  diasRestantes,
  fidelidadeValida,
} from '../regras/mercado';
import { ComprarJogadorDto } from './dto/comprar-jogador.dto';
import { transacaoParaResposta } from './transacao.mapper';

@Injectable()
export class MercadoService {
  constructor(private readonly prisma: PrismaService) {}

  // RN12 e RN13
  async comprar(jogadorId: number, dto: ComprarJogadorDto) {
    const agora = new Date();
    const fidelidadeAte = interpretarDataBrasilia(dto.loyalty_until) as Date;
    if (!fidelidadeValida(fidelidadeAte, agora)) {
      throw new BadRequestException(
        'loyalty_until deve ser depois da compra e até 1.095 dias a partir de agora',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const jogador = await tx.jogadores.findFirst({
        where: { id: jogadorId, excluido_em: null },
      });
      if (!jogador) throw new NotFoundException('Jogador não encontrado');

      const clube = await tx.clubes.findUnique({ where: { id: dto.club_id } });
      if (!clube) throw new NotFoundException('Clube não encontrado');

      if (jogador.clube_id !== null) {
        throw new ConflictException(
          `${jogador.nome} não está livre e não pode ser comprado`,
        );
      }

      const jaVendeu = await tx.contratos.findFirst({
        where: {
          jogador_id: jogador.id,
          clube_id: clube.id,
          situacao: { not: 'ATIVO' },
        },
      });
      if (jaVendeu) {
        throw new ConflictException(
          `O ${clube.nome} já vendeu ${jogador.nome} e não pode comprá-lo de novo`,
        );
      }

      const tamanhoElenco = await tx.jogadores.count({
        where: { clube_id: clube.id },
      });
      if (tamanhoElenco >= LIMITE_ELENCO) {
        throw new ConflictException(
          `O elenco do ${clube.nome} já tem ${LIMITE_ELENCO} jogadores, o limite da liga`,
        );
      }

      const valor = valorMercadoDoJogador(jogador);
      const taxa = calcularTaxaCompra(valor);
      const custo = valor.plus(taxa);
      const caixa = clube.caixa.toString();
      if (!compraDentroDoLimite(custo, caixa)) {
        throw new ConflictException(
          `O custo da compra (${formatarMoeda(custo)}) passa do limite de 50% do caixa (${formatarLimite(new Decimal(caixa).div(2))})`,
        );
      }

      // Travas contra compras simultâneas: o jogador ainda tem que estar livre e o caixa ainda cobre o limite.
      const reservado = await tx.jogadores.updateMany({
        where: { id: jogador.id, clube_id: null, excluido_em: null },
        data: { clube_id: clube.id },
      });
      if (reservado.count !== 1) {
        throw new ConflictException(`${jogador.nome} não está mais livre`);
      }
      const debitado = await tx.clubes.updateMany({
        where: { id: clube.id, caixa: { gte: custo.times(2).toFixed(2) } },
        data: { caixa: { decrement: custo.toFixed(2) } },
      });
      if (debitado.count !== 1) {
        throw new ConflictException(
          'O caixa do clube mudou e o custo passou do limite de 50%. Tente de novo',
        );
      }

      await tx.contratos.create({
        data: {
          jogador_id: jogador.id,
          clube_id: clube.id,
          valor_compra: valor.toFixed(2),
          fidelidade_ate: fidelidadeAte,
          situacao: 'ATIVO',
          iniciado_em: agora,
        },
      });
      const transacao = await tx.transacoes.create({
        data: {
          clube_id: clube.id,
          jogador_id: jogador.id,
          nome_jogador: jogador.nome,
          tipo: 'COMPRA',
          valor: valor.toFixed(2),
          taxa: taxa.toFixed(2),
          multa: '0.00',
          lucro: null,
          variacao_caixa: custo.negated().toFixed(2),
          criado_em: agora,
        },
      });
      const atualizado = await tx.clubes.findUniqueOrThrow({
        where: { id: clube.id },
      });

      return {
        ...transacaoParaResposta(transacao),
        contract: {
          purchase_value: valor.toNumber(),
          loyalty_until: formatarDataBrasilia(fidelidadeAte),
          status: 'ATIVO',
        },
        club_cash: atualizado.caixa.toNumber(),
      };
    });
  }

  // RN15 e RN16
  async vender(jogadorId: number) {
    const agora = new Date();

    return this.prisma.$transaction(async (tx) => {
      const jogador = await tx.jogadores.findFirst({
        where: { id: jogadorId, excluido_em: null },
      });
      if (!jogador) throw new NotFoundException('Jogador não encontrado');
      if (jogador.clube_id === null) {
        throw new ConflictException(
          `${jogador.nome} já está livre e não pode ser vendido`,
        );
      }
      const clubeId = jogador.clube_id;

      const contrato = await tx.contratos.findFirst({
        where: { jogador_id: jogador.id, clube_id: clubeId, situacao: 'ATIVO' },
      });
      if (!contrato) {
        throw new InternalServerErrorException(
          'Contrato ativo do jogador não encontrado',
        );
      }

      const valorVenda = valorMercadoDoJogador(jogador);
      const dias = diasRestantes(contrato.fidelidade_ate, agora);
      const venda = calcularVenda(
        valorVenda,
        contrato.valor_compra.toString(),
        dias,
      );

      const liberado = await tx.jogadores.updateMany({
        where: { id: jogador.id, clube_id: clubeId },
        data: { clube_id: null },
      });
      if (liberado.count !== 1) {
        throw new ConflictException(
          'O jogador mudou de situação. Tente de novo',
        );
      }
      await tx.escalacoes.deleteMany({ where: { jogador_id: jogador.id } });
      await tx.contratos.update({
        where: { id: contrato.id },
        data: { situacao: venda.situacaoContrato, encerrado_em: agora },
      });
      const clube = await tx.clubes.update({
        where: { id: clubeId },
        data: { caixa: { increment: venda.credito.toFixed(2) } },
      });
      const transacao = await tx.transacoes.create({
        data: {
          clube_id: clubeId,
          jogador_id: jogador.id,
          nome_jogador: jogador.nome,
          tipo: 'VENDA',
          valor: valorVenda.toFixed(2),
          taxa: venda.comissao.toFixed(2),
          multa: venda.multa.toFixed(2),
          lucro: venda.lucro.toFixed(2),
          variacao_caixa: venda.credito.toFixed(2),
          criado_em: agora,
        },
      });

      return {
        ...transacaoParaResposta(transacao),
        purchase_value: contrato.valor_compra.toNumber(),
        remaining_days: dias,
        penalty_rate: venda.percentualMulta,
        contract_status: venda.situacaoContrato,
        club_cash: clube.caixa.toNumber(),
      };
    });
  }
}
