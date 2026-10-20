# Plano de entrega na quarta 21/10/2026 (refeito)

> Contexto: leia primeiro `claude/plano-geral.md` e depois este arquivo. Este plano substitui o cronograma do `claude/plano-geral.md`.
>
> **Estado de partida (segunda 19/10, 10:50):** backend **fechado** (B01 a B22 conferidos no dia 16, README parcial feito, 3 dias de push). Frontend tem só o **esqueleto** do dia 16: Next.js, Tailwind, shadcn/ui, rewrite para a API, camada de cliente, formatação e componentes base (tabela com 3 estados, campo de formulário, toast).
>
> **Meta:** enviar na **quarta 21/10 até as 15h**. Limite oficial: sexta 23/10, 20h. Quinta e sexta ficam de reserva.

## Resumo

| Quando                 | O que                                            | Itens      |
| ---------------------- | ------------------------------------------------ | ---------- |
| **Seg 19, 11h às 23h** | Jogadores, Clubes, página do clube, Compra       | F01 a F07  |
| **Ter 20, 9h às 22h**  | Venda, Histórico, CSV, Liga, estados das listas  | F08 a F14  |
| **Qua 21, 9h às 15h**  | Verificação final, README, ensaio do zero, envio | F2, F3, F4 |

Se na terça à noite faltarem mais de 4 itens do F1, envie na **quinta 22 até as 15h**. O limite continua sendo sexta, então isso não arrisca nada.

## O que NÃO fazer

- Fidelidade ao Figma, tema escuro e animações: não contam ponto (`barema.md`, seção 3.4).
- Responsividade 375 px, testes no frontend e Docker Compose completo: cortados.
- Manter só os diferenciais baratos, que valem 0,5 cada: Swagger, lint e formatação, comando de testes do backend e logs (logs já existem).

## Cuidado com o `passe-figma-spec.md`

Use o contrato do `README.md`: **snake_case**, IDs inteiros, `POST /players/{id}/buy` e `/sell`, `PUT /players/{id}`, tipos `COMPRA,VENDA`, CSV pronto de `GET /clubs/{id}/transactions/export`, ordenação de clubes `name`, `net_worth_asc`, `net_worth_desc`. O Figma serve só para fluxo, textos e estados. Next só repassa chamadas ao backend, nunca acessa banco nem calcula regra.

## Regras de código para não perder pontos (F2 e F3)

- Nenhum `fetch` em componente: tudo em `frontend/src/lib/api/` ou nos hooks.
- Depois de cada ação, invalidar as consultas e a tela atualizar **sem recarregar a página**.
- Nada de regra recalculada na tela. Somar valor e taxa para o custo total é permitido.
- Cada formulário já nasce validando os campos obrigatórios e os limites de um campo só, com a mensagem junto ao campo.
- Botão de ação desabilita durante o envio e ignora clique duplo.
- Toda recusa da API mostra o `message`. Todo sucesso mostra uma mensagem.
- Tabela, campo de formulário e mensagens: um componente cada, reaproveitado.

---

## Segunda 19/10

> **Status (seg 19/10, 18:35):** F01 a F06 prontos e testados (Jogadores, Clubes, página do clube com indicadores e elenco, Compra). **Pendente: seções Histórico e Escalação da página do clube (terça) e confirmar o push da Compra.**

### 11:00 (15 min): conferir o esqueleto

- [x] Subir banco, backend e frontend do zero e abrir a tela. Confirmar que existem: camada de API com `ApiError`, `format.ts`, tabela com carregando/vazio/erro, campo de formulário, toast, confirmação e botão com proteção contra clique duplo. Se algo faltar, **complete antes de usar**.
- [x] Instalar TanStack Query (ou equivalente) se ainda não houver, para invalidar consultas depois de cada ação. (Feito com o hook próprio `useDados` e `recarregar`, sem TanStack.)

### 11:15 às 13:30: Jogadores, lista (F01 e F02)

- [x] Tabela: nome, posição, overall, agilidade, idade, condição, valor base, valor de mercado, clube ("Livre" se não tiver). Ordem e valores como a API devolve.
- [x] 10 por página, navegação e total encontrado (`meta`).
- [x] Busca por nome; filtros de posição, condição, só livres, faixa de idade e faixa de valor de mercado, combináveis; ordenação por nome, valor e idade (nos dois sentidos) e posição.
- [x] Só livres junto com clube: a tela impede (desabilita o select) ou mostra o `message` do 400.
- [x] Commits por funcionalidade. Push.

### 14:30 às 17:00: Jogadores, ações (F03 e F04)

- [x] **Excluir** só em jogador livre, com confirmação; o jogador sai da lista.
- [x] **Cadastro** com os 7 indicadores (nome 3 a 100; idade 16 a 45; agilidade 1 a 100; atributos e potencial 1 a 99). Depois de salvar, mostrar valor base, overall e valor de mercado devolvidos.
- [x] **Edição** (nome, posição, idade, agilidade; posição desabilitada se o jogador tem clube) e **alteração de condição** (mostrar o novo valor de mercado).
- [x] Regras que cruzam campos ficam na API: a tela mostra o `message`.
- [x] Push.

### 17:00 às 18:00: Clubes (F05)

- [x] Lista com nome, sigla, caixa, valor do elenco e patrimônio, por nome (ordem da API), com seletor de patrimônio do maior para o menor.
- [x] Formulário de criação (nome 3 a 60, sigla com 3 letras). Erros da API com o `message`.

### 18:00 às 19:30: Página do clube (F07)

- [x] `/clubes/[id]`: caixa, valor do elenco, patrimônio e elenco **na ordem da API**, com valor de mercado e colunas do contrato (`loyalty_until`, `remaining_days`, `penalty_rate`). Clube inexistente: `message` da API e link de volta.
- [ ] Já deixe a página com as seções Elenco, Histórico e Escalação (o conteúdo das duas últimas entra amanhã). _(Só o Elenco existe; Histórico e Escalação entram na terça.)_

### 20:30 às 22:30: Compra (F06)

- [x] Botão Comprar nos jogadores livres: escolher o clube, digitar data e hora (horário de Brasília, enviado com `-03:00`), confirmar.
- [x] Resultado: valor, taxa, custo total (valor + taxa), fim da fidelidade e novo caixa. Recusas mostram o `message`.
- [x] Depois da compra, a tabela mostra o clube do jogador, o filtro por clube o encontra e o filtro só livres deixa de mostrá-lo.
- [ ] Push e atualizar este arquivo marcando o que ficou pronto. _(Arquivo atualizado; falta confirmar o push da Compra.)_

---

## Terça 20/10

### 9:00 às 10:00: Venda (F08)

- [ ] Botão Vender na página do clube, com confirmação. Resultado: valor de compra, valor de venda, dias restantes, multa, lucro, comissão, crédito e novo caixa. Recusa mostra o `message`.

### 10:00 às 12:00: Histórico, totais e CSV (F09 a F11)

- [ ] Tabela: data e hora, tipo, jogador, valor, taxa ou comissão, multa, lucro e variação do caixa com sinal (+ e −).
- [ ] Filtro por um ou mais tipos e por jogador. Se a API recusar (jogador excluído), mostrar o `message`.
- [ ] Totais do `summary` abaixo da tabela, respeitando o filtro.
- [ ] Botão **Exportar CSV**: baixa o arquivo de `GET /clubs/{id}/transactions/export` com os filtros aplicados.
- [ ] Push.

### 13:30 às 16:30: Liga (F12 a F14)

- [ ] **Escalação (F12):** na página do clube, escolher a formação (`3-1`, `2-2`, `2-1-1`, `1-2-1`) e um titular para cada vaga (1 goleiro e os de linha de cada setor), entre os do elenco, sem `DOENTE`. Salvar e mostrar a escalação devolvida. Com escalação incompleta, avisar que o clube não pode jogar.
- [ ] **Partida (F13):** escolher mandante e visitante e jogar (clique duplo gera uma só partida). Mostrar placar e os **6 duelos** devolvidos pela API (atacante, defensor, atributos, valores e gol). Clube sem escalação: `message` da API.
- [ ] **Histórico de partidas e classificação (F14):** partidas da mais recente para a mais antiga, com filtro por clube e os duelos ao abrir; classificação na ordem da API com J, V, E, D, GP, GC, SG e pontos.
- [ ] Push.

### 16:30 às 18:00: Estados das 6 listas

- [ ] Carregando, vazia e erro nas 6 telas de lista: jogadores, clubes, elenco do clube, histórico de transações, histórico de partidas e classificação. Teste com rede desacelerada, banco recém-recriado e backend parado.

### 19:00 às 21:00: Diferenciais baratos

- [ ] Swagger no backend (todos os endpoints das tabelas de "2. Endpoints" do `README.md`).
- [ ] Lint e verificação de formatação (que só verifica, sem alterar arquivos) no backend e no frontend.
- [ ] Comando de testes do backend que termina sozinho, sem modo de observação.
- [ ] Cada um com o comando anotado para o README.

---

## Quarta 21/10 (entrega)

### 9:00 às 11:00: Verificação final

- [ ] **F3, mensagens:** as 9 ações (cadastrar, editar e alterar condição do jogador; excluir; criar clube; comprar; vender; escalar; jogar partida) mostram sucesso e, na recusa, o `message`. Clique duplo envia um só pedido.
- [ ] **F3, apresentação:** valores com 2 casas e vírgula e datas em horário de Brasília nas 6 telas (lista de jogadores, clubes, página do clube com histórico, resultado da compra, resultado da venda, histórico de partidas).
- [ ] **F2:** nenhum `fetch` em componente; nenhuma regra recalculada; os 7 formulários validam antes de enviar (cadastro e edição de jogador, condição, clube, compra, escalação, partida); sem código comentado, sem arquivo sem uso, nomes no padrão.
- [ ] **Git:** pelo menos 10 commits em `frontend/` e em `backend/`, com push em pelo menos 3 dias diferentes; nenhuma mensagem genérica ("fix", "ajustes", "wip"); `package-lock.json` versionado; `.env.example` nos dois; nenhuma credencial real.

### 11:00 às 12:30: README da raiz completo

- [ ] Pré-requisitos com versões.
- [ ] Criar e recriar o banco do zero.
- [ ] Instalar e executar backend e frontend, com **origem da API** (sem `/api/v1`) e **URL do frontend**.
- [ ] Variáveis de ambiente (incluindo `CORS_ORIGIN`).
- [ ] Estrutura de pastas e bibliotecas com o motivo de cada uma.
- [ ] Decisões e premissas.
- [ ] Funcionalidades não implementadas (ou "Nenhuma").
- [ ] **Uso de inteligência artificial:** ferramentas, onde, como e por quê, o que foi aceito, alterado ou descartado (ou "Não utilizei").
- [ ] Comandos dos diferenciais (Swagger, lint, testes).

### 12:30 às 14:30: Ensaio do zero e envio

- [ ] Clonar o repositório numa pasta limpa e seguir o README ao pé da letra. Tudo no ar em menos de 30 minutos.
- [ ] Rodar o roteiro do backend (B01 a B22) e o da interface (F01 a F14) no banco recém-recriado.
- [ ] Último push. Copiar o **hash completo de 40 caracteres**.
- [ ] Deixar o repositório **público**.
- [ ] **E-mail**, do endereço em que você recebe as comunicações do RH:
  - Para: `igor.conde@sistemafiepe.org.br`; Cc: `rachel.santos@sistemafiepe.org.br`
  - Assunto: `SENAI/PE – CÓD. 237 DESENVOLVEDOR I (FULLSTACK)`
  - Corpo: nome completo, link do repositório e hash do commit final. **Sem anexos.**

### Plano B

Entrega parcial pontua item a item. O que não ficou pronto entra em "Funcionalidades não implementadas". Enviar completo no que existe vale mais do que atrasar. Se a quarta não fechar, use a quinta até as 15h; a sexta é só emergência (limite 20h).
