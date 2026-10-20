"use client";

import type { ReactNode } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Coluna<T> {
  titulo: string;
  celula: (linha: T) => ReactNode;
  numerica?: boolean;
}

interface Props<T> {
  colunas: Coluna<T>[];
  linhas?: T[];
  carregando: boolean;
  erro?: string | null;
  vazio: string;
  chave: (linha: T) => string | number;
  aoTentarDeNovo?: () => void;
}

export function TabelaDados<T>({
  colunas,
  linhas,
  carregando,
  erro,
  vazio,
  chave,
  aoTentarDeNovo,
}: Props<T>) {
  if (erro) {
    return <AlertaErro mensagem={erro} aoTentarDeNovo={aoTentarDeNovo} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {colunas.map((c) => (
              <TableHead
                key={c.titulo}
                className={c.numerica ? "text-right" : undefined}
              >
                {c.titulo}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {carregando &&
            Array.from({ length: 5 }, (_, i) => (
              <TableRow key={i}>
                {colunas.map((c) => (
                  <TableCell key={c.titulo}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!carregando && linhas?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={colunas.length}
                className="py-8 text-center text-muted-foreground"
              >
                {vazio}
              </TableCell>
            </TableRow>
          )}
          {!carregando &&
            linhas?.map((linha) => (
              <TableRow key={chave(linha)}>
                {colunas.map((c) => (
                  <TableCell
                    key={c.titulo}
                    className={
                      c.numerica ? "text-right tabular-nums" : undefined
                    }
                  >
                    {c.celula(linha)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
