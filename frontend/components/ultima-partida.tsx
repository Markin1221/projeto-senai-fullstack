import { ChevronRight } from "lucide-react";
import { EscudoClube } from "@/components/escudo-clube";
import { Button } from "@/components/ui/button";
import { textoResultado } from "@/lib/dados-partida";
import { formatarDataHora } from "@/lib/formatar";
import type { Partida } from "@/lib/tipos";

interface Props {
  partida: Partida;
  siglas: Map<number, string>;
  aoVerDuelos: (partida: Partida) => void;
}

export function UltimaPartida({ partida, siglas, aoVerDuelos }: Props) {
  const { home, away } = partida;
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">Última partida</h2>
      <div className="flex items-center gap-6 rounded-xl border bg-card px-6 py-5">
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="text-right">
            <p className="font-semibold">{home.club_name}</p>
            <p className="text-xs text-muted-foreground">Mandante</p>
          </div>
          <EscudoClube grande sigla={siglas.get(home.club_id) ?? "—"} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-3xl font-bold tabular-nums">
            {home.goals} × {away.goals}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatarDataHora(partida.played_at)}
          </p>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
            {textoResultado(partida)}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <EscudoClube grande sigla={siglas.get(away.club_id) ?? "—"} />
          <div>
            <p className="font-semibold">{away.club_name}</p>
            <p className="text-xs text-muted-foreground">Visitante</p>
          </div>
        </div>

        <Button variant="outline" onClick={() => aoVerDuelos(partida)}>
          Ver duelos
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
