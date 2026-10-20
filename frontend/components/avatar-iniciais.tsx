import { cn } from "@/lib/utils";

const CORES = [
  "bg-[#ede9fe] text-[#7008e7]",
  "bg-[#fce7f3] text-[#c2005c]",
  "bg-[#cefafe] text-[#005f78]",
  "bg-[#cbfbf1] text-[#005f5a]",
  "bg-[#e4e4e7] text-[#3f3f46]",
];

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

export function AvatarIniciais({ nome, id }: { nome: string; id: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
        CORES[id % CORES.length],
      )}
    >
      {iniciais(nome)}
    </span>
  );
}
