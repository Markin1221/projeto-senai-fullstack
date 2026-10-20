import { ChevronDown, type LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import type { OpcaoSelect } from "@/components/campo-select";

interface Props extends Omit<ComponentProps<"select">, "children"> {
  icone: LucideIcon;
  rotulo: string;
  opcoes: OpcaoSelect[];
  comoPlaceholder?: boolean;
}

export function FiltroSelect({
  icone: Icone,
  rotulo,
  opcoes,
  comoPlaceholder = true,
  ...selecao
}: Props) {
  return (
    <div className="relative">
      <Icone
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <select
        aria-label={rotulo}
        className="h-9 appearance-none rounded-md border border-input bg-card pr-8 pl-9 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
        {...selecao}
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {comoPlaceholder && o.valor === "" ? rotulo : o.rotulo}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
