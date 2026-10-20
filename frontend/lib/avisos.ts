import { toast } from "sonner";
import { mensagemDeErro } from "@/lib/api";

/** Avisa a barra lateral (contadores e lista de clubes) que os dados mudaram. */
export const EVENTO_DADOS_ALTERADOS = "passe:dados-alterados";

export const avisarSucesso = (titulo: string, detalhe?: string) => {
  toast.success(titulo, { description: detalhe });
  window.dispatchEvent(new Event(EVENTO_DADOS_ALTERADOS));
};

/** Mostra o `message` devolvido pela API. */
export const avisarErro = (erro: unknown) => toast.error(mensagemDeErro(erro));
