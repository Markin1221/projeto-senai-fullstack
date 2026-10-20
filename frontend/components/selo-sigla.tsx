export function SeloSigla({ sigla }: { sigla: string }) {
  return (
    <span className="inline-flex items-center rounded-md border bg-card px-1.5 py-0.5 text-xs font-medium">
      {sigla}
    </span>
  );
}
