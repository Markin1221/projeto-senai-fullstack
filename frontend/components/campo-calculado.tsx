import { Lock } from "lucide-react";

interface Props {
  rotulo: string;
  texto: string;
  dica: string;
}

export function CampoCalculado({ rotulo, texto, dica }: Props) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm leading-none font-medium text-muted-foreground">
        {rotulo}
      </p>
      <div className="flex h-8 items-center gap-2 rounded-lg border border-dashed bg-muted/50 px-2.5 text-sm text-muted-foreground">
        <Lock aria-hidden="true" className="size-3.5" />
        {texto}
      </div>
      <p className="text-xs text-muted-foreground">{dica}</p>
    </div>
  );
}
