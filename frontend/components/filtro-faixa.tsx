import { ChevronDown, type LucideIcon } from "lucide-react";

interface Props {
  icone: LucideIcon;
  rotulo: string;
  minimo: string;
  maximo: string;
  passo?: string;
  aoMudarMinimo: (valor: string) => void;
  aoMudarMaximo: (valor: string) => void;
}

const classeEntrada =
  "h-9 w-full rounded-md border border-input bg-card px-2.5 text-sm";

export function FiltroFaixa({
  icone: Icone,
  rotulo,
  minimo,
  maximo,
  passo,
  aoMudarMinimo,
  aoMudarMaximo,
}: Props) {
  const resumo =
    minimo || maximo
      ? `${rotulo}: ${minimo || "…"} a ${maximo || "…"}`
      : rotulo;

  return (
    <details className="relative">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-muted-foreground shadow-xs">
        <Icone aria-hidden="true" className="size-4" />
        {resumo}
        <ChevronDown aria-hidden="true" className="size-4" />
      </summary>
      <div className="absolute z-10 mt-1 grid w-56 gap-2 rounded-lg border bg-popover p-3 shadow-md">
        <label className="text-xs font-medium">
          Mínimo
          <input
            type="number"
            step={passo}
            className={classeEntrada}
            value={minimo}
            onChange={(e) => aoMudarMinimo(e.target.value)}
          />
        </label>
        <label className="text-xs font-medium">
          Máximo
          <input
            type="number"
            step={passo}
            className={classeEntrada}
            value={maximo}
            onChange={(e) => aoMudarMaximo(e.target.value)}
          />
        </label>
      </div>
    </details>
  );
}
