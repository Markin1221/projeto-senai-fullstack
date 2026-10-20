import type { LucideIcon } from "lucide-react";

interface Props {
  rotulo: string;
  valor: string;
  unidade?: string;
  dica?: string;
  icone?: LucideIcon;
}

export function CartaoIndicador({
  rotulo,
  valor,
  unidade,
  dica,
  icone: Icone,
}: Props) {
  return (
    <div className="space-y-1 rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {rotulo}
        {Icone && <Icone aria-hidden="true" className="size-4" />}
      </div>
      <p className="text-3xl font-semibold tracking-tight tabular-nums">
        {valor}
        {unidade && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {unidade}
          </span>
        )}
      </p>
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
    </div>
  );
}
