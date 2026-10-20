import type { AtributoDuelo, Partida, ResultadoPartida } from "@/lib/tipos";

const ROTULOS_ATRIBUTO: Record<AtributoDuelo, string> = {
  shooting: "Finalização",
  passing: "Passe",
  dribbling: "Drible",
  defending: "Defesa",
};

export function rotuloAtributo(atributo: AtributoDuelo): string {
  return ROTULOS_ATRIBUTO[atributo];
}

export function textoResultado(partida: Partida): string {
  const rotulos: Record<ResultadoPartida, string> = {
    MANDANTE: `Vitória do ${partida.home.club_name}`,
    VISITANTE: `Vitória do ${partida.away.club_name}`,
    EMPATE: "Empate",
  };
  return rotulos[partida.result];
}

export function nomeDoClubeAtacante(partida: Partida, clubeId: number): string {
  return clubeId === partida.home.club_id
    ? partida.home.club_name
    : partida.away.club_name;
}
