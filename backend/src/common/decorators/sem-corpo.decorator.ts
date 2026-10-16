import { SetMetadata } from '@nestjs/common';

export const SEM_CORPO = 'semCorpo';
/** Rota sem corpo (ex.: venda): um corpo enviado é ignorado. */
export const SemCorpo = () => SetMetadata(SEM_CORPO, true);
