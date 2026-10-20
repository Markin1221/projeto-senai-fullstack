"use client";

import { useParams } from "next/navigation";
import { DetalhePartida } from "@/components/detalhe-partida";

export default function PaginaPartida() {
  const { id } = useParams<{ id: string }>();
  return <DetalhePartida partidaId={Number(id)} />;
}
