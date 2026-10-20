import { CircleDot } from "lucide-react";
import { Fragment } from "react";
import { SeloSigla } from "@/components/selo-sigla";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rotuloAtributo } from "@/lib/dados-partida";
import { rotuloCondicao } from "@/lib/formatar";
import type { Duelo, ParticipanteDuelo, Partida } from "@/lib/tipos";

function Participante({ p, clube }: { p: ParticipanteDuelo; clube: string }) {
  const condicao =
    p.condition === "APTO" ? "" : `, ${rotuloCondicao(p.condition)}`;
  return (
    <div>
      <p className="font-medium">{p.player_name}</p>
      <p className="text-xs text-muted-foreground">
        {p.position}
        {condicao} · {clube}
      </p>
    </div>
  );
}

function LinhaDuelo({
  duelo,
  atacante,
  defensor,
}: {
  duelo: Duelo;
  atacante: string;
  defensor: string;
}) {
  return (
    <TableRow>
      <TableCell className="tabular-nums">{duelo.order}</TableCell>
      <TableCell>
        <Participante p={duelo.attacker} clube={atacante} />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {rotuloAtributo(duelo.attacker.attribute)}{" "}
        <strong>{duelo.attacker.value}</strong>
      </TableCell>
      <TableCell>
        <Participante p={duelo.defender} clube={defensor} />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        Defesa <strong>{duelo.defender.value}</strong>
      </TableCell>
      <TableCell>
        {duelo.goal ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-success-soft-border bg-success-soft px-2 py-0.5 text-xs font-medium text-success-soft-foreground">
            <CircleDot aria-hidden="true" className="size-3" />
            Gol
          </span>
        ) : (
          <span className="text-muted-foreground">Sem gol</span>
        )}
      </TableCell>
    </TableRow>
  );
}

export function DuelosPartida({
  partida,
  siglas,
}: {
  partida: Partida;
  siglas: Map<number, string>;
}) {
  const duelos = partida.duels ?? [];
  const lados = [
    { lado: partida.home, adversario: partida.away, papel: "mandante" },
    { lado: partida.away, adversario: partida.home, papel: "visitante" },
  ];

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="px-5 py-4">
        <h2 className="font-semibold">Duelos</h2>
        <p className="text-xs text-muted-foreground">
          Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de
          linha vão do 1º (o mais recuado) ao 4º (o mais avançado), pela ordem
          do elenco: o 4º ataca o goleiro, o 3º ataca o 1º e o 2º ataca o 2º.
        </p>
      </div>
      {duelos.length === 0 ? (
        <p className="border-t px-5 py-8 text-center text-sm text-muted-foreground">
          Esta partida não tem duelos.
        </p>
      ) : (
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Duelo</TableHead>
              <TableHead>Atacante</TableHead>
              <TableHead>Ataque</TableHead>
              <TableHead>Defensor</TableHead>
              <TableHead>Defesa</TableHead>
              <TableHead>Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lados.map(({ lado, adversario, papel }) => {
              const doLado = duelos.filter(
                (d) => d.attacking_club_id === lado.club_id,
              );
              const gols = doLado.filter((d) => d.goal).length;
              return (
                <Fragment key={lado.club_id}>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={5} className="font-medium">
                      <span className="mr-2 inline-block align-middle">
                        <SeloSigla sigla={siglas.get(lado.club_id) ?? "—"} />
                      </span>
                      Ataques do {lado.club_name} ({papel})
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {gols} {gols === 1 ? "gol" : "gols"}
                    </TableCell>
                  </TableRow>
                  {doLado.map((d) => (
                    <LinhaDuelo
                      key={d.order}
                      duelo={d}
                      atacante={lado.club_name}
                      defensor={adversario.club_name}
                    />
                  ))}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
