import type { Condicao } from "@/lib/tipos";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const variacao = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  signDisplay: "always",
});
const dataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** 261.15 -> "R$ 261,15" */
export const formatarMoeda = (valor: number) => moeda.format(valor);

/** -38.85 -> "-R$ 38,85"; 35.7 -> "+R$ 35,70" */
export const formatarVariacao = (valor: number) => variacao.format(valor);

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
