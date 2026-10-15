# Plano de hoje: Quarta 14/10/2026

> Contexto: leia primeiro `plano-geral.md`. Meta de hoje: **banco, base da API e módulo de Jogadores prontos e commitados**. Se sobrar tempo, comece Clubes.

## Bloco 1: Setup (~1h)

- [x] Criar o repositório Git local (e remoto no GitHub, privado por enquanto) com a raiz contendo `backend/`, `frontend/` e `README.md`.
- [x] Criar `.gitignore` (node_modules, .env, dist).
- [x] Gerar o projeto NestJS dentro de `backend/` (Node 22, TypeScript).
- [x] Criar `docker-compose.yml` na raiz com PostgreSQL 16 (serviço `db`).
- [x] Criar `backend/.env.example` com `DATABASE_URL`, `PORT`, `CORS_ORIGIN` e qualquer outra variável usada.
- [x] **Commit 1 e push** (isso já conta como o primeiro dia de envio).

## Bloco 2: Banco de dados (~1,5h)

Seguir "3. Estrutura de tabelas" do `README.md`, com nomes em português, sem acento, snake_case.

- [x] `jogadores`: id, nome, posicao, agilidade, idade, valor_base DECIMAL(6,2), condicao, clube_id (nulo = livre), velocidade, finalizacao, passe, drible, defesa, fisico, potencial, excluido_em, criado_em, atualizado_em.
- [x] `clubes`: id, nome, sigla (UNIQUE), caixa DECIMAL(10,2) default 300.00, formacao (nula), criado_em. **Nome único normalizado** no banco (coluna `nome_normalizado` com índice único: espaços normalizados, minúsculas, acentos mantidos).
- [x] `contratos`: id, jogador_id, clube_id, valor_compra, fidelidade_ate, situacao (ATIVO, ENCERRADO, RESCINDIDO), iniciado_em, encerrado_em.
- [x] `transacoes`: id, clube_id, jogador_id, nome_jogador, tipo, valor, taxa, multa, lucro (nulo na compra), variacao_caixa, criado_em.
- [x] `escalacoes`: PK composta (clube_id, jogador_id), `jogador_id` UNIQUE, criado_em.
- [x] `partidas`: id, mandante_id, visitante_id, gols_mandante, gols_visitante, formacao_mandante, formacao_visitante, jogada_em.
- [x] `duelos_partida`: id, partida_id, ordem, clube_atacante_id, atacante_id, defensor_id, nome_atacante, nome_defensor, posicao_atacante, posicao_defensor, condicao_atacante, condicao_defensor, atributo_ataque, atributo_defesa, valor_ataque, valor_defesa, gol.
- [x] **Não criar** coluna de valor de mercado, overall, patrimônio, valor do elenco, dias restantes, % de multa, pontos ou posição.
- [ ] Migration versionada. Testar: criar banco, **recriar do zero** (`prisma migrate reset --force`) e anotar os comandos exatos para o README.
- [x] Commit.

## Bloco 3: Base da API (~0,5h)

- [x] Prefixo global `/api/v1`.
- [x] Filtro global de exceções: sempre `{ "message": "..." }` em JSON, sem stack trace. Códigos: 400 (dado inválido), 404 (inexistente), 409 (regra de negócio), 500 (falha inesperada).
- [x] `ValidationPipe` com `whitelist: true` (**sem** `forbidNonWhitelisted`: campos extras são ignorados, regra V7).
- [x] Corpo que não é objeto JSON (array, texto, número) ou JSON inválido: 400 com `message`.
- [x] Pipe para ids na URL: só inteiro positivo, só dígitos, sem zero à esquerda, até 2.147.483.647. Qualquer outra forma: **404**.
- [x] CORS lido de `CORS_ORIGIN` (nunca `*`).
- [x] Logger de requisições (data e hora, método, caminho, status) pelo Logger do NestJS.
- [x] Utilitário de dinheiro: arredondamento "meio para longe do zero" com 2 casas, usando `decimal.js` (ou centavos inteiros). Nunca `float`.
- [x] Commit.

## Bloco 4: Módulo Jogadores (resto do dia)

### 4.1 Regras puras (um único arquivo, com testes)

Ler RN02 a RN06 em `README.md` antes de codar.

- [ ] `calcularOverall(posicao, atributos)`: pesos por posição, soma dos produtos ÷ 100, arredondamento para inteiro com meio para cima.
- [ ] `calcularValorBase(overall, potencial, idadeNoCadastro)`: faixas 0,50 (41 a 60), 2,00 (61 a 75), 6,00 (76 a 99); jovem promessa (<= 21 anos) multiplica a parte do overall por (100 + potencial − overall) ÷ 100; arredonda uma vez; piso 1,00.
- [ ] `calcularValorMercado(valorBase, condicao, agilidade, idade)`: desconto por condição (0, 15, 30), efeito da agilidade só se não APTO (80 a 100 metade; 1 a 30 soma 10 pontos), ajuste por idade (+10, 0, −10), teto de desconto −40%, arredonda, piso 1,00.
- [ ] Testes unitários com **todas as linhas das tabelas de exemplo** do `README.md` (RN05 e RN06). Esse arquivo de teste também vale como diferencial.

### 4.2 Endpoints (um commit por endpoint)

- [ ] `POST /players` (201, `Location`, nasce APTO e livre). Validações: V1 a V9 e "Limites de cada campo" (nome 3 a 100 caracteres com 2+ palavras e sem dígitos, idade 16 a 45, agilidade 1 a 100 com teto 85 se idade >= 35, atributos 1 a 99 com soma <= 480, potencial >= maior atributo e igual a ele se idade >= 33). Campos calculados ou controlados (`base_value`, `overall`, `market_value`, `club_id`, `condition`, `id`) enviados no corpo são ignorados.
- [ ] `GET /players/{id}`: devolve `market_value` e `overall` calculados na hora. Excluído conta como 404.
- [ ] `PATCH /players/{id}/condition`: 400 se ausente ou fora da lista, 409 de DOENTE direto para APTO, mesma condição devolve 200. (O efeito na escalação entra no dia 16.)
- [ ] `PUT /players/{id}`: exige nome, posição, agilidade e idade. 409 se jogador com clube muda de posição ou se a idade diminui. Indicadores, potencial e valor base não mudam.
- [ ] `DELETE /players/{id}`: 204 sem corpo, só jogador livre (409 se tem clube), exclusão lógica (`excluido_em`).
- [ ] `GET /players`: filtros `search`, `position`, `condition`, `free`, `club_id`, `min_age`, `max_age`, `min_value`, `max_value`, `sort` (até 2 critérios), `page`, `limit`. Retorna `{ data, meta }`.
  - Estratégia: buscar do banco com os filtros que não dependem do valor de mercado, calcular `market_value` em código e aplicar filtro de valor, ordenação e paginação em memória (mantém a fórmula em um só lugar).
  - Busca ignora maiúsculas, minúsculas e acentos. Ordem de posições: GOL, ZAG, LAT, MEI, ATA. Desempate sempre por nome, depois id.
  - Valores inválidos, vazios, repetidos ou contraditórios: 400. `free=true` com `club_id`: 400.

## Se sobrar tempo: Clubes

- [ ] `POST /clubs` (caixa 300,00, validação de nome e sigla, 409 em nome ou sigla repetidos, 409 no 21º clube).
- [ ] `GET /clubs` e `GET /clubs/{id}`.

## Fechamento do dia (últimos 20 minutos)

- [ ] Push de tudo.
- [ ] Rodar uma lista rápida de chamadas (curl ou arquivo `.http`) cobrindo os exemplos 2.1.x do `README.md`.
- [ ] Anotar qualquer dúvida de regra para mandar ao SENAI **até amanhã 23h59**.
- [ ] Atualizar este arquivo marcando o que foi feito, para a conversa de amanhã começar daí.

## Checklist de qualidade (vale para todo o código de hoje)

- Controller só recebe e responde; regra de negócio no serviço; acesso ao banco na camada de dados.
- Validação declarativa (DTO/schema) em todos os endpoints.
- Nenhum código comentado, nenhum arquivo sem uso, nomes no padrão da linguagem (camelCase em funções e variáveis, PascalCase em classes). Nomes de campos da API em snake_case.
- Mensagens de commit descritivas (exemplo: `feat(players): cadastro com valor base e overall`).
