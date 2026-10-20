"use client";

import {
  ArrowRight,
  ChevronRight,
  CircleCheck,
  Clock,
  HandCoins,
  History,
  Shield,
  ShoppingCart,
  Swords,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect } from "react";
import { useDados } from "@/hooks/use-dados";
import {
  buscarClassificacao,
  listarClubes,
  listarJogadores,
  listarPartidas,
} from "@/lib/api";

const ETAPAS: { icone: LucideIcon; titulo: string; texto: string }[] = [
  {
    icone: Users,
    titulo: "Jogadores",
    texto:
      "Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.",
  },
  {
    icone: Shield,
    titulo: "Clubes",
    texto: "Começam com 300,00 em caixa e sem jogadores.",
  },
  {
    icone: ShoppingCart,
    titulo: "Compra",
    texto: "Valor + taxa, até 50% do caixa, com contrato de fidelidade.",
  },
  {
    icone: HandCoins,
    titulo: "Venda",
    texto: "Multa antes do fim da fidelidade e comissão sobre o lucro.",
  },
  {
    icone: History,
    titulo: "Histórico",
    texto: "Toda compra e venda fica registrada, com totais e CSV.",
  },
  {
    icone: Trophy,
    titulo: "Liga",
    texto: "Escale 5 titulares e jogue partidas que entram na classificação.",
  },
];

function Campo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 760"
      className="pointer-events-none absolute top-1/2 left-1/2 h-[90%] w-[90%] max-w-[1200px] -translate-x-1/2 -translate-y-1/2 text-border"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="10" y="10" width="1180" height="740" rx="12" />
      <line x1="600" y1="10" x2="600" y2="750" />
      <circle cx="600" cy="380" r="110" />
      <rect x="10" y="230" width="190" height="300" />
      <rect x="10" y="310" width="70" height="140" />
      <rect x="1000" y="230" width="190" height="300" />
      <rect x="1120" y="310" width="70" height="140" />
    </svg>
  );
}

function Metrica({
  icone: Icone,
  valor,
  texto,
}: {
  icone: LucideIcon;
  valor?: number;
  texto: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icone aria-hidden="true" className="size-4" />
      {valor !== undefined && (
        <strong className="font-semibold text-foreground">{valor}</strong>
      )}
      {texto}
    </span>
  );
}

export default function Inicio() {
  const roteador = useRouter();

  const carregar = useCallback(async () => {
    const [jogadores, livres, clubes, partidas, tabela] = await Promise.all([
      listarJogadores({ size: 1 }),
      listarJogadores({ size: 1, free: true }),
      listarClubes({ size: 100 }),
      listarPartidas(),
      buscarClassificacao(),
    ]);
    return {
      jogadores: jogadores.meta.total_items,
      livres: livres.meta.total_items,
      clubes: clubes.length,
      partidas: partidas.length,
      lider: partidas.length > 0 ? tabela[0] : undefined,
    };
  }, []);
  const { dados } = useDados(carregar);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.defaultPrevented) {
        roteador.push("/jogadores");
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [roteador]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">
      <Campo />

      <div className="relative flex max-w-3xl flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-xl font-semibold text-primary-foreground">
            P
          </span>
          <span className="text-2xl font-semibold">Passe</span>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-success" />
          <strong className="font-medium">Liga Fictícia 2026</strong>
          <span className="text-muted-foreground">
            ·{" "}
            {dados?.lider
              ? `líder: ${dados.lider.club_name}, ${dados.lider.points} ${dados.lider.points === 1 ? "ponto" : "pontos"}`
              : dados
                ? "nenhuma partida ainda"
                : "carregando…"}
          </span>
        </span>

        <h1 className="text-[44px] leading-[52px] font-semibold tracking-[-0.02em] text-balance">
          Gestão da liga, do mercado à classificação
        </h1>
        <p className="max-w-xl text-base text-balance text-muted-foreground">
          Cadastre jogadores, monte os clubes e negocie com contrato de
          fidelidade. Depois, escale os titulares e jogue partidas com placar
          calculado pelos atributos.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/jogadores"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Iniciar
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <span className="text-sm text-muted-foreground">ou tecle</span>
          <kbd className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium">
            Enter
          </kbd>
        </div>

        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <Metrica icone={Users} valor={dados?.jogadores} texto="jogadores" />·
          <Metrica icone={UserRound} valor={dados?.livres} texto="livres" />·
          <Metrica icone={Shield} valor={dados?.clubes} texto="clubes" />·
          <Metrica icone={Swords} valor={dados?.partidas} texto="partidas" />·
          <Metrica icone={CircleCheck} texto="Não precisa de login" />
        </p>
      </div>

      <ol className="relative mt-12 flex w-full max-w-6xl flex-wrap items-stretch justify-center gap-2 lg:flex-nowrap">
        {ETAPAS.map((etapa, i) => (
          <Fragment key={etapa.titulo}>
            <li className="flex min-w-44 flex-1 flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <etapa.icone aria-hidden="true" className="size-4" />
                </span>
                <span className="text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-sm font-semibold">{etapa.titulo}</p>
              <p className="text-xs text-muted-foreground">{etapa.texto}</p>
            </li>
            {i < ETAPAS.length - 1 && (
              <ChevronRight
                aria-hidden="true"
                className="hidden size-4 shrink-0 self-center text-muted-foreground lg:block"
              />
            )}
          </Fragment>
        ))}
      </ol>

      <p className="relative mt-10 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock aria-hidden="true" className="size-3.5" />
        Liga Fictícia 2026 · Horário de Brasília (UTC−3)
      </p>
    </main>
  );
}
