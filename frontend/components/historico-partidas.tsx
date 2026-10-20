"use client";

import { Swords } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { DetalhePartida } from "@/components/detalhe-partida";
import { Modal } from "@/components/modal";
import { TabelaDados, type Coluna } from "@/components/tabela-dados";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { listarPartidas } from "@/lib/api";
import { textoResultado } from "@/lib/dados-partida";
import { formatarDataHora } from "@/lib/formatar";
import type { Clube, Partida } from "@/lib/tipos";

interface Props {
  clubes: Clube[];
  versao: number;
}

function criarColunas(aoAbrir: (p: Partida) => void): Coluna<Partida>[] {
  return [
    { titulo: "Data", celula: (p) => formatarDataHora(p.played_at) },
    { titulo: "Mandante", celula: (p) => p.home.club_name },
    {
      titulo: "Placar",
      celula: (p) => `${p.home.goals} × ${p.away.goals}`,
      numerica: true,
    },
    { titulo: "Visitante", celula: (p) => p.away.club_name },
    { titulo: "Resultado", celula: (p) => textoResultado(p) },
    {
      titulo: "Ações",
      celula: (p) => (
        <Button variant="outline" size="sm" onClick={() => aoAbrir(p)}>
          Ver duelos
        </Button>
      ),
    },
  ];
}

export function HistoricoPartidas({ clubes, versao }: Props) {
  const [clubeId, setClubeId] = useState("");
  const [aberta, setAberta] = useState<Partida | null>(null);

  const carregar = useCallback(
    () => listarPartidas(clubeId || undefined),
    // versao força nova consulta depois de uma partida jogada
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clubeId, versao],
  );
  const { dados, carregando, erro, recarregar } = useDados(carregar);
  const colunas = useMemo(() => criarColunas(setAberta), []);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold">Histórico de partidas</h2>
        <label className="text-sm">
          Clube
          <select
            className="ml-2 rounded-md border bg-background px-3 py-2 text-sm"
            value={clubeId}
            onChange={(e) => setClubeId(e.target.value)}
          >
            <option value="">Todos</option>
            {clubes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <TabelaDados
        colunas={colunas}
        linhas={dados ?? undefined}
        carregando={carregando}
        erro={erro}
        aoTentarDeNovo={recarregar}
        tituloErro="Não foi possível carregar as partidas"
        vazio={{
          titulo: "Nenhuma partida jogada",
          descricao:
            "Escale os 5 titulares de dois clubes e jogue a primeira partida.",
          icone: <Swords />,
        }}
        chave={(p) => p.id}
      />

      <Modal
        aberto={aberta !== null}
        titulo="Duelos da partida"
        aoFechar={() => setAberta(null)}
      >
        {aberta && (
          <div className="space-y-4">
            <DetalhePartida partidaId={aberta.id} />
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setAberta(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
