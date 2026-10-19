"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  aberto: boolean;
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
}

export function Modal({ aberto, titulo, aoFechar, children }: Props) {
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
      className="m-auto w-full max-w-lg rounded-lg border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/40"
    >
      <h2 className="mb-4 text-lg font-semibold">{titulo}</h2>
      {aberto && children}
    </dialog>
  );
}
