import { cn } from "@/lib/utils";

interface Opcao {
  valor: string;
  rotulo: string;
}

interface Props {
  opcoes: Opcao[];
  valor: string;
  aoMudar: (valor: string) => void;
}

export function AbasSegmentadas({ opcoes, valor, aoMudar }: Props) {
  return (
    <div role="tablist" className="inline-flex rounded-lg bg-muted p-1">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          role="tab"
          aria-selected={opcao.valor === valor}
          onClick={() => aoMudar(opcao.valor)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium",
            opcao.valor === valor
              ? "bg-card shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  );
}
