import type {
  Clube,
  Condicao,
  EdicaoJogador,
  Jogador,
  LinhaClassificacao,
  NovoJogador,
  Pagina,
  NovoClube,
} from "@/lib/tipos";

const BASE = "/api/v1";
const MENSAGEM_REDE = "Não foi possível falar com o servidor. Tente de novo.";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof ApiError ? erro.message : MENSAGEM_REDE;
}

export type Consulta = Record<
  string,
  string | number | boolean | null | undefined
>;

export function montarUrl(caminho: string, consulta?: Consulta): string {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(consulta ?? {})) {
    if (valor !== undefined && valor !== null && valor !== "")
      params.set(chave, String(valor));
  }
  const texto = params.toString();
  return `${BASE}${caminho}${texto ? `?${texto}` : ""}`;
}

async function requisitar<T>(
  metodo: string,
  caminho: string,
  opcoes: { consulta?: Consulta; corpo?: unknown } = {},
): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(montarUrl(caminho, opcoes.consulta), {
      method: metodo,
      headers:
        opcoes.corpo !== undefined
          ? { "Content-Type": "application/json" }
          : undefined,
      body:
        opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
    });
  } catch {
    throw new ApiError(0, MENSAGEM_REDE);
  }

  if (resposta.status === 204) return undefined as T;

  const texto = await resposta.text();
  let json: unknown;
  try {
    json = texto ? JSON.parse(texto) : undefined;
  } catch {
    json = undefined;
  }

  if (!resposta.ok) {
    const mensagem = (json as { message?: unknown } | undefined)?.message;
    throw new ApiError(
      resposta.status,
      typeof mensagem === "string" && mensagem
        ? mensagem
        : `Erro ${resposta.status}`,
    );
  }
  return json as T;
}

export const api = {
  get: <T>(caminho: string, consulta?: Consulta) =>
    requisitar<T>("GET", caminho, { consulta }),
  post: <T>(caminho: string, corpo?: unknown) =>
    requisitar<T>("POST", caminho, { corpo }),
  put: <T>(caminho: string, corpo: unknown) =>
    requisitar<T>("PUT", caminho, { corpo }),
  patch: <T>(caminho: string, corpo: unknown) =>
    requisitar<T>("PATCH", caminho, { corpo }),
  delete: <T>(caminho: string) => requisitar<T>("DELETE", caminho),
};

export const listarJogadores = (consulta?: Consulta) =>
  api.get<Pagina<Jogador>>("/players", consulta);
export const listarClubes = (consulta?: Consulta) =>
  api.get<Clube[]>("/clubs", consulta);
export const buscarClassificacao = () =>
  api.get<LinhaClassificacao[]>("/standings");
export const urlCsvDoClube = (clubeId: number, consulta?: Consulta) =>
  montarUrl(`/clubs/${clubeId}/transactions/export`, consulta);
export const cadastrarJogador = (corpo: NovoJogador) =>
  api.post<Jogador>("/players", corpo);
export const editarJogador = (id: number, corpo: EdicaoJogador) =>
  api.put<Jogador>(`/players/${id}`, corpo);
export const alterarCondicao = (id: number, condicao: Condicao) =>
  api.patch<Jogador>(`/players/${id}/condition`, { condition: condicao });
export const excluirJogador = (id: number) =>
  api.delete<void>(`/players/${id}`);
export const criarClube = (corpo: NovoClube) =>
  api.post<Clube>("/clubs", corpo);
