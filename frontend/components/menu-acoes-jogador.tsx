"use client";

import {
  Ellipsis,
  Eye,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  nome: string;
  livre: boolean;
  aoVerDetalhes: () => void;
  aoEditar: () => void;
  aoAlterarCondicao: () => void;
  aoComprar: () => void;
  aoExcluir: () => void;
}

interface Posicao {
  direita: number;
  topo?: number;
  base?: number;
}

const ALTURA_ESTIMADA = 260;

const classeItem =
  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

export function MenuAcoesJogador({
  nome,
  livre,
  aoVerDetalhes,
  aoEditar,
  aoAlterarCondicao,
  aoComprar,
  aoExcluir,
}: Props) {
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!posicao) return;
    const fechar = () => setPosicao(null);
    const aoClicar = (evento: MouseEvent) => {
      const alvo = evento.target as Node;
      if (!menu.current?.contains(alvo) && !botao.current?.contains(alvo))
        fechar();
    };
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") fechar();
    };
    document.addEventListener("mousedown", aoClicar);
    document.addEventListener("keydown", aoTeclar);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    return () => {
      document.removeEventListener("mousedown", aoClicar);
      document.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
    };
  }, [posicao]);

  const alternar = () => {
    if (posicao) return setPosicao(null);
    const caixa = botao.current?.getBoundingClientRect();
    if (!caixa) return;
    const direita = window.innerWidth - caixa.right;
    const cabeAbaixo = window.innerHeight - caixa.bottom > ALTURA_ESTIMADA;
    setPosicao(
      cabeAbaixo
        ? { direita, topo: caixa.bottom + 4 }
        : { direita, base: window.innerHeight - caixa.top + 4 },
    );
  };

  const escolher = (acao: () => void) => () => {
    setPosicao(null);
    acao();
  };

  return (
    <>
      <button
        ref={botao}
        type="button"
        aria-label={`Ações de ${nome}`}
        aria-haspopup="menu"
        aria-expanded={posicao !== null}
        onClick={alternar}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
      >
        <Ellipsis aria-hidden="true" className="size-4" />
      </button>
      {posicao && (
        <div
          ref={menu}
          role="menu"
          style={{
            position: "fixed",
            right: posicao.direita,
            top: posicao.topo,
            bottom: posicao.base,
          }}
          className="z-50 w-60 rounded-lg border bg-popover p-1 text-left text-popover-foreground shadow-md"
        >
          <p className="px-2 py-1.5 text-xs text-muted-foreground">{nome}</p>
          <button
            role="menuitem"
            className={classeItem}
            onClick={escolher(aoVerDetalhes)}
          >
            <Eye aria-hidden="true" className="size-4" />
            Ver detalhes
          </button>
          <button
            role="menuitem"
            className={classeItem}
            onClick={escolher(aoEditar)}
          >
            <Pencil aria-hidden="true" className="size-4" />
            Editar
          </button>
          <button
            role="menuitem"
            className={classeItem}
            onClick={escolher(aoAlterarCondicao)}
          >
            <HeartPulse aria-hidden="true" className="size-4" />
            Alterar condição
          </button>
          {livre && (
            <button
              role="menuitem"
              className={classeItem}
              onClick={escolher(aoComprar)}
            >
              <ShoppingCart aria-hidden="true" className="size-4" />
              Comprar
            </button>
          )}
          <div role="separator" className="my-1 border-t" />
          <button
            role="menuitem"
            disabled={!livre}
            className={cn(
              classeItem,
              "text-destructive hover:bg-destructive-soft",
            )}
            onClick={escolher(aoExcluir)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Excluir
          </button>
          <p className="px-2 pt-1 pb-1.5 text-xs text-muted-foreground">
            {livre
              ? "Disponível porque o jogador está livre."
              : "Indisponível: o jogador tem clube."}
          </p>
        </div>
      )}
    </>
  );
}
