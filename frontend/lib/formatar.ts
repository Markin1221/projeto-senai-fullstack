import type { Condicao } from "@/lib/tipos";

const casas = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
const moeda = new Intl.NumberFormat("pt-BR", casas);
const variacao = new Intl.NumberFormat("pt-BR", {
  ...casas,
  signDisplay: "exceptZero",
});
const dataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** 261.15 -> "261,15" (moedas fictícias, sem símbolo) */
export const formatarMoeda = (valor: number) => moeda.format(valor);

/** -38.85 -> "−38,85"; 35.7 -> "+35,70"; 0 -> "0,00" */
export const formatarVariacao = (valor: number) =>
  variacao.format(valor).replace("-", "−");

/** "2026-10-17T11:06:29-03:00" -> "17/10/2026 11:06" (horário de Brasília) */
export const formatarDataHora = (iso: string) => dataHora.format(new Date(iso));

/** Valor de <input type="datetime-local"> ("2027-03-02T10:15") -> "2027-03-02T10:15-03:00" */
export const paraEnvioDeData = (valorLocal: string) =>
  `${valorLocal.slice(0, 16)}-03:00`;

const ROTULOS_CONDICAO: Record<Condicao, string> = {
  APTO: "Apto",
  MAL_CONDICIONADO: "Mal condicionado",
  DOENTE: "Doente",
};
export const rotuloCondicao = (condicao: Condicao) =>
  ROTULOS_CONDICAO[condicao];

export const NOMES_POSICAO: Record<string, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meio-campo",
  ATA: "Atacante",
};

const soData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const soHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});
const numeroComVirgula = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "2028-11-03T11:20:00-03:00" -> "03/11/2028" (horário de Brasília) */
export const formatarData = (iso: string) => soData.format(new Date(iso));

/** "2028-11-03T11:20:00-03:00" -> "11:20" (horário de Brasília) */
export const formatarHora = (iso: string) => soHora.format(new Date(iso));

/** 51.58 -> "51,58" (sem símbolo de moeda) */
export const formatarNumero = (valor: number) => numeroComVirgula.format(valor);
