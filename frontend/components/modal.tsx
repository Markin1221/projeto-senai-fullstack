"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  aberto: boolean;
  titulo: string;
  descricao?: string;
  largura?: string;
  lateral?: boolean;
  aoFechar: () => void;
  children: ReactNode;
}

export function Modal({
  aberto,
  titulo,
  descricao,
  largura = "max-w-lg",
  lateral = false,
  aoFechar,
  children,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      className={cn(
        "w-full border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/50",
        lateral
          ? "m-0 ml-auto h-dvh max-h-none max-w-md overflow-y-auto rounded-l-xl"
          : "m-auto rounded-xl",
        !lateral && largura,
      )}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => ref.current?.close()}
        className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-muted"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
      <h2 className={cn("text-lg font-semibold", lateral && "sr-only")}>
        {titulo}
      </h2>
      {descricao && (
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
      )}
      <div className={lateral ? undefined : "mt-4"}>{aberto && children}</div>
    </dialog>
  );
}
