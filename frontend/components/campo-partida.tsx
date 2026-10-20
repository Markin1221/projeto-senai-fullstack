import { CircleDot, HeartPulse } from "lucide-react";
import { posicoesNoCampo, VAGAS_POR_FORMACAO } from "@/lib/dados-escalacao";
import { titularesDoClube, type TitularPartida } from "@/lib/dados-partida";
import type { Partida } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const FAIXAS = Array.from({ length: 5 }, (_, i) => i * 20);

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return (
    (partes[0]?.[0] ?? "") +
    (partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "")
  ).toUpperCase();
}

function LinhasDoCampo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1070 440"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
      fill="none"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="1.5"
    >
      <rect x="12" y="12" width="1046" height="416" />
      <line x1="535" y1="12" x2="535" y2="428" />
      <circle cx="535" cy="220" r="52" />
      <rect x="12" y="140" width="110" height="160" />
      <rect x="12" y="180" width="40" height="80" />
      <rect x="948" y="140" width="110" height="160" />
      <rect x="1018" y="180" width="40" height="80" />
    </svg>
  );
}

function Jogador({
  titular,
  esquerda,
  topo,
  mandante,
}: {
  titular: TitularPartida;
  esquerda: number;
  topo: number;
  mandante: boolean;
}) {
  const detalhes = [
    titular.posicao,
    titular.ataque && `${titular.ataque.rotulo} ${titular.ataque.valor}`,
    titular.defesa !== undefined && `Def ${titular.defesa}`,
  ].filter(Boolean);

  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: `${esquerda}%`, top: `${topo}%` }}
    >
      <span
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full border-2 border-white text-xs font-medium shadow-md",
          mandante
            ? "bg-primary text-primary-foreground"
            : "bg-white text-zinc-900",
        )}
      >
        {iniciais(titular.nome)}
        {titular.condicao !== "APTO" && (
          <span
            title="Mal condicionado"
            className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border border-white bg-[#b55200] text-white"
          >
            <HeartPulse aria-hidden="true" className="size-2.5" />
          </span>
        )}
        {titular.marcouGol && (
          <span
            title="Gol no duelo"
            className="absolute -right-1.5 -bottom-1.5 flex size-4 items-center justify-center rounded-full border border-white bg-success text-white"
          >
            <CircleDot aria-hidden="true" className="size-2.5" />
          </span>
        )}
      </span>
      <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs leading-4 font-medium whitespace-nowrap text-white">
        {titular.nome}
      </span>
      <span className="text-[10px] leading-3 whitespace-nowrap text-white/80">
        {detalhes.join(" · ")}
      </span>
    </div>
  );
}

function Time({ partida, lado }: { partida: Partida; lado: "home" | "away" }) {
  const { club_id, formation } = partida[lado];
  const posicoes = posicoesNoCampo(formation);
  const mandante = lado === "home";
  const total = VAGAS_POR_FORMACAO[formation].length;

  return titularesDoClube(partida, club_id)
    .filter((t) => t.vaga < total)
    .map((titular) => {
      const p = posicoes[titular.vaga];
      // O campo da formação é vertical (gol embaixo); aqui o gol fica na lateral.
      const avanco = ((86 - p.y) / (86 - 18)) * 40 + 7;
      return (
        <Jogador
          key={titular.id}
          titular={titular}
          mandante={mandante}
          esquerda={mandante ? avanco : 100 - avanco}
          topo={p.x}
        />
      );
    });
}

export function CampoPartida({ partida }: { partida: Partida }) {
  const { home, away } = partida;
  return (
    <div
      role="img"
      aria-label={`Titulares de ${home.club_name} e ${away.club_name} em campo`}
      className="relative h-[440px] w-full overflow-hidden rounded-[10px] bg-[#0d542b]"
    >
      {FAIXAS.map((esquerda) => (
        <div
          key={esquerda}
          aria-hidden="true"
          className="absolute inset-y-0 w-[10%] bg-white/5"
          style={{ left: `${esquerda}%` }}
        />
      ))}
      <LinhasDoCampo />

      <span className="absolute top-3 left-4 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white">
        ● {home.club_name} {home.formation} | ataca →
      </span>
      <span className="absolute top-3 right-4 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white">
        ● {away.club_name} {away.formation} | ← ataca
      </span>

      <Time partida={partida} lado="home" />
      <Time partida={partida} lado="away" />
    </div>
  );
}
