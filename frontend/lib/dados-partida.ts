import type {
  AtributoDuelo,
  Condicao,
  ParticipanteDuelo,
  Partida,
  Posicao,
  ResultadoPartida,
} from "@/lib/tipos";

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

const SIGLA_ATRIBUTO: Record<AtributoDuelo, string> = {
  shooting: "Fin",
  passing: "Pas",
  dribbling: "Dri",
  defending: "Def",
};

export interface TitularPartida {
  /** Índice da vaga na formação: 0 goleiro, 1 a 4 jogadores de linha (do mais recuado ao mais avançado). */
  vaga: number;
  id: number;
  nome: string;
  posicao: Posicao;
  condicao: Condicao;
  ataque?: { rotulo: string; valor: number };
  defesa?: number;
  marcouGol: boolean;
}

/**
 * Os 5 titulares de um clube, recuperados dos 6 duelos (RN20): o 4º de linha
 * ataca o goleiro, o 3º ataca o 1º e o 2º ataca o 2º, nessa ordem.
 */
export function titularesDoClube(
  partida: Partida,
  clubeId: number,
): TitularPartida[] {
  const duelos = [...(partida.duels ?? [])].sort((a, b) => a.order - b.order);
  const ataques = duelos.filter((d) => d.attacking_club_id === clubeId);
  const defesas = duelos.filter((d) => d.attacking_club_id !== clubeId);

  const porJogador = new Map<number, TitularPartida>();
  const obter = (p: ParticipanteDuelo, vaga: number) => {
    let titular = porJogador.get(p.player_id);
    if (!titular) {
      titular = {
        vaga,
        id: p.player_id,
        nome: p.player_name,
        posicao: p.position,
        condicao: p.condition,
        marcouGol: false,
      };
      porJogador.set(p.player_id, titular);
    }
    return titular;
  };

  const vagasDeAtaque = [4, 3, 2];
  const vagasDeDefesa = [0, 1, 2];
  ataques.forEach((d, i) => {
    const titular = obter(d.attacker, vagasDeAtaque[i] ?? 4);
    titular.ataque = {
      rotulo: SIGLA_ATRIBUTO[d.attacker.attribute],
      valor: d.attacker.value,
    };
    if (d.goal) titular.marcouGol = true;
  });
  defesas.forEach((d, i) => {
    obter(d.defender, vagasDeDefesa[i] ?? 0).defesa = d.defender.value;
  });

  return [...porJogador.values()].sort((a, b) => a.vaga - b.vaga);
}
