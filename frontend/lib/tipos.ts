export type Posicao = "GOL" | "ZAG" | "LAT" | "MEI" | "ATA";
export type Condicao = "APTO" | "MAL_CONDICIONADO" | "DOENTE";

export interface Jogador {
  id: number;
  name: string;
  position: Posicao;
  agility: number;
  age: number;
  condition: Condicao;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

export interface Pagina<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface Clube {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface LinhaClassificacao {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
export interface EdicaoJogador {
  name: string;
  position: Posicao;
  agility: number;
  age: number;
}

export interface NovoJogador extends EdicaoJogador {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
}
export interface NovoClube {
  name: string;
  acronym: string;
}
export interface Contrato {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

export interface JogadorDoElenco extends Jogador {
  contract: Contrato;
}

export interface ClubeDetalhado extends Clube {
  players: JogadorDoElenco[];
}
export interface CorpoCompra {
  club_id: number;
  loyalty_until: string;
}

export interface ResultadoCompra {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: "COMPRA";
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: string;
  };
  club_cash: number;
}
