import { toast } from "sonner";
import { mensagemDeErro } from "@/lib/api";

export const avisarSucesso = (titulo: string, detalhe?: string) =>
  toast.success(titulo, { description: detalhe });

/** Mostra o `message` devolvido pela API. */
export const avisarErro = (erro: unknown) => toast.error(mensagemDeErro(erro));
