"use client";

import { Button } from "@/components/ui/button";

interface Props {
  pagina: number;
  totalPaginas: number;
  totalItens: number;
  rotulo: string;
  aoMudar: (pagina: number) => void;
}

export function Paginacao({
  pagina,
  totalPaginas,
  totalItens,
  rotulo,
  aoMudar,
}: Props) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>
        {totalItens} {rotulo} encontrados
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagina <= 1}
          onClick={() => aoMudar(pagina - 1)}
        >
          Anterior
        </Button>
        <span>
          Página {pagina} de {Math.max(totalPaginas, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={pagina >= totalPaginas}
          onClick={() => aoMudar(pagina + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
