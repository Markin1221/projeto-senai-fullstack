"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface Valor {
  final: string | null;
  definir: (texto: string | null) => void;
}

const Contexto = createContext<Valor>({ final: null, definir: () => {} });

/** Guarda o último item do breadcrumb, que a página (clube, partida) define. */
export function ProvedorMigalha({ children }: { children: ReactNode }) {
  const [final, definir] = useState<string | null>(null);
  return <Contexto value={{ final, definir }}>{children}</Contexto>;
}

export const useMigalhaAtual = () => useContext(Contexto).final;

export function useMigalhaFinal(texto: string | null | undefined) {
  const { definir } = useContext(Contexto);
  useEffect(() => {
    definir(texto ?? null);
    return () => definir(null);
  }, [texto, definir]);
}
