import { rotuloCondicao } from "@/lib/formatar";
import type { Condicao } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const ESTILOS: Record<Condicao, string> = {
  APTO: "border-success-soft-border bg-success-soft text-success-soft-foreground",
  MAL_CONDICIONADO:
    "border-warning-soft-border bg-warning-soft text-warning-soft-foreground",
  DOENTE:
    "border-destructive-soft-border bg-destructive-soft text-destructive-soft-foreground",
};

export function SeloCondicao({ condicao }: { condicao: Condicao }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        ESTILOS[condicao],
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {rotuloCondicao(condicao)}
    </span>
  );
}
