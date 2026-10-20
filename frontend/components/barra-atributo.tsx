import { cn } from "@/lib/utils";

interface Props {
  valor: number;
  maximo?: number;
  className?: string;
}

export function BarraAtributo({ valor, maximo = 100, className }: Props) {
  const percentual = Math.max(0, Math.min(100, (valor / maximo) * 100));
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-1.5 w-10 overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      <span
        className="block h-full rounded-full bg-primary"
        style={{ width: `${percentual}%` }}
      />
    </span>
  );
}
