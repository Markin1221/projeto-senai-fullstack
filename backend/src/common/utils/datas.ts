const FORMATO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;
const TRES_HORAS = 3 * 60 * 60 * 1000;

/** RN01: só aceita AAAA-MM-DDTHH:MM-03:00 com data e hora que existem. */
export function interpretarDataBrasilia(texto: unknown): Date | null {
  if (typeof texto !== 'string') return null;
  const partes = FORMATO.exec(texto);
  if (!partes) return null;
  const [ano, mes, dia, hora, minuto] = partes.slice(1).map(Number);
  const local = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto));
  const existe =
    local.getUTCFullYear() === ano &&
    local.getUTCMonth() === mes - 1 &&
    local.getUTCDate() === dia &&
    local.getUTCHours() === hora &&
    local.getUTCMinutes() === minuto;
  return existe ? new Date(local.getTime() + TRES_HORAS) : null;
}

/** Respostas: AAAA-MM-DDTHH:MM:SS-03:00. */
export function formatarDataBrasilia(data: Date): string {
  const local = new Date(data.getTime() - TRES_HORAS);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${local.getUTCFullYear()}-${p(local.getUTCMonth() + 1)}-${p(local.getUTCDate())}` +
    `T${p(local.getUTCHours())}:${p(local.getUTCMinutes())}:${p(local.getUTCSeconds())}-03:00`
  );
}
