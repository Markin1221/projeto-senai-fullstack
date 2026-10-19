interface Props {
  rotulo: string;
  valor: string;
}

export function CartaoIndicador({ rotulo, valor }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{rotulo}</p>
      <p className="text-xl font-semibold tabular-nums">{valor}</p>
    </div>
  );
}
