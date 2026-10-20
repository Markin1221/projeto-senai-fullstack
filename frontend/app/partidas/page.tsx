"use client";

import { Plus, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AlertaErro } from "@/components/alerta-erro";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { FormularioPartida } from "@/components/formulario-partida";
import { HistoricoPartidas } from "@/components/historico-partidas";
import { Modal } from "@/components/modal";
import { UltimaPartida } from "@/components/ultima-partida";
import { Button } from "@/components/ui/button";
import { useDados } from "@/hooks/use-dados";
import { listarClubes, listarPartidas } from "@/lib/api";
import { avisarSucesso } from "@/lib/avisos";
import type { Partida } from "@/lib/tipos";

export default function PaginaPartidas() {
  const carregar = useCallback(() => listarClubes({ size: 100 }), []);
  const { dados, erro, recarregar } = useDados(carregar);
  const [criando, setCriando] = useState(false);
  const roteador = useRouter();
  const [versao, setVersao] = useState(0);

  const carregarUltima = useCallback(
    async () => (await listarPartidas())[0] ?? null,
    // versao força nova consulta depois de uma partida jogada
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao],
  );
  const { dados: ultima } = useDados(carregarUltima);

  const clubes = useMemo(() => dados ?? [], [dados]);
  const siglas = useMemo(
    () => new Map(clubes.map((c) => [c.id, c.acronym])),
    [clubes],
  );

  const verDuelos = (partida: Partida) =>
    roteador.push(`/partidas/${partida.id}`);

  const aoJogar = (partida: Partida) => {
    setCriando(false);
    setVersao((v) => v + 1);
    roteador.push(`/partidas/${partida.id}`);
    avisarSucesso(
      "Partida jogada",
      `${partida.home.club_name} ${partida.home.goals} × ${partida.away.goals} ${partida.away.club_name}. Placar e duelos devolvidos pela API.`,
    );
  };

  return (
    <section className="space-y-6">
      <CabecalhoPagina
        icone={Swords}
        titulo="Partidas"
        descricao="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
      >
        <Button onClick={() => setCriando(true)}>
          <Plus aria-hidden="true" className="size-4" />
          Nova partida
        </Button>
      </CabecalhoPagina>

      {erro && <AlertaErro mensagem={erro} aoTentarDeNovo={recarregar} />}

      {ultima && (
        <UltimaPartida
          partida={ultima}
          siglas={siglas}
          aoVerDuelos={verDuelos}
        />
      )}
      <HistoricoPartidas
        clubes={clubes}
        versao={versao}
        aoVerDuelos={verDuelos}
      />

      <Modal
        aberto={criando}
        titulo="Nova partida"
        descricao="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
        largura="max-w-[520px]"
        aoFechar={() => setCriando(false)}
      >
        <FormularioPartida
          clubes={clubes}
          aoJogar={aoJogar}
          aoFechar={() => setCriando(false)}
        />
      </Modal>
    </section>
  );
}
