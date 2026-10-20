"use client";

import { SeloCondicao } from "@/components/selo-condicao";
import { SeloPosicao } from "@/components/selo-posicao";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  Check,
  ClipboardList,
  Coins,
  HandCoins,
  History,
  Landmark,
  SearchX,
  Shirt,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { Abas } from "@/components/abas";
import { EstadoCentral } from "@/components/estado-central";
import { useMigalhaFinal } from "@/components/migalha-final";
import { AvatarIniciais } from "@/components/avatar-iniciais";
import { AlertaErro } from "@/components/alerta-erro";
import { CartaoIndicador } from "@/components/cartao-indicador";
import { ConfirmacaoVenda } from "@/components/confirmacao-venda";
import { HistoricoTransacoes } from "@/components/historico-transacoes";
import { Modal } from "@/components/modal";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { ApiError, buscarClube } from "@/lib/api";
import { LIMITE_ELENCO } from "@/lib/dados-clube";
import { formatarData, formatarHora, formatarNumero } from "@/lib/formatar";
import { cn } from "@/lib/utils";
import type { JogadorDoElenco } from "@/lib/tipos";
import { EscalacaoClube } from "@/components/escalacao-clube";

function PilulaMulta({ taxa }: { taxa: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums",
        taxa === 0
          ? "border-success-soft-border bg-success-soft text-success-soft-foreground"
          : "border-warning-soft-border bg-warning-soft text-warning-soft-foreground",
      )}
    >
      {taxa === 0 && <Check aria-hidden="true" className="size-3" />}
      {taxa}%
    </span>
  );
}

function criarColunas(
  aoVender: (jogador: JogadorDoElenco) => void,
): Coluna<JogadorDoElenco>[] {
  return [
    {
      titulo: "Jogador",
      celula: (j) => (
        <div className="flex items-center gap-3">
          <AvatarIniciais nome={j.name} id={j.id} />
          <span className="font-medium">{j.name}</span>
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
      titulo: "Condição",
      celula: (j) => <SeloCondicao condicao={j.condition} />,
    },
    {
      titulo: "Valor de mercado",
      celula: (j) => <strong>{formatarNumero(j.market_value)}</strong>,
      numerica: true,
    },
    {
      titulo: "Valor de compra",
      celula: (j) => (
        <span className="text-muted-foreground">
          {formatarNumero(j.contract.purchase_value)}
        </span>
      ),
      numerica: true,
    },
    {
      titulo: "Fim da fidelidade",
      celula: (j) => (
        <span className="leading-tight">
          <span className="block">
            {formatarData(j.contract.loyalty_until)}
          </span>
          <span className="block text-xs text-muted-foreground">
            {formatarHora(j.contract.loyalty_until)}
          </span>
        </span>
      ),
    },
    {
      titulo: "Dias restantes",
      celula: (j) => j.contract.remaining_days,
      numerica: true,
    },
    {
      titulo: "% de multa",
      celula: (j) => <PilulaMulta taxa={j.contract.penalty_rate} />,
    },
    {
      titulo: "Ações",
      celula: (j) => (
        <Button variant="outline" size="sm" onClick={() => aoVender(j)}>
          <HandCoins aria-hidden="true" className="size-4" />
          Vender
        </Button>
      ),
    },
  ];
}

export default function PaginaClube() {
  const { id } = useParams<{ id: string }>();
  const [aba, setAba] = useState("elenco");
  const [vendendo, setVendendo] = useState<JogadorDoElenco | null>(null);

  const carregar = useCallback(async () => {
    try {
      return await buscarClube(id);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }, [id]);
  const { dados: clube, carregando, erro, recarregar } = useDados(carregar);
  const colunas = useMemo(() => criarColunas(setVendendo), []);

  useMigalhaFinal(clube?.name);

  const totalJogadores = clube?.players.length ?? 0;
  const abas = [
    {
      id: "elenco",
      rotulo: "Elenco",
      icone: Shirt,
      contagem: clube ? totalJogadores : undefined,
    },
    { id: "escalacao", rotulo: "Escalação", icone: ClipboardList },
    { id: "historico", rotulo: "Histórico", icone: History },
  ];

  return (
    <section className="space-y-6">
      {!carregando && !erro && clube === null ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <EstadoCentral
            icone={<SearchX />}
            titulo="Clube não encontrado"
            descricao={`A API não encontrou o clube ${id}. O endereço pode estar errado ou o clube pode ter sido removido.`}
          >
            <Link
              href="/clubes"
              className="inline-flex h-9 items-center rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted"
            >
              Voltar para clubes
            </Link>
          </EstadoCentral>
        </div>
      ) : erro ? (
        <>
          <Link
            href="/clubes"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Voltar para clubes
          </Link>
          <AlertaErro mensagem={erro} aoTentarDeNovo={recarregar} />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl border bg-muted text-sm font-semibold">
                {clube?.acronym ?? "…"}
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl leading-none font-semibold tracking-tight">
                  {clube?.name ?? "Clube"}
                </h1>
                {clube && (
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-md border px-2 py-0.5">
                      Sigla {clube.acronym}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5">
                      <Shirt aria-hidden="true" className="size-3" />
                      {totalJogadores} de {LIMITE_ELENCO} jogadores
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/jogadores"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingCart aria-hidden="true" className="size-4" />
              Comprar jogadores
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <CartaoIndicador
              rotulo="Caixa"
              icone={Wallet}
              valor={clube ? formatarNumero(clube.cash) : "—"}
              unidade="moedas"
              dica="Só muda por compras e vendas"
            />
            <CartaoIndicador
              rotulo="Valor do elenco"
              icone={Coins}
              valor={clube ? formatarNumero(clube.squad_value) : "—"}
              unidade="moedas"
              dica="Soma dos valores de mercado"
            />
            <CartaoIndicador
              rotulo="Patrimônio"
              icone={Landmark}
              valor={clube ? formatarNumero(clube.net_worth) : "—"}
              unidade="moedas"
              dica="Caixa + valor do elenco"
            />
            <CartaoIndicador
              rotulo="Elenco"
              icone={Shirt}
              valor={clube ? `${totalJogadores} de ${LIMITE_ELENCO}` : "—"}
              dica={`Limite de ${LIMITE_ELENCO} jogadores`}
            />
          </div>

          <Abas abas={abas} ativa={aba} aoMudar={setAba} />

          {aba === "elenco" && (
            <>
              <section className="overflow-hidden rounded-xl border">
                <div className="p-5">
                  <h2 className="font-semibold">Elenco</h2>
                  <p className="text-sm text-muted-foreground">
                    Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo
                    nome. Contrato calculado para uma venda agora.
                  </p>
                </div>
                <TabelaDados
                  semBorda
                  colunas={colunas}
                  linhas={clube?.players}
                  carregando={carregando}
                  vazio={{
                    titulo: "O clube ainda não tem jogadores",
                    descricao: "Compre jogadores livres para formar o elenco.",
                    icone: <Shirt />,
                    acao: (
                      <Link
                        href="/jogadores"
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        <ShoppingCart aria-hidden="true" className="size-4" />
                        Comprar jogadores
                      </Link>
                    ),
                  }}
                  chave={(j) => j.id}
                />
              </section>
              <p className="text-xs text-muted-foreground">
                Valor de mercado, dias restantes e % de multa calculados para
                uma venda agora.
              </p>
            </>
          )}
          {aba === "escalacao" && clube && (
            <EscalacaoClube
              clubeId={clube.id}
              nomeDoClube={clube.name}
              elenco={clube.players}
            />
          )}
          {aba === "historico" && clube && (
            <HistoricoTransacoes
              clubeId={clube.id}
              clubeNome={clube.name}
              caixaAtual={clube.cash}
            />
          )}
        </>
      )}

      <Modal
        aberto={vendendo !== null}
        titulo={`Vender ${vendendo?.name ?? "jogador"}?`}
        descricao={`O jogador sai do elenco do ${clube?.name ?? "clube"} e volta a ficar livre.`}
        largura="max-w-[520px]"
        aoFechar={() => setVendendo(null)}
      >
        {vendendo && (
          <ConfirmacaoVenda
            jogador={vendendo}
            nomeDoClube={clube?.name}
            aoSalvar={recarregar}
            aoFechar={() => setVendendo(null)}
          />
        )}
      </Modal>
    </section>
  );
}
