import { NOMES_POSICAO } from "@/lib/formatar";
import { cn } from "@/lib/utils";

interface Props {
  valor: string;
  posicoes: string[];
  desabilitado?: boolean;
  aoMudar: (valor: string) => void;
}

export function SeletorPosicao({
  valor,
  posicoes,
  desabilitado,
  aoMudar,
}: Props) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm leading-none font-medium">Posição</legend>
      <div role="radiogroup" className="grid grid-cols-5 gap-3 pt-1.5">
        {posicoes.map((posicao) => (
          <button
            key={posicao}
            type="button"
            role="radio"
            aria-checked={posicao === valor}
            disabled={desabilitado}
            onClick={() => aoMudar(posicao)}
            className={cn(
              "flex flex-col items-center rounded-lg border bg-card px-2 py-2 disabled:cursor-not-allowed disabled:opacity-60",
              posicao === valor
                ? "border-primary bg-primary/5 text-primary"
                : "hover:bg-muted",
            )}
          >
            <span className="text-sm font-semibold">{posicao}</span>
            <span className="text-xs text-muted-foreground">
              {NOMES_POSICAO[posicao]}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
