"use client";

import { useCallback, useEffect, useState } from "react";
import { mensagemDeErro } from "@/lib/api";

interface Estado<T> {
  origem?: unknown;
  versao?: number;
  dados?: T;
  erro: string | null;
}

/** `carregar` precisa ter identidade estável (função fora do componente ou useCallback). */
export function useDados<T>(carregar: () => Promise<T>) {
  const [estado, setEstado] = useState<Estado<T>>({ erro: null });
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let cancelado = false;
    carregar()
      .then((dados) => {
        if (!cancelado)
          setEstado({ origem: carregar, versao, dados, erro: null });
      })
      .catch((e) => {
        if (!cancelado)
          setEstado({ origem: carregar, versao, erro: mensagemDeErro(e) });
      });
    return () => {
      cancelado = true;
    };
  }, [carregar, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  // Está carregando enquanto o resultado guardado não for deste `carregar` e desta versão.
  const carregando = estado.origem !== carregar || estado.versao !== versao;

  return {
    dados: estado.dados,
    carregando,
    erro: carregando ? null : estado.erro,
    recarregar,
  };
}
