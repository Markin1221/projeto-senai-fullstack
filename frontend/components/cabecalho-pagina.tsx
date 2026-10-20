import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  children?: ReactNode;
}

export function CabecalhoPagina({
  icone: Icone,
  titulo,
  descricao,
  children,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 text-primary">
          <Icone aria-hidden="true" className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
