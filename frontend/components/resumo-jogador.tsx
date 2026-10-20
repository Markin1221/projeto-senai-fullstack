import { AvatarIniciais } from "@/components/avatar-iniciais";
import { NOMES_POSICAO, formatarMoeda } from "@/lib/formatar";
import type { Jogador } from "@/lib/tipos";

export function ResumoJogador({ jogador }: { jogador: Jogador }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border bg-muted/50 px-4 py-3">
      <AvatarIniciais nome={jogador.name} id={jogador.id} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{jogador.name}</p>
        <p className="text-xs text-muted-foreground">
          {jogador.position} · {NOMES_POSICAO[jogador.position]} · {jogador.age}{" "}
          anos
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Valor de mercado</p>
        <p className="text-base font-semibold tabular-nums">
          {formatarMoeda(jogador.market_value)}
        </p>
      </div>
    </div>
  );
}
