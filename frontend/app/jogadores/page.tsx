"use client";

import { useCallback, useMemo, useState } from "react";
import type { OpcaoSelect } from "@/components/campo-select";
import { DialogoConfirmacao } from "@/components/dialogo-confirmacao";
import { FormularioCondicao } from "@/components/formulario-condicao";
import { FormularioJogador } from "@/components/formulario-jogador";
import { Modal } from "@/components/modal";
import { Paginacao } from "@/components/paginacao";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { useDebounce } from "@/hooks/use-debounce";
import { useEnvio } from "@/hooks/use-envio";
import { excluirJogador, listarClubes, listarJogadores } from "@/lib/api";
import { avisarErro, avisarSucesso } from "@/lib/avisos";
import {
  FILTROS_INICIAIS,
  OPCOES_CONDICAO,
  OPCOES_ORDEM,
  OPCOES_POSICAO,
  OPCOES_SITUACAO,
  consultaDeFiltros,
  type FiltrosJogadores,
} from "@/lib/filtros-jogadores";
import { NOMES_POSICAO, formatarMoeda } from "@/lib/formatar";
import {
  ArrowUpDown,
  Coins,
  HeartPulse,
  Plus,
  Search,
  Shield,
  Shirt,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AbasSegmentadas } from "@/components/abas-segmentadas";
import { AvatarIniciais } from "@/components/avatar-iniciais";
import { BarraAtributo } from "@/components/barra-atributo";
import { FiltroFaixa } from "@/components/filtro-faixa";
import { PainelJogador } from "@/components/painel-jogador";
import { MenuAcoesJogador } from "@/components/menu-acoes-jogador";
import { FiltroSelect } from "@/components/filtro-select";
import { Input } from "@/components/ui/input";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { SeloCondicao } from "@/components/selo-condicao";
import { SeloPosicao } from "@/components/selo-posicao";
import type { Jogador } from "@/lib/tipos";
import { FormularioCompra } from "@/components/formulario-compra";

const carregarClubes = () => listarClubes();

interface Acoes {
  detalhes: (jogador: Jogador) => void;
  editar: (jogador: Jogador) => void;
  condicao: (jogador: Jogador) => void;
  excluir: (jogador: Jogador) => void;
  comprar: (jogador: Jogador) => void;
}

function criarColunas(
  clubesPorId: Map<number, { name: string; acronym: string }>,
  acoes: Acoes,
): Coluna<Jogador>[] {
  return [
    {
      titulo: "Jogador",
      celula: (j) => (
        <div className="flex items-center gap-3">
          <AvatarIniciais nome={j.name} id={j.id} />
          <div className="leading-tight">
            <p className="font-medium">{j.name}</p>
            <p className="text-xs text-muted-foreground">
              {NOMES_POSICAO[j.position]}
            </p>
          </div>
        </div>
      ),
    },
    { titulo: "Posição", celula: (j) => <SeloPosicao posicao={j.position} /> },
    {
      titulo: "Overall",
      celula: (j) => <strong>{j.overall}</strong>,
      numerica: true,
    },
    {
      titulo: "Agilidade",
      celula: (j) => (
        <span className="inline-flex items-center gap-2">
          {j.agility}
          <BarraAtributo valor={j.agility} />
        </span>
      ),
      numerica: true,
    },
    { titulo: "Idade", celula: (j) => j.age, numerica: true },
    {
      titulo: "Condição",
      celula: (j) => <SeloCondicao condicao={j.condition} />,
    },
    {
      titulo: "Valor base",
      celula: (j) => formatarMoeda(j.base_value),
      numerica: true,
    },
    {
      titulo: "Valor de mercado",
      celula: (j) => formatarMoeda(j.market_value),
      numerica: true,
    },
    {
      titulo: "Clube",
      celula: (j) => {
        if (j.club_id === null) {
          return (
            <span className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium">
              Livre
            </span>
          );
        }
        const clube = clubesPorId.get(j.club_id);
        return (
          <span className="inline-flex items-center gap-2">
            <span className="rounded-md border px-1.5 py-0.5 text-xs font-semibold">
              {clube?.acronym ?? "—"}
            </span>
            <Link
              href={`/clubes/${j.club_id}`}
              className="underline underline-offset-4"
            >
              {clube?.name ?? `#${j.club_id}`}
            </Link>
          </span>
        );
      },
    },
    {
      titulo: "Ações",
      celula: (j) => (
        <div className="flex items-center justify-end gap-2">
          {j.club_id === null && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => acoes.comprar(j)}
            >
              <ShoppingCart aria-hidden="true" className="size-4" />
              Comprar
            </Button>
          )}
          <MenuAcoesJogador
            nome={j.name}
            livre={j.club_id === null}
            aoVerDetalhes={() => acoes.detalhes(j)}
            aoEditar={() => acoes.editar(j)}
            aoAlterarCondicao={() => acoes.condicao(j)}
            aoComprar={() => acoes.comprar(j)}
            aoExcluir={() => acoes.excluir(j)}
          />
        </div>
      ),
    },
  ];
}

export default function PaginaJogadores() {
  const [filtros, setFiltros] = useState<FiltrosJogadores>(FILTROS_INICIAIS);
  const [pagina, setPagina] = useState(1);
  const [cadastro, setCadastro] = useState<{ jogador?: Jogador } | null>(null);
  const [condicaoDe, setCondicaoDe] = useState<Jogador | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Jogador | null>(null);
  const [comprarDe, setComprarDe] = useState<Jogador | null>(null);
  const [detalhe, setDetalhe] = useState<Jogador | null>(null);
  const { enviando: excluindo, executar: executarExclusao } = useEnvio();

  const pedido = useMemo(() => ({ filtros, pagina }), [filtros, pagina]);
  const pedidoAtrasado = useDebounce(pedido, 300);

  const carregar = useCallback(
    () =>
      listarJogadores(
        consultaDeFiltros(pedidoAtrasado.filtros, pedidoAtrasado.pagina),
      ),
    [pedidoAtrasado],
  );
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  const { dados: clubes } = useDados(carregarClubes);

  const clubesPorId = useMemo(
    () =>
      new Map(
        (clubes ?? []).map((c) => [c.id, { name: c.name, acronym: c.acronym }]),
      ),
    [clubes],
  );
  const acoes = useMemo<Acoes>(
    () => ({
      detalhes: setDetalhe,
      editar: (jogador) => setCadastro({ jogador }),
      condicao: setCondicaoDe,
      excluir: setParaExcluir,
      comprar: setComprarDe,
    }),
    [],
  );
  const colunas = useMemo(
    () => criarColunas(clubesPorId, acoes),
    [clubesPorId, acoes],
  );
  const opcoesClube = useMemo<OpcaoSelect[]>(
    () => [
      { valor: "", rotulo: "Todos os clubes" },
      ...(clubes ?? []).map((c) => ({ valor: String(c.id), rotulo: c.name })),
    ],
    [clubes],
  );

  const alterar = (parcial: Partial<FiltrosJogadores>) => {
    setFiltros((atual) => ({ ...atual, ...parcial }));
    setPagina(1);
  };
  const apenasLivres = filtros.situacao === "livres";

  const confirmarExclusao = async () => {
    if (!paraExcluir) return;
    const alvo = paraExcluir;
    try {
      const feito = await executarExclusao(() =>
        excluirJogador(alvo.id).then(() => true),
      );
      if (!feito) return;
      avisarSucesso("Jogador excluído.", alvo.name);
      if (dados?.data.length === 1 && pagina > 1) setPagina(pagina - 1);
      else recarregar();
    } catch (erroExclusao) {
      avisarErro(erroExclusao);
    }
    setParaExcluir(null);
  };

  const filtrado = Object.entries(filtros).some(
    ([chave, valor]) =>
      chave !== "ordem" &&
      chave !== "pagina" &&
      valor !== (FILTROS_INICIAIS as unknown as Record<string, unknown>)[chave],
  );

  return (
    <section className="space-y-4">
      <CabecalhoPagina
        icone={Users}
        titulo="Jogadores"
        descricao="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
      >
        <Button onClick={() => setCadastro({})}>
          <Plus aria-hidden="true" className="size-4" />
          Novo jogador
        </Button>
      </CabecalhoPagina>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/30 p-2">
        <div className="relative min-w-56 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Buscar por nome"
            placeholder="Buscar por nome"
            className="h-9 bg-card pl-9"
            value={filtros.busca}
            onChange={(e) => alterar({ busca: e.target.value })}
          />
        </div>
        <FiltroSelect
          icone={Shirt}
          rotulo="Posição"
          opcoes={OPCOES_POSICAO}
          value={filtros.posicao}
          onChange={(e) => alterar({ posicao: e.target.value })}
        />
        <FiltroSelect
          icone={HeartPulse}
          rotulo="Condição"
          opcoes={OPCOES_CONDICAO}
          value={filtros.condicao}
          onChange={(e) => alterar({ condicao: e.target.value })}
        />
        <FiltroSelect
          icone={Shield}
          rotulo="Clube"
          opcoes={opcoesClube}
          value={filtros.clube}
          disabled={apenasLivres}
          onChange={(e) => alterar({ clube: e.target.value })}
        />
        <FiltroFaixa
          icone={User}
          rotulo="Idade"
          minimo={filtros.idadeMin}
          maximo={filtros.idadeMax}
          aoMudarMinimo={(v) => alterar({ idadeMin: v })}
          aoMudarMaximo={(v) => alterar({ idadeMax: v })}
        />
        <FiltroFaixa
          icone={Coins}
          rotulo="Valor de mercado"
          passo="0.01"
          minimo={filtros.valorMin}
          maximo={filtros.valorMax}
          aoMudarMinimo={(v) => alterar({ valorMin: v })}
          aoMudarMaximo={(v) => alterar({ valorMax: v })}
        />
        <Button variant="ghost" onClick={() => alterar(FILTROS_INICIAIS)}>
          Limpar filtros
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <AbasSegmentadas
          opcoes={OPCOES_SITUACAO}
          valor={filtros.situacao}
          aoMudar={(valor) =>
            alterar({
              situacao: valor as FiltrosJogadores["situacao"],
              clube: valor === "livres" ? "" : filtros.clube,
            })
          }
        />
        <FiltroSelect
          icone={ArrowUpDown}
          rotulo="Ordenar por"
          comoPlaceholder={false}
          opcoes={OPCOES_ORDEM.map((o) => ({
            ...o,
            rotulo: `Ordenar: ${o.rotulo}`,
          }))}
          value={filtros.ordem}
          onChange={(e) => alterar({ ordem: e.target.value })}
        />
      </div>

      <TabelaDados
        colunas={colunas}
        linhas={dados?.data}
        carregando={carregando}
        erro={erro}
        tituloErro="Não foi possível carregar os jogadores"
        vazio={
          filtrado
            ? {
                titulo: "Nenhum jogador encontrado",
                descricao:
                  "Nenhum jogador bate com os filtros escolhidos. Ajuste ou limpe os filtros.",
                acao: (
                  <Button
                    variant="outline"
                    onClick={() => alterar(FILTROS_INICIAIS)}
                  >
                    Limpar filtros
                  </Button>
                ),
              }
            : {
                titulo: "Nenhum jogador cadastrado",
                descricao: "Com o banco recém-criado, a lista começa vazia.",
                icone: <Users />,
                acao: (
                  <Button onClick={() => setCadastro({})}>
                    <Plus aria-hidden="true" className="size-4" />
                    Novo jogador
                  </Button>
                ),
              }
        }
        chave={(j) => j.id}
        aoTentarDeNovo={recarregar}
      />

      {dados && (
        <Paginacao
          pagina={dados.meta.page}
          totalPaginas={dados.meta.total_pages}
          totalItens={dados.meta.total_items}
          rotulo="jogadores"
          aoMudar={setPagina}
        />
      )}

      <Modal
        aberto={cadastro !== null}
        titulo={cadastro?.jogador ? "Editar jogador" : "Novo jogador"}
        descricao={
          cadastro?.jogador
            ? undefined
            : "Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar."
        }
        largura="max-w-4xl"
        aoFechar={() => setCadastro(null)}
      >
        <FormularioJogador
          jogador={cadastro?.jogador}
          aoSalvar={recarregar}
          aoFechar={() => setCadastro(null)}
        />
      </Modal>

      <Modal
        aberto={detalhe !== null}
        titulo="Detalhes do jogador"
        lateral
        aoFechar={() => setDetalhe(null)}
      >
        {detalhe && (
          <PainelJogador
            jogador={detalhe}
            nomeDoClube={
              detalhe.club_id === null
                ? undefined
                : clubesPorId.get(detalhe.club_id)?.name
            }
            aoEditar={() => {
              setDetalhe(null);
              setCadastro({ jogador: detalhe });
            }}
            aoAlterarCondicao={() => {
              setDetalhe(null);
              setCondicaoDe(detalhe);
            }}
            aoComprar={() => {
              setDetalhe(null);
              setComprarDe(detalhe);
            }}
          />
        )}
      </Modal>

      <Modal
        aberto={condicaoDe !== null}
        titulo="Alterar condição física"
        descricao="A condição muda o desconto do valor de mercado, recalculado ao salvar."
        aoFechar={() => setCondicaoDe(null)}
      >
        {condicaoDe && (
          <FormularioCondicao
            jogador={condicaoDe}
            nomeDoClube={
              condicaoDe.club_id === null
                ? undefined
                : clubesPorId.get(condicaoDe.club_id)?.name
            }
            aoSalvar={recarregar}
            aoFechar={() => setCondicaoDe(null)}
          />
        )}
      </Modal>
      <Modal
        aberto={comprarDe !== null}
        titulo="Comprar jogador"
        descricao="Escolha o clube comprador e até quando vai a fidelidade do contrato."
        largura="max-w-[560px]"
        aoFechar={() => setComprarDe(null)}
      >
        {comprarDe && (
          <FormularioCompra
            jogador={comprarDe}
            clubes={clubes ?? []}
            aoSalvar={recarregar}
            aoFechar={() => setComprarDe(null)}
          />
        )}
      </Modal>

      <DialogoConfirmacao
        aberto={paraExcluir !== null}
        titulo="Excluir jogador"
        mensagem={`Excluir ${paraExcluir?.name ?? "o jogador"}? Essa ação não pode ser desfeita.`}
        rotuloConfirmar="Excluir"
        enviando={excluindo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setParaExcluir(null)}
      />
    </section>
  );
}
