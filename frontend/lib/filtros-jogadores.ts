import type { Consulta } from "@/lib/api";
import type { OpcaoSelect } from "@/components/campo-select";

export interface FiltrosJogadores {
  busca: string;
  posicao: string;
  condicao: string;
  situacao: "todos" | "livres";
  clube: string;
  idadeMin: string;
  idadeMax: string;
  valorMin: string;
  valorMax: string;
  ordem: string;
}

export const FILTROS_INICIAIS: FiltrosJogadores = {
  busca: "",
  posicao: "",
  condicao: "",
  situacao: "todos",
  clube: "",
  idadeMin: "",
  idadeMax: "",
  valorMin: "",
  valorMax: "",
  ordem: "name",
};

export const OPCOES_POSICAO: OpcaoSelect[] = [
  { valor: "", rotulo: "Todas" },
  { valor: "GOL", rotulo: "GOL" },
  { valor: "ZAG", rotulo: "ZAG" },
  { valor: "LAT", rotulo: "LAT" },
  { valor: "MEI", rotulo: "MEI" },
  { valor: "ATA", rotulo: "ATA" },
];

export const OPCOES_CONDICAO: OpcaoSelect[] = [
  { valor: "", rotulo: "Todas" },
  { valor: "APTO", rotulo: "Apto" },
  { valor: "MAL_CONDICIONADO", rotulo: "Mal condicionado" },
  { valor: "DOENTE", rotulo: "Doente" },
];

export const OPCOES_SITUACAO: OpcaoSelect[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "livres", rotulo: "Só livres" },
];

export const OPCOES_ORDEM: OpcaoSelect[] = [
  { valor: "name", rotulo: "Nome" },
  { valor: "value_desc", rotulo: "Valor de mercado (maior primeiro)" },
  { valor: "value_asc", rotulo: "Valor de mercado (menor primeiro)" },
  { valor: "age_asc", rotulo: "Idade (mais novo primeiro)" },
  { valor: "age_desc", rotulo: "Idade (mais velho primeiro)" },
  { valor: "position", rotulo: "Posição" },
];

export const POR_PAGINA = 10;

export function consultaDeFiltros(
  f: FiltrosJogadores,
  pagina: number,
): Consulta {
  const livres = f.situacao === "livres";
  return {
    search: f.busca.trim(),
    position: f.posicao,
    condition: f.condicao,
    free: livres ? true : undefined,
    club_id: livres ? undefined : f.clube,
    min_age: f.idadeMin,
    max_age: f.idadeMax,
    min_value: f.valorMin,
    max_value: f.valorMax,
    sort: f.ordem,
    page: pagina,
    limit: POR_PAGINA,
  };
}
