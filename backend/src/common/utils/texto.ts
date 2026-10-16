export function normalizarEspacos(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;
  return valor.replace(/ {2,}/g, ' ').replace(/^ +| +$/g, '');
}

export function semAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Mn}/gu, '');
}

export function chaveDeNome(texto: string): string {
  return semAcentos(texto.toLowerCase());
}

/** Compara ponto de código a ponto de código (espaço < hífen < letras). */
export function compararTextos(a: string, b: string): number {
  const pa = Array.from(a);
  const pb = Array.from(b);
  const n = Math.min(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const diferenca = pa[i].codePointAt(0)! - pb[i].codePointAt(0)!;
    if (diferenca !== 0) return diferenca;
  }
  return pa.length - pb.length;
}

export function compararNomes(a: string, b: string): number {
  return compararTextos(chaveDeNome(a), chaveDeNome(b));
}
