interface Props {
  rotulo: string;
  valor: string;
}

export function CartaoIndicador({ rotulo, valor }: Props) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <p className="text-sm text-muted-foreground">{rotulo}</p>
      <p className="text-2xl font-semibold tabular-nums">{valor}</p>
    </div>
  );
}
