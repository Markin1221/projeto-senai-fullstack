# Plano de hoje: Quinta 15/10/2026

> Contexto: leia primeiro `claude/plano-geral.md` e depois este arquivo. As regras completas estão no `README.md` (RN01 a RN21). O dia 14 terminou com setup, schema, base da API e a **migration ainda sem teste de reset**. O módulo de Jogadores e o de Clubes ainda não começaram.
>
> **Meta de hoje:** Jogadores, Clubes, Compra e Venda funcionando e commitados. Histórico e CSV entram se der; se não der, viram a primeira tarefa de sexta de manhã.
>
> **Prazo de dúvidas ao SENAI: hoje, 23h59.** Revise suas dúvidas até as 20h (ver o fim deste arquivo).

## Ordem e corte

Trabalhe nesta ordem. Se atrasar, corte pelo fim, nunca pelo meio.

1. Pendência do dia 14 (migration)
2. Jogadores (regras puras, testes e endpoints)
3. Clubes
4. Compra e venda
5. Histórico de transações
6. Exportação CSV

Linha de corte: **1 a 4 precisam estar prontos hoje.** Histórico e CSV podem escorregar para sexta de manhã. Sexta ainda tem Escalação e Partidas, que são pesadas, então não gaste mais tempo do que o previsto em nenhum bloco.

---

## Bloco 0: Pendência do dia 14 (~20 min)

- [x] Rodar `prisma migrate reset --force` e confirmar que o banco recria do zero e vazio.
- [x] Anotar os comandos exatos (subir banco, aplicar migrations, recriar do zero) para o `README.md` da raiz.
- [x] Commit da migration.

## Bloco 1: Jogadores (manhã, ~3h)

Tudo o que estava no `claude/plano-hoje.md` (dia 14) nos itens 4.1 e 4.2 continua valendo. Resumo da ordem:

### 1.1 Regras puras, com testes (~1h)

- [x] Um arquivo único de regras: `calcularOverall`, `calcularValorBase`, `calcularValorMercado`.
- [x] Testes unitários com as tabelas do `README.md`: overall (5 linhas), valor base (9 linhas), valor de mercado (10 linhas). Rode e veja passar antes de continuar.

### 1.2 Endpoints (~2h, um commit por endpoint)

- [ ] `POST /players` (201 + `Location`), com validações V1 a V9 e limites de cada campo
- [ ] `GET /players/{id}`
- [ ] `PATCH /players/{id}/condition`
  - **Adicione agora** a regra RN19.5: se o jogador passa a `DOENTE`, remover a linha dele em `escalacoes`, na mesma transação. A tabela já existe, então é uma linha de código.
- [ ] `PUT /players/{id}`
- [ ] `DELETE /players/{id}` (204, só livre, exclusão lógica)
- [ ] `GET /players` com filtros, ordenação e paginação (estratégia em memória, descrita no dia 14)

## Bloco 2: Clubes (início da tarde, ~1,5h)

- [ ] `POST /clubs` (201 + `Location`; `cash` 300,00, `squad_value` 0,00, `net_worth` 300,00)
  - Nome: 3 a 60 caracteres depois da V4, de 2 a 5 palavras, só letras (com ou sem acento), espaços, hífen e ponto.
  - Sigla: 3 letras de A a Z maiúsculas, que aparecem no nome **na ordem** (sem diferenciar maiúsculas e acentos), a primeira sendo a primeira letra do nome; as três não podem ser todas iguais. Fora do formato ou que não bate com o nome: 400.
  - 409 para nome repetido (normalizado: V4 + minúsculas, **acentos contam**), sigla repetida e o 21º clube.
  - Garantir a unicidade do nome **no banco** também (índice único em `nome_normalizado`).
- [ ] `GET /clubs` com `sort=name` (padrão), `net_worth_asc` e `net_worth_desc`. Valor inválido: 400. Empate: nome, depois id.
- [ ] `GET /clubs/{id}`: elenco ordenado (GOL, ZAG, LAT, MEI, ATA, depois nome, depois id), cada jogador com `contract` (`purchase_value`, `loyalty_until`, `remaining_days`, `penalty_rate`), mais `squad_value` e `net_worth` calculados na hora.
- [ ] **Já crie as funções compartilhadas** (usadas também na venda, para não duplicar):
  - `diasRestantes(fidelidadeAte, agora)`: dias com fração, arredondado para cima, mínimo 0.
  - `percentualMulta(diasRestantes)`: 0 dia = 0%, 1 a 30 = 5%, 31 a 180 = 10%, 181 ou mais = 20%.
- [ ] Testes unitários dessas duas funções com a tabela da RN15 (já passou, 10d2h → 11, exatamente 30 dias, 30 dias e 1 minuto → 31, 180 dias, 180 dias e 1 minuto → 181, 200 dias).

## Bloco 3: Compra e venda (tarde e início da noite, ~3h)

### 3.0 Utilitário de datas (~20 min)

- [ ] Parse estrito de `AAAA-MM-DDTHH:MM-03:00` (regex + validar que a data existe, sem ajuste: `2027-02-30` e `T24:00` são 400).
- [ ] Formatação das respostas em `AAAA-MM-DDTHH:MM:SS-03:00`.
- [ ] Testes: formato sem `-03:00`, data inexistente, hora 24:00.

### 3.1 `POST /players/{id}/buy` (200)

- Corpo: `club_id` (inteiro positivo; 0 ou negativo é 400; inexistente é 404) e `loyalty_until`.
- `loyalty_until`: depois do momento da compra e até **1.095 dias** depois; fora disso, 400.
- Regras (409): jogador não livre; custo total > 50% do caixa (comparar **sem arredondar**: com caixa 261,15 o limite é 130,575, e 130,58 é recusado; igual ao limite é aceito); elenco com 12 jogadores; recompra (o próprio clube já vendeu esse jogador).
- Cálculo: valor = valor de mercado do momento; taxa = 5% do valor, arredondada, **só se valor > 30,00**; custo = valor + taxa.
- Tudo numa **transação de banco**: debitar caixa, `clube_id` do jogador, criar contrato `ATIVO` (`valor_compra` = valor sem taxa), gravar transação `COMPRA` (`variacao_caixa` = −custo, `lucro` nulo, `multa` 0,00).
- Proteja contra duas compras simultâneas (por exemplo, `UPDATE ... WHERE clube_id IS NULL` e checar o número de linhas, ou trava na linha do clube).
- Resposta no formato do exemplo 2.3.1 (`contract` e `club_cash` incluídos).
- [ ] Testes unitários: taxa (28,00 → 0,00; 30,00 → 0,00; 30,01 → 1,50), limite de 50% (100,00 / 47,62 aceita; 48,00 recusa).

### 3.2 `POST /players/{id}/sell` (200, sem corpo)

- 404 para jogador inexistente ou excluído; 409 para jogador livre.
- Venda sempre pelo **clube atual** do jogador.
- Cálculo, nesta ordem: valor de venda (valor de mercado agora) → dias restantes (função do Bloco 2) → multa (percentual × valor, arredondada, **teto 10,00**) → lucro (valor − `valor_compra` do contrato ATIVO) → comissão progressiva só se lucro > 0 (10% até 10,00 + 20% acima de 10,00, arredondada **uma vez no final**) → crédito = valor − multa − comissão.
- Contrato: `RESCINDIDO` se houve multa, `ENCERRADO` se não houve; preencher `encerrado_em`.
- Mesma transação: creditar caixa, `clube_id` do jogador = nulo, remover o jogador de `escalacoes` (RN19.5), gravar transação `VENDA` (`fee` = comissão, `penalty` = multa, `profit` = lucro com sinal, `cash_change` = crédito).
- Resposta no formato do exemplo 2.3.2.
- [ ] Testes unitários com as duas tabelas da RN16 (comissão: 3,00 → 0,30; 3,85 → 0,39; 10,00 → 1,00; 10,01 → 1,00; 15,00 → 2,00; −7,50 → 0,00; e as 5 linhas valor de compra × venda, incluindo a de multa limitada a 10,00).

### 3.3 Teste de fluxo (curl ou arquivo `.http`)

- [ ] Reproduzir o fluxo do `README.md` (2.1.3 a 2.3.2): cadastrar Meia Lua, mudar condição, criar Águias FC, comprar, consultar o clube, voltar a APTO, vender.
- [ ] Confirmar o invariante: **300,00 + soma de `variacao_caixa` = caixa atual**.
- [ ] Confirmar que recusas (409, 404, 400) não gravam nada.

## Bloco 4: Histórico e CSV (noite, ~1,5h; pode escorregar para sexta)

- [ ] `GET /clubs/{id}/transactions`: resposta `{ data, summary }`. Ordem: mais recente primeiro, empate por id decrescente.
  - Filtro `type`: um ou mais de `COMPRA` e `VENDA` separados por vírgula, sem espaços e sem repetir; maiúsculas exatas (`COMPRA,venda` é 400).
  - Filtro `player_id`: jogador inexistente ou excluído é 404; jogador sem transações no clube devolve 200 com `data` vazio e `summary` zerado.
  - `summary` calculado sobre as transações já filtradas: `total_spent` (valor + taxa das COMPRA), `total_received` (`cash_change` das VENDA), `total_fees` (todas as taxas e comissões), `total_penalties`, `total_profit` (com sinal).
- [ ] `GET /clubs/{id}/transactions/export`: mesmos filtros e validações.
  - Cabeçalho: `data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa`.
  - Separador `;`, vírgula decimal, 2 casas, negativo com `-`, `lucro` vazio quando nulo.
  - Nome com `;` ou aspas vai entre aspas duplas, com aspas internas duplicadas.
  - UTF-8 **sem BOM**, cada linha termina em `\n`, inclusive a última. `Content-Type: text/csv`.
  - Sem transações: só a linha de cabeçalho. Erros continuam em JSON.
- [ ] Teste do CSV com o exemplo do `README.md` (2.3.4) e com um nome contendo aspas.

## Fechamento do dia

- [ ] Push de tudo (hoje é o 2º dia de envio).
- [ ] Rodar o fluxo `.http` completo uma última vez do zero (reset do banco incluso).
- [ ] **Dúvidas ao SENAI até as 20h:** releia o enunciado com calma olhando só os casos-limite que você teve que decidir hoje. O que for realmente ambíguo, abra como issue pública ou e-mail (ver seção "Dúvidas" do `README.md`). O que for só detalhe de implementação, decida e registre em "Decisões e premissas" no `README.md` da raiz. Prazo final: **23h59**.
- [ ] Atualizar este arquivo marcando o que foi feito, para a conversa de amanhã (Escalação e Partidas) começar daí.

## Checklist de qualidade (vale para o código de hoje)

- Cada cálculo (taxa, multa, dias restantes, comissão, valor de mercado) existe em **um único lugar** e é importado onde precisar.
- Controller só recebe e responde; regra no serviço; banco na camada de dados.
- Toda recusa: JSON com `message`, nada gravado, sem stack trace.
- Nenhum `float` com dinheiro; arredondamento "meio para longe do zero" uma só vez, no resultado final.
- Commits pequenos e descritivos (exemplo: `feat(market): venda com multa e comissão progressiva`).
