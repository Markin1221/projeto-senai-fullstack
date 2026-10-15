/**
 * V4: remove espaços do início e do fim e reduz espaços repetidos a um só.
 * Só o espaço (U+0020) é tratado; tabulação e quebra de linha seguem para a
 * validação, que as recusa.
 */
export function normalizarEspacos(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;
  return valor.replace(/ {2,}/g, ' ').replace(/^ +| +$/g, '');
}
