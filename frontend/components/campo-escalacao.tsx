import { HeartPulse, Plus } from "lucide-react";
import { posicoesNoCampo, VAGAS_POR_FORMACAO } from "@/lib/dados-escalacao";
import type { Formacao, Jogador } from "@/lib/tipos";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return (
    (partes[0]?.[0] ?? "") +
    (partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "")
  ).toUpperCase();
}

const sobrenome = (nome: string) => nome.trim().split(/\s+/).slice(-1)[0];

const FAIXAS = [40, 120, 200, 280];

function LinhasDoCampo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 286 360"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
      fill="none"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="1.5"
    >
      <rect x="8" y="8" width="270" height="344" />
      <line x1="8" y1="152" x2="278" y2="152" />
      <circle cx="143" cy="152" r="32" />
      <rect x="66" y="288" width="154" height="64" />
      <rect x="113" y="328" width="60" height="24" />
    </svg>
  );
}

export function CampoEscalacao({
  formacao,
  titulares,
}: {
  formacao: Formacao;
  titulares: (Jogador | undefined)[];
}) {
  const vagas = VAGAS_POR_FORMACAO[formacao];
  const posicoes = posicoesNoCampo(formacao);

  return (
    <div
      role="img"
      aria-label={`Campo com a formação ${formacao}`}
      className="relative aspect-[286/360] w-full overflow-hidden rounded-[10px] bg-[#0d542b]"
    >
      {FAIXAS.map((topo) => (
        <div
          key={topo}
          aria-hidden="true"
          className="absolute inset-x-0 bg-white/5"
          style={{
            top: `${(topo / 360) * 100}%`,
            height: `${(40 / 360) * 100}%`,
          }}
        />
      ))}
      <LinhasDoCampo />

      {vagas.map((vaga, i) => {
        const jogador = titulares[i];
        return (
          <div
            key={i}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
            style={{ left: `${posicoes[i].x}%`, top: `${posicoes[i].y}%` }}
          >
            {jogador ? (
              <span className="relative flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-medium text-primary-foreground shadow-md">
                {iniciais(jogador.name)}
                {jogador.condition === "MAL_CONDICIONADO" && (
                  <span
                    title="Mal condicionado"
                    className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border border-white bg-[#b55200] text-white"
                  >
                    <HeartPulse aria-hidden="true" className="size-2.5" />
                  </span>
                )}
              </span>
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full border border-dashed border-white/70 text-white/80">
                <Plus aria-hidden="true" className="size-4" />
              </span>
            )}
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs leading-4 font-medium text-white">
              {jogador ? sobrenome(jogador.name) : vaga.titulo}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function MiniCampo({ formacao }: { formacao: Formacao }) {
  const posicoes = posicoesNoCampo(formacao);
  return (
    <span
      aria-hidden="true"
      className="relative block h-[42px] w-8 shrink-0 overflow-hidden rounded-md bg-[#0d542b]"
    >
      {posicoes.map((p, i) => (
        <span
          key={i}
          className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        />
      ))}
    </span>
  );
}
