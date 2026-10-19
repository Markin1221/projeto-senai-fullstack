"use client";

import { useCallback, useRef, useState } from "react";

export function useEnvio() {
  const [enviando, setEnviando] = useState(false);
  const emAndamento = useRef(false);

  const executar = useCallback(
    async <T>(acao: () => Promise<T>): Promise<T | undefined> => {
      if (emAndamento.current) return undefined;
      emAndamento.current = true;
      setEnviando(true);
      try {
        return await acao();
      } finally {
        emAndamento.current = false;
        setEnviando(false);
      }
    },
    [],
  );

  return { enviando, executar };
}
