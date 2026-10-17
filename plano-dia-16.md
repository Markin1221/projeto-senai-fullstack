# Plano de hoje: Sexta 16/10/2026

> Contexto: leia primeiro `claude/plano-geral.md` e depois este arquivo. Regras completas no `README.md` (RN19 a RN21 são as de hoje). O `claude/plano-dia-15.md` não tinha nada marcado como feito quando este plano foi escrito, então o **Bloco 0 confere o estado real** antes de qualquer coisa.
>
> **Meta de hoje:** backend **fechado**: Escalação, Partidas e Classificação prontas, e o roteiro B01 a B22 do `barema.md` passado de ponta a ponta. À noite, começar o `frontend/` (só o esqueleto), porque o frontend precisa de commits em dias diferentes.

## Bloco 0: Conferir o estado e ler a errata (~30 min)

- [x] **Errata do SENAI:** as respostas às dúvidas saem **hoje** (até sexta 16/10). Olhe o e-mail e a lista de issues em github.com/isi-tics/desafio-isi-dev-1/issues. A errata prevalece sobre o enunciado: se mudar alguma regra, anote aqui e ajuste o código.
- [x] Marcar no `claude/plano-dia-15.md` o que de fato ficou pronto. Rodar o fluxo `.http` (cadastrar jogador, criar clube, comprar, vender) contra o banco recriado do zero.
- [x] Se algo do dia 15 ficou pendente, a **ordem de prioridade** hoje é: (1) Compra e venda, (2) Histórico, (3) CSV, e só depois o Bloco 1 abaixo. Escalação e Partidas não funcionam sem Compra e Venda.
- [x] Confirmar que a venda e a mudança para `DOENTE` já removem o jogador de `escalacoes`. Se não, fazer agora (RN19.5).

## Bloco 1: Escalação (~1h15)

### 1.1 Regra pura, com testes (~30 min)

- [x] Função `posicoesFecham(formacao, posicoes[5])`: exatamente 1 GOL e, entre os 4 de linha, a quantidade de cada setor da formação (defesa = ZAG ou LAT, meio = MEI, ataque = ATA):

| `formation` | Defesa (ZAG/LAT) | Meio (MEI) | Ataque (ATA) |
| ----------- | ---------------- | ---------- | ------------ |
| `3-1`       | 3                | 0          | 1            |
| `2-2`       | 2                | 0          | 2            |
| `2-1-1`     | 2                | 1          | 1            |
| `1-2-1`     | 1                | 2          | 1            |

- [x] Testes: uma escalação válida por formação, e casos inválidos (2 goleiros, sem goleiro, 3 ATA no `2-2`, 2 MEI no `2-1-1`).

### 1.2 Endpoints

- [ ] `PUT /clubs/{id}/lineup` (200): corpo `formation` e `player_ids`.
  - **400:** `formation` ausente ou fora da lista; `player_ids` ausente, que não é lista, com tamanho diferente de 5, repetidos ou não inteiros positivos.
  - **404:** clube da URL ou algum jogador inexistente (inclusive excluído).
  - **409:** jogador fora do elenco do clube; jogador `DOENTE`; posições que não fecham a formação. `MAL_CONDICIONADO` pode ser escalado.
  - **Substitui a escalação inteira**, numa única transação (apaga as linhas antigas do clube em `escalacoes`, insere as 5 novas e atualiza `clubes.formacao`). Recusa não grava nada. Escalar não muda o caixa.
- [ ] `GET /clubs/{id}/lineup`: `club_id`, `formation`, `complete`, `players` **na ordem do elenco** (GOL, ZAG, LAT, MEI, ATA, nome, id), cada um com os campos de `GET /players/{id}`.
  - Clube sem escalação: `formation: null`, `players: []`, `complete: false`.
  - Escalação incompleta (titular vendido ou doente): `formation` continua a salva, `players` traz os que sobraram, `complete: false`.
- [ ] Testes de integração (ou fluxo `.http`): escalar, vender um titular, conferir `complete: false`; escalar jogador DOENTE (409); deixar um titular DOENTE por `PATCH` e conferir que ele sai.

## Bloco 2: Partida (~2h)

### 2.1 Função pura da simulação, com testes (~1h)

Uma função que recebe os 5 titulares de cada lado (já na ordem do elenco, com atributos e condição) e devolve placar, `result` e os 6 duelos. **Nada de banco aqui.**

- [ ] Em cada time: goleiro e depois os 4 jogadores de linha numerados de 1 (o mais recuado) a 4 (o mais avançado), na ordem do elenco.
- [ ] Condição: `MAL_CONDICIONADO` joga com cada atributo × 0,85, arredondado para o inteiro mais próximo com o meio para cima (74 → 63; 66 → 56; 50 → 43). `APTO` usa o valor do cadastro. Os atributos do jogador não mudam no banco.
- [ ] Os 6 duelos (o `order` é o número do duelo):

| Duelo | Quem ataca | Atacante            | Defensor (do adversário) |
| ----- | ---------- | ------------------- | ------------------------ |
| 1     | mandante   | 4º jogador de linha | goleiro                  |
| 2     | mandante   | 3º jogador de linha | 1º jogador de linha      |
| 3     | mandante   | 2º jogador de linha | 2º jogador de linha      |
| 4     | visitante  | 4º jogador de linha | goleiro                  |
| 5     | visitante  | 3º jogador de linha | 1º jogador de linha      |
| 6     | visitante  | 2º jogador de linha | 2º jogador de linha      |

- [ ] Atributo do atacante pela posição dele: ATA = `shooting`, MEI = `passing`, ZAG e LAT = `dribbling`. O defensor usa sempre `defending`, inclusive o goleiro. Já com o efeito da condição.
- [ ] Gol quando ataque **maior** que defesa (empate de valores não é gol). Cada time faz de 0 a 3 gols. `result`: `MANDANTE`, `VISITANTE` ou `EMPATE`.
- [ ] **Testes:** o exemplo completo do `README.md` (Águias FC × Delta FC, 1 × 2, `VISITANTE`, com os valores 63 e 56 do LAT mal condicionado) e um exemplo com cada uma das 4 formações.

### 2.2 `POST /matches` (~1h)

- [ ] 201 com `Location: /api/v1/matches/{id}`.
- [ ] **400:** corpo inválido, ids inválidos (0, negativo, não inteiro), `home_club_id` igual a `away_club_id`. **404:** clube inexistente. **409:** qualquer um dos dois sem escalação completa (5 titulares).
- [ ] Gravar numa **única transação**: a partida (`jogada_em` = instante do servidor, placar, `formacao_mandante`, `formacao_visitante`) e os 6 registros em `duelos_partida`, com os **nomes, posições, condições, atributos e valores do momento** (nada é recalculado depois).
- [ ] A partida não muda caixa, escalação nem jogadores. Pode repetir o mesmo confronto sem limite.
- [ ] Resposta no formato do exemplo 2.4.2: `id`, `played_at`, `home` e `away` (`club_id`, `club_name`, `formation`, `goals`), `result` e `duels` (cada um com `order`, `attacking_club_id`, `attacker`, `defender` e `goal`; `attacker` e `defender` com `player_id`, `player_name`, `position`, `condition`, `attribute`, `value`).

## Bloco 3: Histórico de partidas e classificação (~1h)

- [ ] `GET /matches`: array, da mais recente para a mais antiga (mesmo instante: maior id primeiro), **sem** `duels`. Filtro `club_id` (mandante ou visitante): inválido 400, inexistente 404.
- [ ] `GET /matches/{id}`: partida com os 6 duelos na ordem; 404 se não existir.
- [ ] `GET /standings`: **todos** os clubes, inclusive os que nunca jogaram (zerados). Campos: `position`, `club_id`, `club_name`, `played`, `wins`, `draws`, `losses`, `goals_for`, `goals_against`, `goal_difference`, `points`.
  - Ordem: mais pontos, depois maior saldo de gols, depois mais gols marcados, depois nome do clube em ordem alfabética (minúsculas, sem acentos, ordem Unicode; empate final por id). `position` de 1 ao total, sem repetir.
  - Vitória 3, empate 1, derrota 0. Calculada a cada consulta, nunca gravada.
- [ ] **Teste unitário da classificação** com o exemplo do `README.md`: 6 clubes e 4 partidas (Águias 1×2 Delta, Gama 2×1 Épsilon, Épsilon 3×2 Águias, Delta 0×1 Gama), resultado esperado: Gama 6 pts, Épsilon 3 (saldo 0, 4 gols), Delta 3 (saldo 0, 2 gols), Mangue, Tubarões, Águias (saldo −2).

## Bloco 4: Roteiro do barema e README parcial (~1h30)

- [ ] Abrir `barema.md` e percorrer **B01 a B22** como checklist, um por um, no banco recriado do zero. Corrigir o que falhar.
- [ ] Testar os casos de recusa de cada endpoint: o corpo traz `message`, nada foi gravado, sem stack trace, `Content-Type: application/json`.
- [ ] `README.md` da raiz, versão inicial: pré-requisitos com versões, criar e recriar o banco, instalar e executar o backend, variáveis de ambiente (incluindo `CORS_ORIGIN`), estrutura de pastas e lista de bibliotecas. Os trechos "Decisões e premissas", "Funcionalidades não implementadas" e "Uso de inteligência artificial" já ficam com o título e um rascunho.
- [ ] Push. **Hoje é o 3º dia de envio do backend.**

## Bloco 5: Esqueleto do frontend (noite, ~1h30; só se os blocos 0 a 4 terminaram)

O frontend também precisa de commits distribuídos em dias diferentes (confira o critério F4 no `barema.md`). Começar hoje, mesmo com pouco, evita o risco de sábado e domingo serem os únicos dias.

- [ ] Projeto Next.js (App Router) em `frontend/`, Tailwind e shadcn/ui.
- [ ] Next só repassa chamadas ao backend (rewrite/proxy). Nunca acessa o banco nem calcula regra.
- [ ] Camada de cliente da API (um único arquivo), com tratamento de erro que extrai o `message`.
- [ ] Utilitários de formatação: moeda (2 casas e vírgula), data no horário de Brasília, envio de data no formato `AAAA-MM-DDTHH:MM-03:00`.
- [ ] Layout com menu (Jogadores, Clubes, Partidas, Classificação) e componentes base: tabela com estados de carregamento, vazio e erro; campo de formulário com mensagem; toast.
- [ ] `frontend/.env.example` e commit. Push.
- [ ] Atualizar este arquivo marcando o que foi feito, para a conversa de amanhã (Frontend parte 1: Jogadores e Clubes) começar daí.

## Se atrasar

Corte nesta ordem (do primeiro ao último a sacrificar):

1. Bloco 5 inteiro vira sábado de manhã.
2. README parcial vira segunda (19/10).
3. Testes de integração do Bloco 1 viram o fluxo `.http` manual.

**Não corte** a função pura de simulação com os testes do exemplo do `README.md`: é o que protege a regra mais difícil do enunciado.

## Checklist de qualidade (vale para o código de hoje)

- A simulação da partida, a regra de formação e a classificação ficam em funções puras, testáveis sem banco.
- Atributo por posição, 15% de redução e ordem do elenco existem **em um só lugar**.
- Escalação e partida gravam em **transação**: nada pela metade em caso de erro.
- Commits pequenos e descritivos (exemplo: `feat(match): simulação com os 6 duelos e efeito de MAL_CONDICIONADO`).
