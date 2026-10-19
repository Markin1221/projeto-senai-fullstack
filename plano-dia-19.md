# Plano de hoje: Segunda 19/10/2026

> Contexto: leia primeiro `claude/plano-geral.md` e depois este arquivo. Backend fechado (dia 16). Os dias 17 e 18 do cronograma original (frontend partes 1 e 2) **não aconteceram**, então o frontend inteiro está pela frente e o cronograma abaixo foi comprimido.
>
> **Meta de hoje:** frontend com base pronta, **Jogadores completos (F01 a F04)** e **Clubes (F05)**. Se sobrar tempo, começar a página do clube (F07).

## Cronograma revisado (substitui o do `claude/plano-geral.md`)

| Dia               | Foco                                                                                                                               | Pontos do F1 em jogo          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Seg 19 (hoje)** | Base do frontend + Jogadores + Clubes                                                                                              | F01 a F05 (11 pts)            |
| **Ter 20**        | Página do clube, Compra, Venda, Histórico, Totais e CSV                                                                            | F06 a F11 (14 pts)            |
| **Qua 21**        | Liga (escalação, partida, histórico de partidas, classificação), estados das 6 listas, validações dos formulários, README completo | F12 a F14 (7 pts), F2, F3, F4 |
| **Qui 22**        | Ensaio de entrega do zero, bugs, diferenciais (testes, lint, Docker, Swagger)                                                      | B5, F5                        |
| **Sex 23**        | Buffer. Enviar até 15h (limite 20h)                                                                                                |                               |

Regra de ouro: **fidelidade visual ao Figma não conta ponto** (`barema.md`, seção 3.4). Use shadcn/ui padrão e não gaste tempo com tokens, tema escuro ou pixel. O que vale é a tela enviar o pedido certo, mostrar a resposta da API e tratar o código. O Figma serve só para o fluxo, os textos e os estados.

## Cuidado com o `passe-figma-spec.md`

A spec foi gerada a partir do Figma e **contradiz o enunciado em vários pontos de API**. Para o frontend, use sempre o contrato do `README.md`:

- Campos e query params em **snake_case** (`loyalty_until`, `market_value`, `club_id`, `min_age`), nunca camelCase.
- IDs são **inteiros**, não UUID. Rotas Next: `/clubes/[id]` com número.
- Compra e venda: `POST /players/{id}/buy` e `POST /players/{id}/sell`, não `/transactions/buy`.
- Edição de jogador: `PUT /players/{id}`.
- Tipos do histórico: `COMPRA,VENDA`.
- Exportação CSV: `GET /clubs/{id}/transactions/export`; o arquivo vem pronto da API (sem BOM). Ignore o trecho da spec que fala em BOM e em prefixar com apóstrofo.
- Ordenação de clubes: `name`, `net_worth_asc`, `net_worth_desc`.
- Atributos: `pace`, `shooting`, `passing`, `dribbling`, `defending`, `physical`.
- **Next não pode acessar o banco nem calcular regra** (eliminatório). Só rewrite/proxy para o backend.

## Bloco 0: Conferir o estado (~20 min)

- [ ] Marcar no `claude/plano-dia-16.md` o que ficou pronto. Subir banco e backend do zero e rodar um fluxo rápido (cadastrar jogador, criar clube, comprar).
- [ ] Ver o que existe em `frontend/` (o Bloco 5 do dia 16 previa só o esqueleto). Se já houver Next.js, Tailwind, shadcn e cliente de API, **pule o Bloco 1** e use o tempo no Bloco 2.
- [ ] Conferir se saiu errata ou resposta do SENAI às dúvidas. A errata prevalece sobre o enunciado.

## Bloco 1: Base do frontend (~1h30)

Tudo pensado para **não perder pontos em F2 e F3 depois**.

- [ ] Projeto Next.js (App Router) com Tailwind e shadcn/ui em `frontend/`, `frontend/.env.example`, arquivo de trava versionado.
- [ ] `next.config`: `rewrites` de `/api/v1/*` para a origem do backend (variável de ambiente). Nada de Route Handler que calcule ou acesse banco.
- [ ] **Camada de API única** em `frontend/src/lib/api/` (um arquivo por recurso: `players`, `clubs`, `market`, `transactions`, `lineup`, `matches`, `standings`) usando um `client.ts` central. **Nenhum `fetch` dentro de componente** (cada componente com chamada direta tira pontos em F2).
- [ ] Erro da API como classe própria (`ApiError` com `status` e `message`). Qualquer falha de rede vira `ApiError` com mensagem de conexão.
- [ ] Hooks de dados (por exemplo com TanStack Query) para listar e para mutações. Depois de cada ação, **invalidar** as consultas afetadas, para a tela atualizar sem recarregar a página.
- [ ] `lib/format.ts`: moeda com 2 casas e vírgula (`Intl.NumberFormat("pt-BR")`), data e hora em `America/Sao_Paulo`, variação com sinal, e função que monta `AAAA-MM-DDTHH:MM-03:00` a partir de data e hora digitadas.
- [ ] **Componentes compartilhados** (para não duplicar entre telas, critério de F2):
  - `DataTable` com os 3 estados embutidos (carregando com skeleton, vazio com mensagem e ação, erro com "Tentar de novo" mostrando o `message` da API).
  - `FormField` (rótulo visível, hint, mensagem de erro junto ao campo).
  - `ApiErrorAlert` (mostra o `message` da API).
  - Toast de sucesso e de erro (sonner).
  - `ConfirmDialog`.
  - `Money`, `ConditionBadge`, `PositionBadge`.
  - Botão que **desabilita durante o envio** e ignora clique duplo (guarda com `useRef` ou estado), para o HAR mostrar um só pedido.
- [ ] Shell: sidebar com Jogadores, Clubes, Partidas e Classificação, e área de conteúdo. Testar numa janela de **1366 × 768** (é o tamanho da correção).
- [ ] Commit e push (primeiro dia de envio do frontend, se ainda não houve push em `frontend/`).

## Bloco 2: Jogadores (F01 a F04, ~3h)

### 2.1 Lista (F01) e filtros (F02), ~1h30

- [ ] Tabela com: nome, posição, overall, agilidade, idade, condição, valor base, valor de mercado, clube (**"Livre"** quando não houver). **Ordem e valores vêm da API**, sem recalcular nada.
- [ ] Paginação de 10 por página (`limit=10`), navegação entre páginas e total de jogadores encontrados (`meta`).
- [ ] Busca por nome (debounce de 300 ms), filtros de posição, condição, **só livres** (`free=true`), faixa de idade (`min_age`, `max_age`) e faixa de valor de mercado (`min_value`, `max_value`), todos combináveis.
- [ ] Ordenação: nome, valor de mercado (nos dois sentidos), idade (nos dois sentidos) e posição (`sort` conforme o `README.md`).
- [ ] Com só livres e filtro por clube juntos: **a tela impede a combinação** (desabilita o select de clube com a aba Livres ativa, como no J04 do Figma) ou mostra o `message` do 400.
- [ ] Estado de carregamento, vazio e erro (já vêm do `DataTable`).

### 2.2 Exclusão (F03), ~20 min

- [ ] Botão **Excluir** só nos jogadores livres, com `ConfirmDialog`. Depois de excluir, o jogador sai da lista (invalidar a consulta). Toast de sucesso; erro mostra o `message` da API.

### 2.3 Cadastro, edição e condição (F04), ~1h10

- [ ] **Cadastro** com os sete indicadores: nome, posição, idade, agilidade, `pace`, `shooting`, `passing`, `dribbling`, `defending`, `physical` e `potential`. Depois de salvar, mostrar **valor base, overall e valor de mercado** devolvidos pela API (J07 do Figma é uma boa referência).
- [ ] **Validação no formulário, antes de enviar** (critério F2): obrigatórios; nome de 3 a 100 caracteres; idade de 16 a 45; agilidade de 1 a 100; atributos e potencial de 1 a 99. Mensagem junto ao campo. Regras que cruzam campos (soma <= 480, potencial >= maior atributo, agilidade 85 com 35+) ficam na API: a tela mostra o `message`.
- [ ] **Edição:** nome, posição, idade e agilidade. Posição desabilitada quando o jogador tem clube.
- [ ] **Alteração de condição:** os 3 valores; mostrar o novo valor de mercado depois de salvar.
- [ ] Todo erro da API exibido com o `message`; sucesso com toast.
- [ ] Um commit por funcionalidade (lista, filtros, exclusão, cadastro, edição, condição).

## Bloco 3: Clubes (F05, ~1h30)

- [ ] Lista de clubes: nome, sigla, caixa, valor do elenco e patrimônio. **Padrão: ordenada por nome, na ordem da API.** Adicione também o seletor de ordenação por patrimônio (`net_worth_desc`), que o F07 vai conferir.
- [ ] Formulário de criação: nome de 3 a 60 caracteres, sigla com 3 letras. Erros da API (nome ou sigla repetidos, 21º clube) com o `message`.
- [ ] Estados de carregamento, vazio e erro.
- [ ] Commit e push.

## Se sobrar tempo: página do clube (início do F07)

- [ ] Rota `/clubes/[id]` com KPIs (caixa, valor do elenco, patrimônio) e a tabela do elenco **na ordem da API**, com valor de mercado e as colunas do contrato (`loyalty_until`, `remaining_days`, `penalty_rate`). Clube inexistente mostra "Clube não encontrado" com o `message` da API.

## Fechamento do dia

- [ ] Push de tudo (confira que o frontend tem **commits em pelo menos 3 dias diferentes** até a entrega; hoje conta).
- [ ] Rodar o fluxo do roteiro F01 a F05 do zero, com o banco recriado, numa janela de 1366 × 768.
- [ ] Atualizar este arquivo marcando o que foi feito, para a conversa de amanhã (Compra, Venda e Histórico) começar daí.

## Checklist de qualidade (vale para o código de hoje)

- Nenhum `fetch` ou Axios dentro de componente React: tudo na camada `lib/api` ou nos hooks.
- Nenhum cálculo de regra na tela (valor de mercado, overall, patrimônio, dias restantes etc.). Somar valor e taxa para mostrar o custo total é permitido.
- Componente de tabela, de campo de formulário e de mensagens **únicos**, reaproveitados por todas as telas.
- Nomes de funções e variáveis em camelCase e componentes em PascalCase, em um idioma só. Campos da API ficam em snake_case.
- Sem código comentado nem arquivos sem uso.
- Commits pequenos e descritivos (exemplo: `feat(players): lista com filtros combináveis e paginação`).
