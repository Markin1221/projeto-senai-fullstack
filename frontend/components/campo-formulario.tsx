"use client";

import { useId, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props extends ComponentProps<typeof Input> {
  rotulo: string;
  erro?: string;
  dica?: string;
}

export function CampoFormulario({ rotulo, erro, dica, ...entrada }: Props) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `${id}-erro` : undefined}
        {...entrada}
      />
      {!erro && dica && <p className="text-xs text-muted-foreground">{dica}</p>}
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
