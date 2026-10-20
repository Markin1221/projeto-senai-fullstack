"use client";

import { Info, Shield, Swords } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { CampoSelect, type OpcaoSelect } from "@/components/campo-select";
import { Button } from "@/components/ui/button";
import { useEnvio } from "@/hooks/use-envio";
import { jogarPartida, mensagemDeErro } from "@/lib/api";
import type { Clube, Partida } from "@/lib/tipos";

interface Props {
  clubes: Clube[];
  aoJogar: (partida: Partida) => void;
  aoFechar: () => void;
}

export function FormularioPartida({ clubes, aoJogar, aoFechar }: Props) {
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

  const opcoes: OpcaoSelect[] = [
    { valor: "", rotulo: "Escolha um clube" },
    ...clubes.map((c) => ({
      valor: String(c.id),
      rotulo: `${c.name} (${c.acronym})`,
    })),
  ];
  // Só atalho de navegação: o clube citado na mensagem da API, se houver.
  const clubeCitado = erro
    ? clubes.find((c) => erro.includes(c.name))
    : undefined;

  return (
    <div className="space-y-4">
      <CampoSelect
        rotulo="Mandante"
        icone={<Shield aria-hidden="true" className="size-4" />}
        opcoes={opcoes}
        value={mandante}
        dica="Faz os 3 primeiros ataques."
        onChange={(e) => setMandante(e.target.value)}
      />
      <CampoSelect
        rotulo="Visitante"
        icone={<Shield aria-hidden="true" className="size-4" />}
        opcoes={opcoes}
        value={visitante}
        dica="Precisa ser um clube diferente do mandante."
        onChange={(e) => setVisitante(e.target.value)}
      />

      <div className="space-y-2 rounded-[10px] border bg-muted/50 p-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Info aria-hidden="true" className="size-4" />
          Como sai o placar
        </p>
        <p>
          Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha
          vão do 1º (o mais recuado) ao 4º (o mais avançado): o 4º enfrenta o
          goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º do adversário. O
          atacante usa finalização (ATA), passe (MEI) ou drible (ZAG e LAT), e
          quem defende usa defesa. É gol só quando o ataque é maior; mal
          condicionado joga com 15% a menos.
        </p>
        <p>
          Os dois clubes precisam ter os 5 titulares escalados. A partida não
          mexe no caixa.
        </p>
      </div>

      {erro && (
        <>
          <AlertaErro
            titulo="Não foi possível jogar a partida"
            mensagem={erro}
          />
          {clubeCitado && (
            <Link
              href={`/clubes/${clubeCitado.id}`}
              className="inline-flex h-8 items-center rounded-lg border bg-background px-3 text-sm font-medium hover:bg-muted"
            >
              Abrir a escalação do {clubeCitado.name}
            </Link>
          )}
        </>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={aoFechar}
          disabled={enviando}
        >
          Cancelar
        </Button>
        <Button onClick={jogar} disabled={!mandante || !visitante || enviando}>
          <Swords aria-hidden="true" />
          {enviando ? "Jogando…" : "Jogar partida"}
        </Button>
      </div>
    </div>
  );
}
