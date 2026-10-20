import type { ReactNode } from "react";

interface Props {
  icone: ReactNode;
  titulo: string;
  descricao: string;
  children?: ReactNode;
}

/** Estado vazio, de erro ou "não encontrado" no centro de um cartão. */
export function EstadoCentral({ icone, titulo, descricao, children }: Props) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-6"
      >
        {icone}
      </span>
      <h3 className="mt-4 text-base font-semibold">{titulo}</h3>
      <p className="mt-1 max-w-[420px] text-sm text-muted-foreground">
        {descricao}
      </p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
