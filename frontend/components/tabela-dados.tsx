"use client";

import { ServerOff, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { EstadoCentral } from "@/components/estado-central";
import { Button } from "@/components/ui/button";
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

export interface EstadoVazio {
  titulo: string;
  descricao: string;
  icone?: ReactNode;
  acao?: ReactNode;
}

interface Props<T> {
  colunas: Coluna<T>[];
  linhas?: T[];
  carregando: boolean;
  erro?: string | null;
  vazio: string | EstadoVazio;
  tituloErro?: string;
  chave: (linha: T) => string | number;
  aoTentarDeNovo?: () => void;
  semBorda?: boolean;
}

export function TabelaDados<T>({
  colunas,
  linhas,
  carregando,
  erro,
  vazio,
  tituloErro,
  chave,
  aoTentarDeNovo,
  semBorda = false,
}: Props<T>) {
  const moldura = semBorda
    ? undefined
    : "overflow-hidden rounded-xl border bg-card";

  if (erro) {
    if (!tituloErro) {
      return <AlertaErro mensagem={erro} aoTentarDeNovo={aoTentarDeNovo} />;
    }
    return (
      <div className={moldura}>
        <EstadoCentral
          icone={<ServerOff />}
          titulo={tituloErro}
          descricao={erro}
        >
          {aoTentarDeNovo && (
            <Button variant="outline" onClick={aoTentarDeNovo}>
              Tentar de novo
            </Button>
          )}
        </EstadoCentral>
      </div>
    );
  }

  if (!carregando && linhas?.length === 0 && typeof vazio !== "string") {
    return (
      <div className={moldura}>
        <EstadoCentral
          icone={vazio.icone ?? <SearchX />}
          titulo={vazio.titulo}
          descricao={vazio.descricao}
        >
          {vazio.acao}
        </EstadoCentral>
      </div>
    );
  }

  return (
    <div className={moldura}>
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
                {typeof vazio === "string" ? vazio : vazio.titulo}
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
