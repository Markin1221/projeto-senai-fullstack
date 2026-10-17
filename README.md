# Passe: estudo de caso SENAI/PE (Desenvolvedor Fullstack I)

Mercado de jogadores de uma liga de futebol fictícia: cadastro de jogadores e clubes, compra e venda com contrato de fidelidade, histórico de transações com exportação em CSV e, na próxima etapa, escalação, partidas e classificação.

Repositório com `backend/` (NestJS, Prisma e PostgreSQL) e `frontend/` (React, ainda não iniciado).

## 1. Pré-requisitos

| Ferramenta              | Versão                                                |
| ----------------------- | ----------------------------------------------------- |
| Node.js (com npm)       | 22 LTS                                                |
| Docker e Docker Compose | Docker 29 (testado), Compose v2                       |
| PostgreSQL              | 16 (imagem `postgres:16`, subida pelo Docker Compose) |

Versões das principais dependências: NestJS 12, Prisma 6, TypeScript 6 e Jest 30. Os arquivos de trava (`backend/package-lock.json`) estão versionados.

## 2. Banco de dados

Os comandos abaixo partem da raiz do repositório.

**Subir o banco** (cria o banco `passe`, vazio):

```
docker compose up -d db
```

**Aplicar as migrations** (na pasta `backend`):

```
cd backend
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate deploy
```

**Recriar o banco do zero** (apaga tudo e reaplica as migrations; na pasta `backend`):

```
npx prisma migrate reset --force
```

O banco criado por esses passos começa vazio, sem jogadores, clubes, transações nem partidas. Não há carga de dados de exemplo.

## 3. Instalar e executar

**Backend** (na pasta `backend`, depois dos passos da seção 2):

```
npm run start:dev
```

A API fica em `http://localhost:3000` (origem informada para a banca; as rotas ficam sob `/api/v1`). Para rodar compilado:

```
npm run build
npm run start:prod
```

**Frontend:** ainda não iniciado.

**Testes unitários** (na pasta `backend`):

```
npm test
```

**Chamadas de exemplo:** os arquivos `backend/requests/jogadores.http` e `backend/requests/fluxo-mercado.http` reproduzem os exemplos do enunciado (cadastro, compra, venda, histórico e CSV). Abra no VS Code com a extensão REST Client e clique em "Send Request", na ordem.

## 4. Variáveis de ambiente

Arquivo `backend/.env.example` (copie para `backend/.env`):

| Variável       | Para que serve                                                                     | Exemplo                                                           |
| -------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | Conexão do Prisma com o PostgreSQL                                                 | `postgresql://passe:passe_dev@localhost:5432/passe?schema=public` |
| `PORT`         | Porta da API                                                                       | `3000`                                                            |
| `CORS_ORIGIN`  | Origem do frontend aceita pelo CORS (lista separada por vírgula; `*` não é aceito) | `http://localhost:3001`                                           |

A senha `passe_dev` é só do banco local do Docker Compose, usado em desenvolvimento.

## 5. Estrutura de pastas e bibliotecas

```
docker-compose.yml          PostgreSQL 16 (serviço db)
backend/
  prisma/                   schema.prisma e migrations versionadas
  requests/                 arquivos .http com chamadas de exemplo
  src/
    common/                 filtro de exceções, guard do corpo, pipe de id, logger,
                            validadores, utilitários de texto, datas e dinheiro
    prisma/                 PrismaService (módulo global)
    regras/                 regras de negócio puras, sem banco, com testes
    jogadores/              cadastro, consulta, edição, condição, exclusão e listagem
    clubes/                 criação, listagem e consulta com elenco e contratos
    mercado/                compra e venda
    historico/              histórico de transações e exportação CSV
frontend/                   a iniciar
```

| Biblioteca                              | Motivo                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| NestJS (`@nestjs/*`) e Express          | Framework da API REST                                                          |
| Prisma (`prisma`, `@prisma/client`)     | ORM, migrations versionadas e acesso ao PostgreSQL                             |
| `class-validator` e `class-transformer` | Validação declarativa dos DTOs (corpo e query params)                          |
| `decimal.js`                            | Cálculos de dinheiro sem `float`, com arredondamento "meio para longe do zero" |
| `dotenv`                                | Leitura do `.env`                                                              |
| `reflect-metadata` e `rxjs`             | Exigidas pelo NestJS                                                           |
| Jest e `ts-jest`                        | Testes unitários das regras de negócio                                         |
| `oxlint` e Prettier                     | Lint e formatação do código                                                    |

## 6. Funcionalidades

| Funcionalidade                                                                  | Situação |
| ------------------------------------------------------------------------------- | -------- |
| Jogadores: `POST`, `GET` (lista e por id), `PUT`, `PATCH /condition` e `DELETE` | Pronto   |
| Valor base, overall e valor de mercado (RN02 a RN06), com testes                | Pronto   |
| Clubes: `POST`, `GET` (lista e por id)                                          | Pronto   |
| Compra (`POST /players/{id}/buy`) e venda (`POST /players/{id}/sell`)           | Pronto   |
| Histórico de transações e exportação CSV                                        | Pronto   |
| Escalação (`PUT` e `GET /clubs/{id}/lineup`)                                    | A fazer  |
| Partidas, histórico de partidas e classificação                                 | A fazer  |
| Frontend                                                                        | A fazer  |

## 7. Decisões e premissas

- **Listagem de jogadores:** o banco aplica só os filtros que não dependem do valor de mercado. O valor de mercado é calculado em código e a faixa de valor, a busca, a ordenação e a paginação são feitas em memória. Assim a fórmula existe em um único lugar.
- **Nome único do clube:** a coluna `nome` guarda o nome como foi digitado; a coluna `nome_normalizado` (espaços normalizados e minúsculas, acentos mantidos) tem índice único e garante a RN10 no banco.
- **Recompra:** o clube que já vendeu o jogador é detectado por um contrato anterior dele com o mesmo clube que não esteja `ATIVO`.
- **Compra e venda atômicas:** cada operação roda numa transação do banco. A compra usa travas condicionais (`clube_id` do jogador ainda nulo e caixa maior ou igual ao dobro do custo), que protegem contra compras simultâneas e fazem cumprir o limite de 50% do caixa no próprio banco.
- **Dinheiro:** `DECIMAL` no banco, `decimal.js` no código, arredondamento uma única vez, no resultado final de cada cálculo. As respostas trazem números JSON.
- **Ordem das validações:** corpo ou parâmetro inválido (400), depois recurso inexistente (404), depois regra de negócio (409). Ids inválidos na URL (como `abc`, `0` ou `01`) respondem 404.
- **Venda:** não tem corpo; se um corpo for enviado, é ignorado. O contrato vira `RESCINDIDO` quando há multa (dias restantes maiores que zero) e `ENCERRADO` quando a fidelidade já foi cumprida.
- **Condição física:** enviar a condição atual no `PATCH` responde 200. O jogador que passa a `DOENTE` sai da escalação na mesma transação.
- **Textos:** "caractere" conta pontos de código Unicode; "palavra" é uma sequência sem espaços com pelo menos uma letra. As mensagens de erro são em português.
- **Datas:** a API só aceita `AAAA-MM-DDTHH:MM-03:00` e devolve `AAAA-MM-DDTHH:MM:SS-03:00`. O instante é calculado em UTC e exibido no horário de Brasília.
- **Teste de exemplo do Nest:** o `app.controller.spec.ts` foi removido, porque `@nestjs/testing` é ESM e não carrega no Jest configurado em CommonJS.

## 8. Funcionalidades não implementadas

Escalação, partidas, histórico de partidas, classificação e o frontend estão em andamento. Atualizar esta seção antes da entrega.

## 9. Uso de inteligência artificial

- **Ferramenta:** Claude (Anthropic), usado como consultor e apoio durante o desenvolvimento.
- **Onde:** regras de negócio e seus testes (`backend/src/regras/`), utilitários e validadores (`backend/src/common/`), infraestrutura do Prisma (`backend/src/prisma/`), partes dos módulos `jogadores`, `clubes`, `mercado` e `historico`, arquivos `.http` de exemplo e este README.
- **Como e por quê:** para guiar a ordem das tarefas, explicar as regras do enunciado, revisar erros de migration e de tipos e gerar código de partes repetitivas ou com muitas regras de validação, ganhando tempo.
- **O que foi aceito, alterado ou descartado:** maior parte dos arquivos, como tem um tempo pequeno pra fazer o desafio eu poderia fazer tudo na mão mas boa parte dos arquivos grandes eu peço pro claude gerar, leio ele pra ver se a logica ta certa e aceito, alguns faço na mao principalmente quando acaba, mas leve do presuposto que a maioria tem a ia me auxiliando mais como um estagiario ao lado.\_
