import {
  ChartNoAxesColumn,
  Coins,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Tag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { AvatarIniciais } from "@/components/avatar-iniciais";
import { SeloCondicao } from "@/components/selo-condicao";
import { SeloPosicao } from "@/components/selo-posicao";
import { Button } from "@/components/ui/button";
import { formatarMoeda } from "@/lib/formatar";
import type { Jogador } from "@/lib/tipos";

interface Props {
  jogador: Jogador;
  nomeDoClube?: string;
  aoEditar: () => void;
  aoAlterarCondicao: () => void;
  aoComprar: () => void;
}

const INDICADORES = [
  ["pace", "Velocidade"],
  ["shooting", "Finalização"],
  ["passing", "Passe"],
  ["dribbling", "Drible"],
  ["defending", "Defesa"],
  ["physical", "Físico"],
] as const;

function CartaoValor({
  icone: Icone,
  rotulo,
  valor,
  dica,
}: {
  icone: LucideIcon;
  rotulo: string;
  valor: string;
  dica: string;
}) {
  return (
    <div className="space-y-1 rounded-xl border p-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {rotulo}
        <Icone aria-hidden="true" className="size-4" />
      </div>
      <p className="text-2xl font-semibold tabular-nums">{valor}</p>
      <p className="text-xs text-muted-foreground">{dica}</p>
    </div>
  );
}

export function PainelJogador({
  jogador,
  nomeDoClube,
  aoEditar,
  aoAlterarCondicao,
  aoComprar,
}: Props) {
  const livre = jogador.club_id === null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pr-8">
        <div className="scale-125">
          <AvatarIniciais nome={jogador.name} id={jogador.id} />
        </div>
        <div className="ml-1 space-y-1">
          <p className="text-lg leading-tight font-semibold">{jogador.name}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <SeloPosicao posicao={jogador.position} />
            <SeloCondicao condicao={jogador.condition} />
            {livre && (
              <span className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium">
                Livre
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CartaoValor
          icone={Coins}
          rotulo="Valor de mercado"
          valor={formatarMoeda(jogador.market_value)}
          dica="Calculado automaticamente"
        />
        <CartaoValor
          icone={Tag}
          rotulo="Valor base"
          valor={formatarMoeda(jogador.base_value)}
          dica="Calculado no cadastro"
        />
        <CartaoValor
          icone={ChartNoAxesColumn}
          rotulo="Overall"
          valor={String(jogador.overall)}
          dica="Calculado pela posição"
        />
        <CartaoValor
          icone={TrendingUp}
          rotulo="Potencial"
          valor={String(jogador.potential)}
          dica="Informado no cadastro"
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold">Indicadores técnicos</h3>
          <span className="text-xs text-muted-foreground">
            Escala de 1 a 99
          </span>
        </div>
        <ul className="space-y-2.5">
          {INDICADORES.map(([campo, rotulo]) => (
            <li key={campo} className="flex items-center gap-3 text-sm">
              <span className="w-24 text-muted-foreground">{rotulo}</span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="absolute inset-y-0 left-0 bg-primary/25"
                  style={{ width: `${jogador.potential}%` }}
                />
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  style={{ width: `${jogador[campo]}%` }}
                />
              </span>
              <span className="w-7 text-right font-semibold tabular-nums">
                {jogador[campo]}
              </span>
            </li>
          ))}
        </ul>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2 w-3 rounded-sm bg-primary"
            />
            Valor do atributo
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2 w-3 rounded-sm bg-primary/25"
            />
            Até o potencial ({jogador.potential}), que nenhum atributo passa
          </span>
        </p>
      </section>

      <dl className="divide-y rounded-xl border text-sm">
        {[
          ["Idade", `${jogador.age} anos`],
          ["Agilidade", String(jogador.agility)],
          ["Clube", livre ? "Livre" : (nomeDoClube ?? `#${jogador.club_id}`)],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="flex justify-between px-4 py-3">
            <dt className="text-muted-foreground">{rotulo}</dt>
            <dd className="font-semibold">{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center gap-2 border-t pt-4">
        <Button variant="outline" onClick={aoEditar}>
          <Pencil aria-hidden="true" className="size-4" />
          Editar
        </Button>
        <Button variant="outline" onClick={aoAlterarCondicao}>
          <HeartPulse aria-hidden="true" className="size-4" />
          Alterar condição
        </Button>
        {livre && (
          <Button className="ml-auto" onClick={aoComprar}>
            <ShoppingCart aria-hidden="true" className="size-4" />
            Comprar
          </Button>
        )}
      </div>
    </div>
  );
}
