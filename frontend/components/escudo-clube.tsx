import { cn } from "@/lib/utils";

export function EscudoClube({
  sigla,
  grande = false,
}: {
  sigla: string;
  grande?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center border bg-muted font-semibold",
        grande ? "size-12 rounded-xl text-sm" : "size-9 rounded-lg text-xs",
      )}
    >
      {sigla}
    </span>
  );
}
