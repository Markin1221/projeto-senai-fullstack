import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Badge } from "@/components/ui/badge";
import {
  nomeDoClubeAtacante,
  rotuloAtributo,
  textoResultado,
} from "@/lib/dados-partida";
import { formatarDataHora, rotuloCondicao } from "@/lib/formatar";
import type { Duelo, ParticipanteDuelo, Partida } from "@/lib/tipos";

function descreverJogador(p: ParticipanteDuelo): string {
  const condicao =
    p.condition === "APTO" ? "" : `, ${rotuloCondicao(p.condition)}`;
  return `${p.player_name} (${p.position}${condicao})`;
}

function criarColunas(partida: Partida): Coluna<Duelo>[] {
  return [
    { titulo: "Duelo", celula: (d) => d.order, numerica: true },
    {
      titulo: "Ataca",
      celula: (d) => nomeDoClubeAtacante(partida, d.attacking_club_id),
    },
    { titulo: "Atacante", celula: (d) => descreverJogador(d.attacker) },
    {
      titulo: "Ataque",
      celula: (d) =>
        `${rotuloAtributo(d.attacker.attribute)} ${d.attacker.value}`,
    },
    { titulo: "Defensor", celula: (d) => descreverJogador(d.defender) },
    {
      titulo: "Defesa",
      celula: (d) =>
        `${rotuloAtributo(d.defender.attribute)} ${d.defender.value}`,
    },
    {
      titulo: "Resultado",
      celula: (d) => (
        <Badge variant={d.goal ? "default" : "secondary"}>
          {d.goal ? "Gol" : "Sem gol"}
        </Badge>
      ),
    },
  ];
}

export function DuelosPartida({ partida }: { partida: Partida }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {formatarDataHora(partida.played_at)}
        </p>
        <p className="text-2xl font-semibold">
          {partida.home.club_name} {partida.home.goals} × {partida.away.goals}{" "}
          {partida.away.club_name}
        </p>
        <p className="text-sm">
          {textoResultado(partida)} · {partida.home.formation} ×{" "}
          {partida.away.formation}
        </p>
      </div>
      <TabelaDados
        colunas={criarColunas(partida)}
        linhas={partida.duels}
        carregando={false}
        vazio="Esta partida não tem duelos."
        chave={(d) => d.order}
      />
    </div>
  );
}
