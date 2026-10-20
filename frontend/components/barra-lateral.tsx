"use client";

import { Clock, Plus, Swords, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MenuPrincipal } from "@/components/menu-principal";
import { useDados } from "@/hooks/use-dados";
import { listarClubes, listarJogadores, listarPartidas } from "@/lib/api";
import { EVENTO_DADOS_ALTERADOS } from "@/lib/avisos";
import { cn } from "@/lib/utils";

/** Painel lateral: menu com contadores, lista de clubes e resumo da liga. */
export function BarraLateral() {
  const caminho = usePathname();
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const atualizar = () => setVersao((v) => v + 1);
    window.addEventListener(EVENTO_DADOS_ALTERADOS, atualizar);
    return () => window.removeEventListener(EVENTO_DADOS_ALTERADOS, atualizar);
  }, []);

  const carregar = useCallback(
    async () => {
      const [clubes, jogadores, partidas] = await Promise.all([
        listarClubes({ size: 100 }),
        listarJogadores({ size: 1 }),
        listarPartidas(),
      ]);
      return { clubes, jogadores: jogadores.meta.total_items, partidas };
    },
    // caminho e versao: atualiza ao navegar e depois de cada ação concluída
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caminho, versao],
  );
  const { dados } = useDados(carregar);

  const clubes = dados?.clubes ?? [];
  const ultima = dados?.partidas[0];

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-5 overflow-y-auto border-r border-sidebar-border p-4">
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground">
          P
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Passe</p>
          <p className="text-xs text-muted-foreground">Gestão da liga</p>
        </div>
      </div>

      <MenuPrincipal
        contagens={
          dados
            ? {
                "/jogadores": dados.jogadores,
                "/clubes": dados.clubes.length,
                "/partidas": dados.partidas.length,
              }
            : {}
        }
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 pb-1">
          <p className="text-xs font-medium text-muted-foreground">Clubes</p>
          <Link
            href="/clubes"
            aria-label="Ir para a lista de clubes"
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus aria-hidden="true" className="size-4" />
          </Link>
        </div>
        {clubes.map((clube) => {
          const ativo = caminho === `/clubes/${clube.id}`;
          return (
            <Link
              key={clube.id}
              href={`/clubes/${clube.id}`}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
                ativo
                  ? "border bg-card font-medium shadow-xs"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-4 items-center justify-center rounded text-[10px] font-semibold",
                  ativo
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {clube.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{clube.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-3 rounded-xl border bg-card p-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Trophy aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium">Liga Fictícia 2026</p>
            <p className="text-muted-foreground">
              {dados
                ? `${clubes.length} clubes · ${dados.jogadores} jogadores`
                : "Carregando…"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Swords aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium">Última partida</p>
            <p className="text-muted-foreground">
              {ultima
                ? `${ultima.home.club_name} ${ultima.home.goals} × ${ultima.away.goals} ${ultima.away.club_name}`
                : "Nenhuma partida ainda"}
            </p>
          </div>
        </div>
        <p className="flex items-center gap-2 border-t pt-3 text-muted-foreground">
          <Clock aria-hidden="true" className="size-3.5" />
          Horário de Brasília (UTC−3)
        </p>
      </div>
    </aside>
  );
}
