export function salvarArquivo(conteudo: Blob, nome: string): void {
  const url = URL.createObjectURL(conteudo);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
export function nomeDeArquivoSeguro(texto: string): string {
  return texto.replace(/[\\/:*?"<>|]/g, "").trim();
}
