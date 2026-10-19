"use client";

import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";

interface Props {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  rotuloConfirmar: string;
  enviando: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

export function DialogoConfirmacao({
  aberto,
  titulo,
  mensagem,
  rotuloConfirmar,
  enviando,
  aoConfirmar,
  aoCancelar,
}: Props) {
  return (
    <Modal aberto={aberto} titulo={titulo} aoFechar={aoCancelar}>
      <p className="text-sm text-muted-foreground">{mensagem}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={aoCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={aoConfirmar} disabled={enviando}>
          {enviando ? "Aguarde…" : rotuloConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
