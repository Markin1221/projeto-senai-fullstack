import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function AvisoInformativo({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-[10px] border bg-muted/50 p-3 text-xs text-muted-foreground">
      <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
