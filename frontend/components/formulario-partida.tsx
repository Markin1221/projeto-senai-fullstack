"use client";

import { useState } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { Button } from "@/components/ui/button";
import { useEnvio } from "@/hooks/use-envio";
import { jogarPartida, mensagemDeErro } from "@/lib/api";
import type { Clube, Partida } from "@/lib/tipos";

interface Props {
  clubes: Clube[];
  aoJogar: (partida: Partida) => void;
}

const classeSelect = "w-full rounded-md border bg-background px-3 py-2 text-sm";

export function FormularioPartida({ clubes, aoJogar }: Props) {
  const { enviando, executar } = useEnvio();
  const [mandante, setMandante] = useState("");
  const [visitante, setVisitante] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function jogar() {
    setErro(null);
    await executar(async () => {
      try {
        const partida = await jogarPartida({
          home_club_id: Number(mandante),
          away_club_id: Number(visitante),
        });
        aoJogar(partida);
      } catch (e) {
        setErro(mensagemDeErro(e));
      }
    });
  }

  const opcoes = clubes.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name} ({c.acronym})
    </option>
  ));

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          Mandante
          <select
            className={classeSelect}
            value={mandante}
            onChange={(e) => setMandante(e.target.value)}
          >
            <option value="">Selecione...</option>
            {opcoes}
          </select>
        </label>
        <label className="block text-sm">
          Visitante
          <select
            className={classeSelect}
            value={visitante}
            onChange={(e) => setVisitante(e.target.value)}
          >
            <option value="">Selecione...</option>
            {opcoes}
          </select>
        </label>
      </div>
      {erro && <AlertaErro mensagem={erro} />}
      <Button onClick={jogar} disabled={!mandante || !visitante || enviando}>
        {enviando ? "Jogando..." : "Jogar partida"}
      </Button>
    </div>
  );
}
