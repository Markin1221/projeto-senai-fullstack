import { ChartNoAxesColumn } from "lucide-react";

export interface ValoresPrevia {
  pace: string;
  shooting: string;
  passing: string;
  dribbling: string;
  defending: string;
  physical: string;
  potential: string;
}

const LINHAS = [
  ["pace", "Velocidade"],
  ["shooting", "Finalização"],
  ["passing", "Passe"],
  ["dribbling", "Drible"],
  ["defending", "Defesa"],
  ["physical", "Físico"],
] as const;

const paraNumero = (texto: string): number => {
  const numero = Number(texto);
  return Number.isFinite(numero) && texto.trim() !== ""
    ? Math.max(0, Math.min(100, numero))
    : 0;
};

export function PreviaAtributos({ valores }: { valores: ValoresPrevia }) {
  const potencial = paraNumero(valores.potential);

  return (
    <aside
      aria-label="Prévia dos atributos"
      className="space-y-3 rounded-lg border bg-muted/40 p-3"
    >
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ChartNoAxesColumn aria-hidden="true" className="size-3.5" />
        Prévia dos atributos
      </p>
      <ul className="space-y-2">
        {LINHAS.map(([campo, rotulo]) => {
          const valor = paraNumero(valores[campo]);
          return (
            <li key={campo} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-muted-foreground">{rotulo}</span>
              <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="absolute inset-y-0 left-0 bg-primary/25"
                  style={{ width: `${potencial}%` }}
                />
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  style={{ width: `${valor}%` }}
                />
              </span>
              <span className="w-6 text-right font-medium tabular-nums">
                {valores[campo].trim() === "" ? "–" : valor}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Faixa clara: até o potencial
        {potencial > 0 ? ` (${potencial})` : ""}. A prévia só desenha os valores
        digitados; não calcula overall nem valor base.
      </p>
    </aside>
  );
}
