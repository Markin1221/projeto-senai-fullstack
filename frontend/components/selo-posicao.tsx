import type { Posicao } from "@/lib/tipos";

export function SeloPosicao({ posicao }: { posicao: Posicao }) {
  return (
    <span className="inline-flex min-w-10 items-center justify-center rounded-md border bg-card px-2 py-0.5 text-xs font-semibold">
      {posicao}
    </span>
  );
}
