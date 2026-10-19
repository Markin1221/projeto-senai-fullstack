import { paraEnvioDeData } from "@/lib/formatar";
import type { CorpoCompra } from "@/lib/tipos";

export interface DadosFormularioCompra {
  clube: string;
  fidelidade: string;
}

export type ErrosCompra = Partial<Record<keyof DadosFormularioCompra, string>>;

export function validarCompra(dados: DadosFormularioCompra): ErrosCompra {
  const erros: ErrosCompra = {};
  if (dados.clube === "") erros.clube = "Escolha um clube.";
  if (dados.fidelidade === "")
    erros.fidelidade = "Informe a data e a hora do fim da fidelidade.";
  return erros;
}

export function paraCorpoCompra(dados: DadosFormularioCompra): CorpoCompra {
  return {
    club_id: Number(dados.clube),
    loyalty_until: paraEnvioDeData(dados.fidelidade),
  };
}
