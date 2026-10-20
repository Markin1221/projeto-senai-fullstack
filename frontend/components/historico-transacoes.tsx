"use client";

import {
  ArrowDownRight,
  Check,
  CircleDollarSign,
  Download,
  HandCoins,
  History,
  Receipt,
  ShoppingCart,
  TriangleAlert,
  User,
} from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { AvatarIniciais } from "@/components/avatar-iniciais";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { useEnvio } from "@/hooks/use-envio";
import {
  ApiError,
  baixarCsvDoClube,
  listarTransacoes,
  mensagemDeErro,
} from "@/lib/api";
import { avisarErro, avisarSucesso } from "@/lib/avisos";
import { nomeDeArquivoSeguro, salvarArquivo } from "@/lib/download";
import {
  formatarData,
  formatarHora,
  formatarMoeda,
  formatarVariacao,
} from "@/lib/formatar";
import type { Transacao } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const TIPOS = [
  { valor: "COMPRA", rotulo: "Compra" },
  { valor: "VENDA", rotulo: "Venda" },
];

const corDoSinal = (valor: number) =>
  valor < 0 ? "text-destructive" : valor > 0 ? "text-success" : "";

const dinheiro = (valor: number) => (
  <span className={valor === 0 ? "text-muted-foreground" : undefined}>
    {formatarMoeda(valor)}
  </span>
);

const COLUNAS: Coluna<Transacao>[] = [
  {
    titulo: "Data e hora",
    celula: (t) => (
      <span className="whitespace-nowrap">
        {formatarData(t.created_at)}{" "}
        <span className="text-muted-foreground">
          {formatarHora(t.created_at)}
        </span>
      </span>
    ),
  },
  {
    titulo: "Tipo",
    celula: (t) => (
      <span className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-0.5 text-xs font-medium">
        {t.type === "COMPRA" ? (
          <ShoppingCart aria-hidden="true" className="size-3" />
        ) : (
          <HandCoins aria-hidden="true" className="size-3" />
        )}
        {t.type === "COMPRA" ? "Compra" : "Venda"}
      </span>
    ),
  },
  {
    titulo: "Jogador",
    celula: (t) => (
      <span className="flex items-center gap-2.5 font-medium">
        <AvatarIniciais nome={t.player_name} id={t.player_id} />
        {t.player_name}
      </span>
    ),
  },
  { titulo: "Valor", celula: (t) => formatarMoeda(t.value), numerica: true },
  {
    titulo: "Taxa ou comissão",
    celula: (t) => dinheiro(t.fee),
    numerica: true,
  },
  { titulo: "Multa", celula: (t) => dinheiro(t.penalty), numerica: true },
  {
    titulo: "Lucro",
    celula: (t) =>
      t.profit === null ? (
        <span className="text-muted-foreground">–</span>
      ) : (
        <span className={corDoSinal(t.profit)}>
          {formatarVariacao(t.profit)}
        </span>
      ),
    numerica: true,
  },
  {
    titulo: "Variação do caixa",
    celula: (t) => (
      <span className={cn("font-semibold", corDoSinal(t.cash_change))}>
        {formatarVariacao(t.cash_change)}
      </span>
    ),
    numerica: true,
  },
];

function Total({
  icone,
  rotulo,
  valor,
  dica,
  cor,
}: {
  icone: ReactNode;
  rotulo: string;
  valor: string;
  dica: string;
  cor?: string;
}) {
  return (
    <div className="space-y-1 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icone}
        {rotulo}
      </p>
      <p className={cn("text-lg font-semibold tabular-nums", cor)}>{valor}</p>
      <p className="text-xs text-muted-foreground">{dica}</p>
    </div>
  );
}

interface Props {
  clubeId: number;
  clubeNome: string;
  caixaAtual?: number;
}

export function HistoricoTransacoes({ clubeId, clubeNome, caixaAtual }: Props) {
  const [tipos, setTipos] = useState<string[]>([]);
  const [jogador, setJogador] = useState("");
  const { enviando, executar } = useEnvio();

  const consulta = useMemo(
    () => ({ type: tipos.join(","), player_id: jogador }),
    [tipos, jogador],
  );
  // Recusa da API (4xx, como filtro de jogador excluído): mantém os filtros e
  // mostra o `message` no lugar da tabela e dos totais.
  const carregar = useCallback(async () => {
    try {
      return { resposta: await listarTransacoes(clubeId, consulta) };
    } catch (e) {
      if (e instanceof ApiError && e.status >= 400 && e.status < 500) {
        return { recusa: mensagemDeErro(e) };
      }
      throw e;
    }
  }, [clubeId, consulta]);
  const carregarTodas = useCallback(() => listarTransacoes(clubeId), [clubeId]);
  const { dados: resultado, carregando, erro, recarregar } = useDados(carregar);
  const dados =
    resultado && "resposta" in resultado ? resultado.resposta : undefined;
  const recusa =
    resultado && "recusa" in resultado ? resultado.recusa : undefined;
  const filtrado = tipos.length > 0 || jogador !== "";
  const { dados: todas } = useDados(carregarTodas);

  const jogadores = useMemo(() => {
    const nomes = new Map(
      (todas?.data ?? []).map((t) => [t.player_id, t.player_name]),
    );
    return [...nomes].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [todas]);

  const alternarTipo = (valor: string) =>
    setTipos((atual) =>
      TIPOS.map((t) => t.valor).filter((v) =>
        v === valor ? !atual.includes(v) : atual.includes(v),
      ),
    );

  const exportar = async () => {
    try {
      const arquivo = await executar(() => baixarCsvDoClube(clubeId, consulta));
      if (!arquivo) return;
      salvarArquivo(
        arquivo,
        `Histórico de ${nomeDeArquivoSeguro(clubeNome)}.csv`,
      );
      const filtros = [
        tipos.length > 0 &&
          `filtro de tipo ${tipos.map((t) => TIPOS.find((x) => x.valor === t)?.rotulo).join(" e ")}`,
        jogador !== "" && "filtro de jogador",
      ].filter(Boolean);
      avisarSucesso(
        "CSV baixado",
        filtros.length > 0
          ? `Com o ${filtros.join(" e o ")} aplicado.`
          : "Com todas as transações do clube.",
      );
    } catch (erroExportacao) {
      avisarErro(erroExportacao);
    }
  };

  const resumo = dados?.summary;

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-start justify-between gap-4 px-5 pt-4">
          <div>
            <h2 className="font-semibold">Histórico de transações</h2>
            <p className="text-xs text-muted-foreground">
              Da mais recente para a mais antiga, com o nome e os valores do
              momento de cada operação.
            </p>
          </div>
          <Button variant="outline" onClick={exportar} disabled={enviando}>
            <Download aria-hidden="true" />
            {enviando ? "Exportando…" : "Exportar CSV"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 py-4">
          <span className="text-sm text-muted-foreground">Tipo</span>
          {TIPOS.map((tipo) => {
            const ativo = tipos.includes(tipo.valor);
            return (
              <button
                key={tipo.valor}
                type="button"
                aria-pressed={ativo}
                onClick={() => alternarTipo(tipo.valor)}
                className={cn(
                  "inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-medium",
                  ativo
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-card",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-4 items-center justify-center rounded-[4px] border",
                    ativo
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {ativo && <Check className="size-3" />}
                </span>
                {tipo.rotulo}
              </button>
            );
          })}
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
          <div className="relative">
            <User
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <select
              aria-label="Jogador"
              value={jogador}
              onChange={(e) => setJogador(e.target.value)}
              className="h-8 w-52 rounded-lg border border-input bg-card pr-3 pl-9 text-sm"
            >
              <option value="">Jogador: todos</option>
              {jogadores.map(([id, nome]) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </select>
          </div>
          {filtrado && (
            <button
              type="button"
              onClick={() => {
                setTipos([]);
                setJogador("");
              }}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {recusa && (
          <div className="border-t p-5">
            <AlertaErro titulo="O filtro foi recusado" mensagem={recusa} />
          </div>
        )}

        <div
          className={cn("border-t [&_thead]:bg-muted/50", recusa && "hidden")}
        >
          <TabelaDados
            semBorda
            colunas={COLUNAS}
            linhas={dados?.data}
            carregando={carregando}
            erro={erro}
            tituloErro="Não foi possível carregar o histórico"
            vazio={{
              titulo: "Nenhuma transação ainda",
              descricao:
                "As compras e vendas do clube aparecem aqui, com os totais logo abaixo.",
              icone: <History />,
            }}
            chave={(t) => t.id}
            aoTentarDeNovo={recarregar}
          />
        </div>

        {resumo && (
          <div className="grid grid-cols-2 divide-x border-t bg-muted/50 md:grid-cols-5">
            <Total
              icone={<ShoppingCart aria-hidden="true" className="size-3.5" />}
              rotulo="Total pago em compras"
              valor={formatarMoeda(resumo.total_spent)}
              dica="Valor + taxa"
            />
            <Total
              icone={<HandCoins aria-hidden="true" className="size-3.5" />}
              rotulo="Total recebido em vendas"
              valor={formatarMoeda(resumo.total_received)}
              dica="Crédito líquido"
            />
            <Total
              icone={<Receipt aria-hidden="true" className="size-3.5" />}
              rotulo="Taxas e comissões"
              valor={formatarMoeda(resumo.total_fees)}
              dica="Somadas"
            />
            <Total
              icone={<TriangleAlert aria-hidden="true" className="size-3.5" />}
              rotulo="Multas"
              valor={formatarMoeda(resumo.total_penalties)}
              dica="Por fidelidade"
            />
            <Total
              icone={<ArrowDownRight aria-hidden="true" className="size-3.5" />}
              rotulo="Lucro total"
              valor={formatarVariacao(resumo.total_profit)}
              dica="Soma dos lucros, com sinal"
              cor={corDoSinal(resumo.total_profit)}
            />
          </div>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CircleDollarSign aria-hidden="true" className="size-3.5" />
        Os totais respeitam os filtros. 300,00 + soma das variações = caixa
        atual
        {caixaAtual !== undefined ? ` (${formatarMoeda(caixaAtual)})` : ""}.
      </p>
    </div>
  );
}
