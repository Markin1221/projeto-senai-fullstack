"use client";

import { useCallback, useMemo, useState } from "react";
import { CampoFormulario } from "@/components/campo-formulario";
import { CampoSelect, type OpcaoSelect } from "@/components/campo-select";
import { DialogoConfirmacao } from "@/components/dialogo-confirmacao";
import { FormularioCondicao } from "@/components/formulario-condicao";
import { FormularioJogador } from "@/components/formulario-jogador";
import { Modal } from "@/components/modal";
import { Paginacao } from "@/components/paginacao";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Badge } from "@/components/ui/badge";
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
import { formatarMoeda, rotuloCondicao } from "@/lib/formatar";
import type { Jogador } from "@/lib/tipos";

const carregarClubes = () => listarClubes();

interface Acoes {
  editar: (jogador: Jogador) => void;
  condicao: (jogador: Jogador) => void;
  excluir: (jogador: Jogador) => void;
}

function criarColunas(
  nomesDosClubes: Map<number, string>,
  acoes: Acoes,
): Coluna<Jogador>[] {
  return [
    { titulo: "Nome", celula: (j) => j.name },
    { titulo: "Posição", celula: (j) => j.position },
    { titulo: "Overall", celula: (j) => j.overall, numerica: true },
    { titulo: "Agilidade", celula: (j) => j.agility, numerica: true },
    { titulo: "Idade", celula: (j) => j.age, numerica: true },
    {
      titulo: "Condição",
      celula: (j) => (
        <Badge variant={j.condition === "APTO" ? "secondary" : "outline"}>
          {rotuloCondicao(j.condition)}
        </Badge>
      ),
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
      celula: (j) =>
        j.club_id === null
          ? "Livre"
          : (nomesDosClubes.get(j.club_id) ?? `#${j.club_id}`),
    },
    {
      titulo: "Ações",
      celula: (j) => (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => acoes.editar(j)}>
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => acoes.condicao(j)}>
            Condição
          </Button>
          {j.club_id === null && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => acoes.excluir(j)}
            >
              Excluir
            </Button>
          )}
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

  const nomesDosClubes = useMemo(
    () => new Map((clubes ?? []).map((c) => [c.id, c.name])),
    [clubes],
  );
  const acoes = useMemo<Acoes>(
    () => ({
      editar: (jogador) => setCadastro({ jogador }),
      condicao: setCondicaoDe,
      excluir: setParaExcluir,
    }),
    [],
  );
  const colunas = useMemo(
    () => criarColunas(nomesDosClubes, acoes),
    [nomesDosClubes, acoes],
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

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Jogadores</h1>
        <Button onClick={() => setCadastro({})}>Novo jogador</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <CampoFormulario
          rotulo="Buscar por nome"
          value={filtros.busca}
          onChange={(e) => alterar({ busca: e.target.value })}
        />
        <CampoSelect
          rotulo="Posição"
          opcoes={OPCOES_POSICAO}
          value={filtros.posicao}
          onChange={(e) => alterar({ posicao: e.target.value })}
        />
        <CampoSelect
          rotulo="Condição"
          opcoes={OPCOES_CONDICAO}
          value={filtros.condicao}
          onChange={(e) => alterar({ condicao: e.target.value })}
        />
        <CampoSelect
          rotulo="Situação"
          opcoes={OPCOES_SITUACAO}
          value={filtros.situacao}
          onChange={(e) =>
            alterar({
              situacao: e.target.value as FiltrosJogadores["situacao"],
              clube: e.target.value === "livres" ? "" : filtros.clube,
            })
          }
        />
        <CampoSelect
          rotulo="Clube"
          opcoes={opcoesClube}
          value={filtros.clube}
          disabled={apenasLivres}
          onChange={(e) => alterar({ clube: e.target.value })}
        />
        <CampoFormulario
          rotulo="Idade mínima"
          type="number"
          value={filtros.idadeMin}
          onChange={(e) => alterar({ idadeMin: e.target.value })}
        />
        <CampoFormulario
          rotulo="Idade máxima"
          type="number"
          value={filtros.idadeMax}
          onChange={(e) => alterar({ idadeMax: e.target.value })}
        />
        <CampoSelect
          rotulo="Ordenar por"
          opcoes={OPCOES_ORDEM}
          value={filtros.ordem}
          onChange={(e) => alterar({ ordem: e.target.value })}
        />
        <CampoFormulario
          rotulo="Valor mínimo (R$)"
          type="number"
          step="0.01"
          value={filtros.valorMin}
          onChange={(e) => alterar({ valorMin: e.target.value })}
        />
        <CampoFormulario
          rotulo="Valor máximo (R$)"
          type="number"
          step="0.01"
          value={filtros.valorMax}
          onChange={(e) => alterar({ valorMax: e.target.value })}
        />
        <div className="flex items-end">
          <Button variant="outline" onClick={() => alterar(FILTROS_INICIAIS)}>
            Limpar filtros
          </Button>
        </div>
      </div>

      <TabelaDados
        colunas={colunas}
        linhas={dados?.data}
        carregando={carregando}
        erro={erro}
        vazio="Nenhum jogador encontrado com esses filtros."
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
        aoFechar={() => setCadastro(null)}
      >
        <FormularioJogador
          jogador={cadastro?.jogador}
          aoSalvar={recarregar}
          aoFechar={() => setCadastro(null)}
        />
      </Modal>

      <Modal
        aberto={condicaoDe !== null}
        titulo="Alterar condição"
        aoFechar={() => setCondicaoDe(null)}
      >
        {condicaoDe && (
          <FormularioCondicao
            jogador={condicaoDe}
            aoSalvar={recarregar}
            aoFechar={() => setCondicaoDe(null)}
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
