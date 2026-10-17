// Uso (API rodando, banco recém-resetado), dentro de backend/:
//   node scripts/roteiro-barema.mjs
const BASE = process.env.API_URL ?? 'http://localhost:3000/api/v1';
let total = 0;
let falhas = 0;

const eq = (a, b) => Math.abs(Number(a) - b) < 0.005;
const fid = (dias) =>
  new Date(Date.now() + dias * 864e5 - 3 * 3600e3).toISOString().slice(0, 16) +
  '-03:00';
const lista = (j) =>
  Array.isArray(j) ? j : (j?.data ?? j?.transactions ?? []);
const get = (o, caminho) => caminho.split('.').reduce((x, k) => x?.[k], o);
const sa = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
const secao = (t) => console.log(`\n=== ${t} ===`);
const POS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'];

const jog = (o = {}) => ({
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
  ...o,
});
const todos = (v) => ({
  pace: v,
  shooting: v,
  passing: v,
  dribbling: v,
  defending: v,
  physical: v,
  potential: Math.min(99, v + 5),
});

async function chamar(metodo, caminho, corpo) {
  const init = { method: metodo, headers: {} };
  if (corpo !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = typeof corpo === 'string' ? corpo : JSON.stringify(corpo);
  }
  const res = await fetch(BASE + caminho, init);
  const texto = await res.text();
  let json;
  try {
    json = JSON.parse(texto);
  } catch {
    json = undefined;
  }
  return { status: res.status, headers: res.headers, texto, json };
}

async function exigir(metodo, caminho, corpo, esperado) {
  const r = await chamar(metodo, caminho, corpo);
  if (r.status !== esperado) {
    throw new Error(
      `Preparação falhou: ${metodo} ${caminho} -> ${r.status} ${r.texto.slice(0, 200)}`,
    );
  }
  return r.json;
}

function registrar(ok, nome, detalhe = '') {
  total++;
  if (!ok) falhas++;
  console.log(
    `${ok ? 'OK   ' : 'FALHA'} ${nome}${detalhe ? ' | ' + detalhe : ''}`,
  );
}

async function teste(nome, metodo, caminho, corpo, esperado, opts = {}) {
  let r;
  try {
    r = await chamar(metodo, caminho, corpo);
  } catch (e) {
    registrar(false, nome, 'sem resposta: ' + e.message);
    return { status: 0 };
  }
  const p = [];
  if (r.status !== esperado)
    p.push(`status ${r.status} (esperado ${esperado})`);
  if (r.status >= 400) {
    const ct = r.headers.get('content-type') ?? '';
    if (typeof r.json?.message !== 'string' || !r.json.message.trim())
      p.push('sem "message" em JSON');
    if (!ct.includes('json')) p.push('Content-Type não é JSON');
    if (r.json?.stack || /\n\s+at /.test(r.texto))
      p.push('stack trace exposto');
  }
  if (opts.verificar && r.json !== undefined) {
    try {
      for (const [d, ok] of opts.verificar(r.json, r))
        if (!ok) p.push('conferir: ' + d);
    } catch (e) {
      p.push('erro ao conferir: ' + e.message);
    }
  }
  const info =
    opts.mostrar && r.json
      ? opts.mostrar
          .map((c) => `${c}=${JSON.stringify(get(r.json, c))}`)
          .join(' ')
      : '';
  const corpoErro = p.length && r.texto ? r.texto.slice(0, 160) : '';
  registrar(
    p.length === 0,
    nome,
    [...p, info, corpoErro].filter(Boolean).join(' | '),
  );
  return r;
}

async function checarCsv(nome, caminho) {
  const res = await fetch(BASE + caminho);
  const buf = new Uint8Array(await res.arrayBuffer());
  const txt = new TextDecoder().decode(buf);
  const p = [];
  if (res.status !== 200) p.push(`status ${res.status}`);
  if (!(res.headers.get('content-type') ?? '').startsWith('text/csv'))
    p.push('Content-Type não é text/csv');
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) p.push('tem BOM');
  if (txt.includes('\r')) p.push('tem CR (precisa só LF)');
  if (
    txt.split('\n')[0] !==
    'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa'
  ) {
    p.push('cabeçalho diferente');
  }
  registrar(
    p.length === 0,
    nome,
    p.join(' | ') || txt.split('\n').slice(0, 2).join(' // '),
  );
}

async function montarTime(clubeId, valor, sufixo) {
  const ids = [];
  for (const pos of POS) {
    const j = await exigir(
      'POST',
      '/players',
      jog({ name: `${pos} ${sufixo}`, position: pos, ...todos(valor) }),
      201,
    );
    await exigir(
      'POST',
      `/players/${j.id}/buy`,
      { club_id: clubeId, loyalty_until: fid(120) },
      200,
    );
    ids.push(j.id);
  }
  return ids; // GOL, ZAG, LAT, MEI, ATA
}

async function main() {
  const vazio = lista((await chamar('GET', '/clubs')).json);
  if (vazio.length > 0) {
    console.log(
      'AVISO: o banco não está vazio. Rode "npx prisma migrate reset --force" e reinicie a API para um resultado limpo.\n',
    );
  }

  // ---------------- SETUP ----------------
  secao('SETUP');
  const pMeia = await teste(
    'cadastro Meia Lua',
    'POST',
    '/players',
    jog(),
    201,
    {
      verificar: (j, r) => [
        ['base_value 40', eq(j.base_value, 40)],
        ['overall 75', j.overall === 75],
        ['condition APTO', j.condition === 'APTO'],
        ['club_id null', j.club_id === null],
        [
          'Location /players/{id}',
          /\/players\/\d+$/.test(r.headers.get('location') ?? ''),
        ],
      ],
    },
  );
  const pVet = await exigir(
    'POST',
    '/players',
    jog({ name: 'Veterano Lua', agility: 10, age: 40, potential: 82 }),
    201,
  );
  const pJovem = await exigir(
    'POST',
    '/players',
    jog({ name: 'Jovem Lua', age: 19 }),
    201,
  );
  const pDoente = await exigir(
    'POST',
    '/players',
    jog({ name: 'Doente Teste', position: 'ZAG', agility: 50, ...todos(70) }),
    201,
  );
  const pDel = await exigir(
    'POST',
    '/players',
    jog({ name: 'Para Excluir', position: 'ATA', ...todos(60) }),
    201,
  );
  const idMeia = pMeia.json.id;
  const cA = await exigir(
    'POST',
    '/clubs',
    { name: 'Atlas FC', acronym: 'ATL' },
    201,
  );
  const cB = await exigir(
    'POST',
    '/clubs',
    { name: 'Vulcão FC', acronym: 'VUL' },
    201,
  );

  // ---------------- B01 ----------------
  secao('B01 validação do cadastro (400)');
  const invalidos = [
    ['corpo array', []],
    ['corpo texto', '"abc"'],
    ['agility texto', jog({ agility: '85' })],
    ['agility decimal', jog({ agility: 85.5 })],
    ['nome só espaços', jog({ name: '     ' })],
    ['nome curto', jog({ name: 'Ab' })],
    ['position minúscula', jog({ position: 'mei' })],
    ['position inválida', jog({ position: 'XXX' })],
    ['sem agility', jog({ agility: undefined })],
    ['agility null', jog({ agility: null })],
    ['chave Agility', { ...jog({ agility: undefined }), Agility: 85 }],
    ['agility 0', jog({ agility: 0 })],
    ['agility 101', jog({ agility: 101 })],
    ['age 15', jog({ age: 15 })],
    ['age 46', jog({ age: 46 })],
    ['pace 0', jog({ pace: 0 })],
    ['pace 100', jog({ pace: 100, potential: 99 })],
    ['potential < maior atributo', jog({ potential: 80 })],
    ['potential 100', jog({ potential: 100 })],
  ];
  for (const [n, c] of invalidos)
    await teste(`B01 ${n}`, 'POST', '/players', c, 400);

  // ---------------- B02 ----------------
  secao('B02 convenções de erro');
  await teste('B02 JSON quebrado', 'POST', '/players', '{ "name": ', 400);
  for (const c of [
    '/players/abc',
    '/players/01',
    '/players/0',
    '/players/-1',
    '/players/999999',
    '/inexistente',
  ]) {
    await teste(`B02 GET ${c}`, 'GET', c, undefined, 404);
  }
  await teste(
    'B02 lista vazia dá 200',
    'GET',
    '/players?search=zzzzzzzz',
    undefined,
    200,
    {
      verificar: (j) => [
        ['data []', Array.isArray(j.data) && j.data.length === 0],
      ],
    },
  );

  // ---------------- B03 ----------------
  secao('B03 campos do sistema ignorados');
  const pExtra = await teste(
    'B03 campos extras ignorados',
    'POST',
    '/players',
    jog({
      name: 'Campos Extras',
      base_value: 999,
      market_value: 999,
      overall: 99,
      condition: 'DOENTE',
      club_id: 1,
      id: 777,
    }),
    201,
    {
      verificar: (j) => [
        ['condition APTO', j.condition === 'APTO'],
        ['club_id null', j.club_id === null],
        ['base_value 40', eq(j.base_value, 40)],
        ['id não é 777', j.id !== 777],
      ],
    },
  );
  const idExtra = pExtra.json.id;
  await teste(
    'B03 PUT ok',
    'PUT',
    `/players/${idExtra}`,
    { name: 'Campos Extras Editado', position: 'ATA', agility: 90, age: 30 },
    200,
  );
  await teste(
    'B03 base_value fixo depois do PUT',
    'GET',
    `/players/${idExtra}`,
    undefined,
    200,
    {
      verificar: (j) => [
        ['base_value 40', eq(j.base_value, 40)],
        ['posição ATA', j.position === 'ATA'],
      ],
    },
  );

  // ---------------- B04 ----------------
  secao('B04 PUT e PATCH');
  await teste(
    'B04 PUT sem position',
    'PUT',
    `/players/${idExtra}`,
    { name: 'Sem Posicao', agility: 90, age: 30 },
    400,
  );
  await teste(
    'B04 PUT idade menor',
    'PUT',
    `/players/${idExtra}`,
    { name: 'Campos Extras Editado', position: 'ATA', agility: 90, age: 29 },
    409,
  );
  await teste(
    'B04 PUT 404',
    'PUT',
    '/players/999999',
    { name: 'Joao Fantasma', position: 'ATA', agility: 90, age: 30 },
    404,
  );
  const idD = pDoente.id;
  await teste('B04 PATCH vazio', 'PATCH', `/players/${idD}/condition`, {}, 400);
  await teste(
    'B04 PATCH null',
    'PATCH',
    `/players/${idD}/condition`,
    { condition: null },
    400,
  );
  await teste(
    'B04 PATCH minúscula',
    'PATCH',
    `/players/${idD}/condition`,
    { condition: 'doente' },
    400,
  );
  await teste(
    'B04 PATCH 404',
    'PATCH',
    '/players/999999/condition',
    { condition: 'APTO' },
    404,
  );
  await teste(
    'B04 vai para DOENTE',
    'PATCH',
    `/players/${idD}/condition`,
    { condition: 'DOENTE' },
    200,
  );
  await teste(
    'B04 DOENTE -> APTO (409)',
    'PATCH',
    `/players/${idD}/condition`,
    { condition: 'APTO' },
    409,
  );
  await teste(
    'B04 DOENTE -> DOENTE',
    'PATCH',
    `/players/${idD}/condition`,
    { condition: 'DOENTE' },
    200,
  );
  await teste(
    'B04 DOENTE -> MAL',
    'PATCH',
    `/players/${idD}/condition`,
    { condition: 'MAL_CONDICIONADO' },
    200,
  );

  // ---------------- B05 / B06 ----------------
  secao('B05 e B06 valores');
  await teste(
    'B05 Meia MAL (agil 85): 37,00',
    'PATCH',
    `/players/${idMeia}/condition`,
    { condition: 'MAL_CONDICIONADO' },
    200,
    {
      verificar: (j) => [['market_value 37', eq(j.market_value, 37)]],
    },
  );
  await teste(
    'B05 Veterano DOENTE (teto -40%): 24,00',
    'PATCH',
    `/players/${pVet.id}/condition`,
    { condition: 'DOENTE' },
    200,
    {
      verificar: (j) => [['market_value 24', eq(j.market_value, 24)]],
    },
  );
  await teste(
    'B05 Jovem APTO: base 44,40 e mercado 48,84',
    'GET',
    `/players/${pJovem.id}`,
    undefined,
    200,
    {
      verificar: (j) => [
        ['base_value 44.40', eq(j.base_value, 44.4)],
        ['market_value 48.84', eq(j.market_value, 48.84)],
      ],
    },
  );
  const ex = [
    ['MEI', [68, 65, 80, 78, 52, 60], 73, 36],
    ['ZAG', [50, 90, 60, 40, 80, 75], 73, 36],
    ['GOL', [55, 30, 65, 40, 72, 68], 68, 26],
  ];
  for (const [pos, a, ov, base] of ex) {
    await teste(
      `B06 overall ${pos} = ${ov}, base ${base}`,
      'POST',
      '/players',
      jog({
        name: `Ex ${pos}`,
        position: pos,
        pace: a[0],
        shooting: a[1],
        passing: a[2],
        dribbling: a[3],
        defending: a[4],
        physical: a[5],
        potential: 90,
      }),
      201,
      {
        verificar: (j) => [
          [`overall ${ov}`, j.overall === ov],
          [`base_value ${base}`, eq(j.base_value, base)],
        ],
      },
    );
  }

  // ---------------- B07 ----------------
  secao('B07 listagem');
  await teste(
    'B07 paginação',
    'GET',
    '/players?page=1&limit=3',
    undefined,
    200,
    {
      verificar: (j) => [
        ['meta.limit 3', j.meta?.limit === 3],
        ['data <= 3', j.data.length <= 3],
        ['total_items numérico', typeof j.meta?.total_items === 'number'],
      ],
    },
  );
  await teste(
    'B07 página além da última',
    'GET',
    '/players?page=999&limit=10',
    undefined,
    200,
    {
      verificar: (j) => [['data []', j.data.length === 0]],
    },
  );
  await teste('B07 busca LUA', 'GET', '/players?search=LUA', undefined, 200, {
    verificar: (j) => [['achou', j.data.length >= 1]],
  });
  await teste(
    'B07 busca com acento (veteráno)',
    'GET',
    '/players?search=veter%C3%A1no',
    undefined,
    200,
    {
      verificar: (j) => [
        ['achou Veterano', j.data.some((p) => p.name === 'Veterano Lua')],
      ],
    },
  );
  await teste(
    'B07 filtros combinados',
    'GET',
    '/players?position=MEI&condition=APTO&free=true&min_age=18&max_age=30&min_value=10&max_value=100',
    undefined,
    200,
    {
      verificar: (j) => [
        [
          'todos MEI/APTO/livres',
          j.data.every(
            (p) =>
              p.position === 'MEI' &&
              p.condition === 'APTO' &&
              p.club_id === null,
          ),
        ],
      ],
    },
  );
  await teste(
    'B07 sort=value_desc',
    'GET',
    '/players?sort=value_desc&limit=50',
    undefined,
    200,
    {
      verificar: (j) => [
        [
          'ordem decrescente',
          j.data.every(
            (p, i, a) =>
              i === 0 ||
              Number(a[i - 1].market_value) >= Number(p.market_value),
          ),
        ],
      ],
    },
  );
  for (const q of [
    'sort=xyz',
    'page=0',
    'limit=1000',
    'min_age=40&max_age=20',
    'free=true&club_id=1',
    'position=mei',
    'min_value=abc',
    'condition=xyz',
  ]) {
    await teste(`B07 inválido ${q}`, 'GET', `/players?${q}`, undefined, 400);
  }

  // ---------------- B08 ----------------
  secao('B08 exclusão lógica');
  await teste(
    'B08 DELETE 204',
    'DELETE',
    `/players/${pDel.id}`,
    undefined,
    204,
  );
  await teste('B08 GET 404', 'GET', `/players/${pDel.id}`, undefined, 404);
  await teste(
    'B08 PUT 404',
    'PUT',
    `/players/${pDel.id}`,
    { name: 'Para Excluir', position: 'ATA', agility: 60, age: 25 },
    404,
  );
  await teste(
    'B08 PATCH 404',
    'PATCH',
    `/players/${pDel.id}/condition`,
    { condition: 'APTO' },
    404,
  );
  await teste(
    'B08 DELETE de novo 404',
    'DELETE',
    `/players/${pDel.id}`,
    undefined,
    404,
  );
  await teste(
    'B08 some da lista',
    'GET',
    '/players?search=excluir',
    undefined,
    200,
    {
      verificar: (j) => [
        ['sem Para Excluir', !j.data.some((p) => p.id === pDel.id)],
      ],
    },
  );

  // ---------------- B09 ----------------
  secao('B09 clubes');
  await teste(
    'B09 clube criado (caixa 300)',
    'GET',
    `/clubs/${cA.id}`,
    undefined,
    200,
    {
      verificar: (j) => [
        ['cash 300', eq(j.cash, 300)],
        ['net_worth 300', eq(j.net_worth, 300)],
        ['players []', Array.isArray(j.players) && j.players.length === 0],
      ],
    },
  );
  await teste(
    'B09 nome repetido',
    'POST',
    '/clubs',
    { name: 'Atlas FC', acronym: 'ATL' },
    409,
  );
  await teste(
    'B09 nome repetido minúsculo (sigla ATA)',
    'POST',
    '/clubs',
    { name: 'atlas fc', acronym: 'ATA' },
    409,
  );
  await teste(
    'B09 sigla repetida',
    'POST',
    '/clubs',
    { name: 'Atlante FC', acronym: 'ATL' },
    409,
  );
  await teste(
    'B09 nome curto',
    'POST',
    '/clubs',
    { name: 'Ab', acronym: 'ABC' },
    400,
  );
  await teste(
    'B09 sigla curta',
    'POST',
    '/clubs',
    { name: 'Sigla Curta FC', acronym: 'SC' },
    400,
  );
  await teste(
    'B09 sigla minúscula',
    'POST',
    '/clubs',
    { name: 'Sigla Minus FC', acronym: 'sig' },
    400,
  );
  await teste('B09 corpo vazio', 'POST', '/clubs', {}, 400);
  await teste('B09 lista ordenada por nome', 'GET', '/clubs', undefined, 200, {
    verificar: (j) => [
      [
        'nome A-Z',
        j.every((c, i, a) => i === 0 || sa(a[i - 1].name) <= sa(c.name)),
      ],
    ],
  });

  // ---------------- B10 a B13 ----------------
  secao('B10 a B13 compra');
  await teste(
    'B10 compra Meia (37 + taxa 1,85)',
    'POST',
    `/players/${idMeia}/buy`,
    { club_id: cA.id, loyalty_until: fid(120) },
    200,
    {
      verificar: (j) => [
        ['value 37', eq(j.value, 37)],
        ['fee 1.85', eq(j.fee, 1.85)],
        ['club_cash 261.15', eq(j.club_cash, 261.15)],
        ['type COMPRA', j.type === 'COMPRA'],
        ['contrato ATIVO', j.contract?.status === 'ATIVO'],
      ],
    },
  );
  await teste(
    'B11 jogador com clube',
    'POST',
    `/players/${idMeia}/buy`,
    { club_id: cB.id, loyalty_until: fid(120) },
    409,
  );
  await teste(
    'B11 jogador excluído',
    'POST',
    `/players/${pDel.id}/buy`,
    { club_id: cB.id, loyalty_until: fid(120) },
    404,
  );
  await teste(
    'B11 clube inexistente',
    'POST',
    `/players/${pJovem.id}/buy`,
    { club_id: 999999, loyalty_until: fid(120) },
    404,
  );
  await teste(
    'B11 club_id inválido',
    'POST',
    `/players/${pJovem.id}/buy`,
    { club_id: 'abc', loyalty_until: fid(120) },
    400,
  );
  await teste(
    'B11 club_id ausente',
    'POST',
    `/players/${pJovem.id}/buy`,
    { loyalty_until: fid(120) },
    400,
  );
  await teste(
    'B12 loyalty ausente',
    'POST',
    `/players/${pJovem.id}/buy`,
    { club_id: cA.id },
    400,
  );
  await teste(
    'B12 sem -03:00',
    'POST',
    `/players/${pJovem.id}/buy`,
    { club_id: cA.id, loyalty_until: '2027-03-02T10:15' },
    400,
  );
  await teste(
    'B12 com Z',
    'POST',
    `/players/${pJovem.id}/buy`,
    { club_id: cA.id, loyalty_until: '2027-03-02T10:15Z' },
    400,
  );
  await teste(
    'B12 passado',
    'POST',
    `/players/${pJovem.id}/buy`,
    { club_id: cA.id, loyalty_until: '2020-01-01T10:00-03:00' },
    400,
  );
  await teste(
    'B12 mais de 1.095 dias',
    'POST',
    `/players/${pJovem.id}/buy`,
    { club_id: cA.id, loyalty_until: fid(1100) },
    400,
  );
  await teste(
    'B13 compra Jovem (48,84 + 2,44)',
    'POST',
    `/players/${pJovem.id}/buy`,
    { club_id: cA.id, loyalty_until: fid(10) },
    200,
    {
      verificar: (j) => [
        ['fee 2.44', eq(j.fee, 2.44)],
        ['club_cash 209.87', eq(j.club_cash, 209.87)],
      ],
    },
  );
  await teste(
    'B13 clube Atlas: caixa, elenco, patrimônio',
    'GET',
    `/clubs/${cA.id}`,
    undefined,
    200,
    {
      verificar: (j) => [
        ['cash 209.87', eq(j.cash, 209.87)],
        ['squad_value 85.84', eq(j.squad_value, 85.84)],
        ['net_worth 295.71', eq(j.net_worth, 295.71)],
        ['2 jogadores', j.players.length === 2],
        [
          'contrato com remaining_days e penalty_rate',
          j.players.every(
            (p) =>
              p.contract &&
              p.contract.remaining_days !== undefined &&
              p.contract.penalty_rate !== undefined,
          ),
        ],
      ],
    },
  );

  const cC = await exigir(
    'POST',
    '/clubs',
    { name: 'Cobras FC', acronym: 'COB' },
    201,
  );
  const caro = (n) =>
    jog({
      name: n,
      age: 27,
      agility: 60,
      pace: 75,
      shooting: 95,
      passing: 97,
      dribbling: 90,
      defending: 20,
      physical: 55,
      potential: 99,
    });
  const c1 = await exigir('POST', '/players', caro('Caro Um'), 201);
  const c2 = await exigir('POST', '/players', caro('Caro Dois'), 201);
  await teste(
    'B10 compra cara 100 + 5 (cabe em 150)',
    'POST',
    `/players/${c1.id}/buy`,
    { club_id: cC.id, loyalty_until: fid(120) },
    200,
    {
      verificar: (j) => [['club_cash 195', eq(j.club_cash, 195)]],
    },
  );
  await teste(
    'B10 segunda cara passa de 50% (105 > 97,5)',
    'POST',
    `/players/${c2.id}/buy`,
    { club_id: cC.id, loyalty_until: fid(120) },
    409,
  );
  await teste(
    'B10 caixa não mudou na recusa',
    'GET',
    `/clubs/${cC.id}`,
    undefined,
    200,
    { verificar: (j) => [['cash 195', eq(j.cash, 195)]] },
  );

  const cD = await exigir(
    'POST',
    '/clubs',
    { name: 'Dragões FC', acronym: 'DRA' },
    201,
  );
  for (let i = 1; i <= 12; i++) {
    const b = await exigir(
      'POST',
      '/players',
      jog({
        name: `Barato ${String.fromCharCode(64 + i)}`,
        age: 27,
        agility: 60,
        ...todos(45),
      }),
      201,
    );
    await exigir(
      'POST',
      `/players/${b.id}/buy`,
      { club_id: cD.id, loyalty_until: fid(120) },
      200,
    );
  }
  const b13 = await exigir(
    'POST',
    '/players',
    jog({ name: 'Barato Treze', age: 27, agility: 60, ...todos(45) }),
    201,
  );
  await teste(
    'B11 13º jogador (limite 12)',
    'POST',
    `/players/${b13.id}/buy`,
    { club_id: cD.id, loyalty_until: fid(120) },
    409,
  );

  // ---------------- B14 a B16 ----------------
  secao('B14 a B16 venda');
  await teste(
    'B15 venda do Meia',
    'POST',
    `/players/${idMeia}/sell`,
    undefined,
    200,
    {
      mostrar: ['value', 'penalty', 'profit', 'cash_change', 'club_cash'],
      verificar: (j) => [
        ['type VENDA', j.type === 'VENDA'],
        ['penalty <= 10', Number(j.penalty) <= 10],
      ],
    },
  );
  await teste(
    'B16 vender de novo (livre)',
    'POST',
    `/players/${idMeia}/sell`,
    undefined,
    409,
  );
  await teste(
    'B16 vender excluído',
    'POST',
    `/players/${pDel.id}/sell`,
    undefined,
    404,
  );
  await teste(
    'B15 voltou para os livres',
    'GET',
    '/players?free=true&search=meia',
    undefined,
    200,
    {
      verificar: (j) => [
        ['Meia Lua livre', j.data.some((p) => p.id === idMeia)],
      ],
    },
  );
  await teste(
    'B16 mesmo clube recompra (409)',
    'POST',
    `/players/${idMeia}/buy`,
    { club_id: cA.id, loyalty_until: fid(120) },
    409,
  );
  await teste(
    'B16 outro clube compra',
    'POST',
    `/players/${idMeia}/buy`,
    { club_id: cB.id, loyalty_until: fid(120) },
    200,
  );

  // ---------------- B17 ----------------
  secao('B17 clubes com elenco');
  await teste(
    'B17 sort de clubes inválido',
    'GET',
    '/clubs?sort=xyz',
    undefined,
    400,
  );
  await teste(
    'B17 players?club_id',
    'GET',
    `/players?club_id=${cB.id}`,
    undefined,
    200,
    {
      verificar: (j) => [
        [
          'só do clube',
          j.data.length > 0 && j.data.every((p) => p.club_id === cB.id),
        ],
      ],
    },
  );
  await teste(
    'B17 players?free=false',
    'GET',
    '/players?free=false&limit=50',
    undefined,
    200,
    {
      verificar: (j) => [
        ['todos com clube', j.data.every((p) => p.club_id !== null)],
      ],
    },
  );
  await teste(
    'B17 excluir jogador com clube',
    'DELETE',
    `/players/${idMeia}`,
    undefined,
    409,
  );
  await teste(
    'B17 mudar posição com clube',
    'PUT',
    `/players/${idMeia}`,
    { name: 'Meia Lua', position: 'ATA', agility: 85, age: 25 },
    409,
  );

  // ---------------- B18 / B19 ----------------
  secao('B18 e B19 histórico e CSV (clube Atlas)');
  await teste(
    'B18 histórico completo',
    'GET',
    `/clubs/${cA.id}/transactions`,
    undefined,
    200,
    {
      verificar: (j) => [
        ['3 transações (2 compras + 1 venda)', lista(j).length === 3],
        ['tem summary', j.summary !== undefined],
      ],
    },
  );
  await teste(
    'B18 filtro type=VENDA',
    'GET',
    `/clubs/${cA.id}/transactions?type=VENDA`,
    undefined,
    200,
    {
      verificar: (j) => [
        [
          'só VENDA',
          lista(j).length === 1 && lista(j).every((t) => t.type === 'VENDA'),
        ],
      ],
    },
  );
  await teste(
    'B18 filtro player_id',
    'GET',
    `/clubs/${cA.id}/transactions?player_id=${idMeia}`,
    undefined,
    200,
    {
      verificar: (j) => [
        [
          'só do jogador',
          lista(j).length === 2 &&
            lista(j).every((t) => t.player_id === idMeia),
        ],
      ],
    },
  );
  await teste(
    'B18 type + player_id',
    'GET',
    `/clubs/${cA.id}/transactions?type=COMPRA&player_id=${idMeia}`,
    undefined,
    200,
    {
      verificar: (j) => [['1 compra', lista(j).length === 1]],
    },
  );
  await teste(
    'B18 type inválido',
    'GET',
    `/clubs/${cA.id}/transactions?type=xyz`,
    undefined,
    400,
  );
  await teste(
    'B18 player_id inválido',
    'GET',
    `/clubs/${cA.id}/transactions?player_id=abc`,
    undefined,
    400,
  );
  await teste(
    'B18 player_id excluído',
    'GET',
    `/clubs/${cA.id}/transactions?player_id=${pDel.id}`,
    undefined,
    404,
  );
  await teste(
    'B18 clube inexistente',
    'GET',
    '/clubs/999999/transactions',
    undefined,
    404,
  );
  await teste(
    'B18 renomeia jogador',
    'PUT',
    `/players/${pJovem.id}`,
    { name: 'Jovem Lua Renomeado', position: 'MEI', agility: 85, age: 19 },
    200,
  );
  await teste(
    'B18 histórico guarda o nome do momento',
    'GET',
    `/clubs/${cA.id}/transactions`,
    undefined,
    200,
    {
      verificar: (j) => [
        [
          'nome antigo mantido',
          lista(j).some((t) => t.player_name === 'Jovem Lua'),
        ],
      ],
    },
  );
  await checarCsv('B19 CSV completo', `/clubs/${cA.id}/transactions/export`);
  await checarCsv(
    'B19 CSV com filtro',
    `/clubs/${cA.id}/transactions/export?type=VENDA`,
  );
  await teste(
    'B19 CSV filtro inválido (erro em JSON)',
    'GET',
    `/clubs/${cA.id}/transactions/export?type=xyz`,
    undefined,
    400,
  );
  await teste(
    'B19 CSV clube inexistente',
    'GET',
    '/clubs/999999/transactions/export',
    undefined,
    404,
  );

  // ---------------- B20 a B22 ----------------
  secao('B20 escalação');
  const gama = await exigir(
    'POST',
    '/clubs',
    { name: 'Gama SC', acronym: 'GAM' },
    201,
  );
  const delta = await exigir(
    'POST',
    '/clubs',
    { name: 'Delta FC', acronym: 'DEL' },
    201,
  );
  const eco = await exigir(
    'POST',
    '/clubs',
    { name: 'Eco FC', acronym: 'ECO' },
    201,
  );
  const tG = await montarTime(gama.id, 70, 'Gama'); // GOL, ZAG, LAT, MEI, ATA
  const tD = await montarTime(delta.id, 60, 'Delta');
  const L = (id) => `/clubs/${id}/lineup`;
  const bom = {
    formation: '2-1-1',
    player_ids: [tG[4], tG[0], tG[3], tG[1], tG[2]],
  }; // fora de ordem de propósito

  await teste('B20 GET sem escalação', 'GET', L(gama.id), undefined, 200, {
    verificar: (j) => [
      ['formation null', j.formation === null],
      ['complete false', j.complete === false],
      ['players []', j.players.length === 0],
    ],
  });
  await teste('B20 GET clube inexistente', 'GET', L(999999), undefined, 404);
  const inv = [
    ['sem formation', { player_ids: bom.player_ids }],
    ['formation inválida', { formation: '2-2-0', player_ids: bom.player_ids }],
    ['sem player_ids', { formation: '2-1-1' }],
    ['player_ids não é lista', { formation: '2-1-1', player_ids: 'abc' }],
    ['4 ids', { formation: '2-1-1', player_ids: tG.slice(0, 4) }],
    ['6 ids', { formation: '2-1-1', player_ids: [...tG, tG[0] + 9999] }],
    [
      'ids repetidos',
      { formation: '2-1-1', player_ids: [tG[0], tG[0], tG[1], tG[2], tG[3]] },
    ],
    [
      'id texto',
      {
        formation: '2-1-1',
        player_ids: [String(tG[0]), tG[1], tG[2], tG[3], tG[4]],
      },
    ],
    [
      'id zero',
      { formation: '2-1-1', player_ids: [0, tG[1], tG[2], tG[3], tG[4]] },
    ],
    [
      'id negativo',
      { formation: '2-1-1', player_ids: [-1, tG[1], tG[2], tG[3], tG[4]] },
    ],
  ];
  for (const [n, c] of inv)
    await teste(`B20 400 ${n}`, 'PUT', L(gama.id), c, 400);
  await teste('B20 404 clube', 'PUT', L(999999), bom, 404);
  await teste(
    'B20 404 jogador inexistente',
    'PUT',
    L(gama.id),
    { formation: '2-1-1', player_ids: [999999, tG[1], tG[2], tG[3], tG[4]] },
    404,
  );
  await teste(
    'B20 404 jogador excluído',
    'PUT',
    L(gama.id),
    { formation: '2-1-1', player_ids: [pDel.id, tG[1], tG[2], tG[3], tG[4]] },
    404,
  );
  await teste(
    'B20 409 jogador de outro clube',
    'PUT',
    L(gama.id),
    { formation: '2-1-1', player_ids: [tD[0], tG[1], tG[2], tG[3], tG[4]] },
    409,
  );
  await teste(
    'B20 409 jogador livre',
    'PUT',
    L(gama.id),
    {
      formation: '2-1-1',
      player_ids: [pDoente.id, tG[1], tG[2], tG[3], tG[4]],
    },
    409,
  );
  await teste(
    'B20 409 posições não fecham (2-2)',
    'PUT',
    L(gama.id),
    { formation: '2-2', player_ids: tG },
    409,
  );
  await teste(
    'B20 409 posições não fecham (3-1)',
    'PUT',
    L(gama.id),
    { formation: '3-1', player_ids: tG },
    409,
  );
  await teste(
    'B20 recusas não gravaram nada',
    'GET',
    L(gama.id),
    undefined,
    200,
    {
      verificar: (j) => [
        [
          'continua sem escalação',
          j.formation === null && j.players.length === 0,
        ],
      ],
    },
  );
  const cashAntes = Number(
    (await chamar('GET', `/clubs/${gama.id}`)).json.cash,
  );
  await teste('B20 escala Gama 2-1-1', 'PUT', L(gama.id), bom, 200, {
    verificar: (j) => [
      ['complete', j.complete === true],
      ['5 titulares', j.players.length === 5],
      [
        'ordem do elenco',
        j.players.map((p) => p.position).join() === POS.join(),
      ],
      ['formation', j.formation === '2-1-1'],
    ],
  });
  await exigir('PUT', L(delta.id), { formation: '2-1-1', player_ids: tD }, 200);
  await teste(
    'B20 caixa não mudou ao escalar',
    'GET',
    `/clubs/${gama.id}`,
    undefined,
    200,
    { verificar: (j) => [['mesmo caixa', eq(j.cash, cashAntes)]] },
  );

  secao('B21 partida');
  for (const [n, c] of [
    ['mesmo clube', { home_club_id: gama.id, away_club_id: gama.id }],
    ['id zero', { home_club_id: 0, away_club_id: delta.id }],
    ['id negativo', { home_club_id: -1, away_club_id: delta.id }],
    ['id decimal', { home_club_id: 1.5, away_club_id: delta.id }],
    ['id texto', { home_club_id: 'a', away_club_id: delta.id }],
    ['sem away', { home_club_id: gama.id }],
    ['corpo array', []],
  ])
    await teste(`B21 400 ${n}`, 'POST', '/matches', c, 400);
  await teste(
    'B21 404 mandante',
    'POST',
    '/matches',
    { home_club_id: 999999, away_club_id: delta.id },
    404,
  );
  await teste(
    'B21 404 visitante',
    'POST',
    '/matches',
    { home_club_id: gama.id, away_club_id: 999999 },
    404,
  );
  await teste(
    'B21 409 mandante sem escalação',
    'POST',
    '/matches',
    { home_club_id: eco.id, away_club_id: gama.id },
    409,
  );
  await teste(
    'B21 409 visitante sem escalação',
    'POST',
    '/matches',
    { home_club_id: gama.id, away_club_id: eco.id },
    409,
  );

  const m1 = await teste(
    'B21 partida Gama 3 x 0 Delta',
    'POST',
    '/matches',
    { home_club_id: gama.id, away_club_id: delta.id },
    201,
    {
      verificar: (j, r) => {
        const d = j.duels ?? [];
        return [
          [
            'Location /matches/{id}',
            /\/matches\/\d+$/.test(r.headers.get('location') ?? ''),
          ],
          [
            '3 x 0 MANDANTE',
            j.home?.goals === 3 &&
              j.away?.goals === 0 &&
              j.result === 'MANDANTE',
          ],
          [
            '6 duelos ordenados',
            d.map((x) => x.order).join() === '1,2,3,4,5,6',
          ],
          [
            'duelo 1: ATA shooting 70 x GOL defending 60',
            d[0]?.attacker.position === 'ATA' &&
              d[0].attacker.attribute === 'shooting' &&
              d[0].attacker.value === 70 &&
              d[0].defender.position === 'GOL' &&
              d[0].defender.attribute === 'defending' &&
              d[0].defender.value === 60,
          ],
          [
            'duelo 2: MEI passing x ZAG',
            d[1]?.attacker.position === 'MEI' &&
              d[1].attacker.attribute === 'passing' &&
              d[1].defender.position === 'ZAG',
          ],
          [
            'duelo 3: LAT dribbling x LAT',
            d[2]?.attacker.position === 'LAT' &&
              d[2].attacker.attribute === 'dribbling' &&
              d[2].defender.position === 'LAT',
          ],
          [
            'duelos 4-6 são do Delta e sem gol',
            d
              .slice(3)
              .every(
                (x) => x.attacking_club_id === delta.id && x.goal === false,
              ),
          ],
          [
            'formações gravadas',
            j.home?.formation === '2-1-1' && j.away?.formation === '2-1-1',
          ],
        ];
      },
    },
  );
  const idM1 = m1.json?.id;

  // Gama LAT mal condicionado: 70 x 0,85 = 59,5 -> 60; duelo 3 empata com 60 (sem gol) e Gama faz 2 x 0
  await exigir(
    'PATCH',
    `/players/${tG[2]}/condition`,
    { condition: 'MAL_CONDICIONADO' },
    200,
  );
  const m2 = await teste(
    'B21 com LAT mal condicionado: 2 x 0 (duelo 3 empata em 60)',
    'POST',
    '/matches',
    { home_club_id: gama.id, away_club_id: delta.id },
    201,
    {
      verificar: (j) => {
        const d3 = (j.duels ?? [])[2];
        return [
          ['2 x 0', j.home.goals === 2 && j.away.goals === 0],
          ['duelo 3 attacker value 60', d3?.attacker.value === 60],
          [
            'condition MAL_CONDICIONADO',
            d3?.attacker.condition === 'MAL_CONDICIONADO',
          ],
          ['duelo 3 sem gol', d3?.goal === false],
        ];
      },
    },
  );
  await teste(
    'B21 atributos do jogador não mudaram',
    'GET',
    `/players/${tG[2]}`,
    undefined,
    200,
    {
      verificar: (j) => [
        ['pace continua 70', j.pace === 70 && j.dribbling === 70],
      ],
    },
  );
  await teste(
    'B21 partida não mexeu no caixa',
    'GET',
    `/clubs/${gama.id}`,
    undefined,
    200,
    { verificar: (j) => [['mesmo caixa', eq(j.cash, cashAntes)]] },
  );
  await teste(
    'B21 partida não mexeu na escalação',
    'GET',
    L(gama.id),
    undefined,
    200,
    {
      verificar: (j) => [
        ['complete', j.complete === true && j.players.length === 5],
      ],
    },
  );

  secao('B22 histórico e classificação');
  await teste('B22 GET /matches', 'GET', '/matches', undefined, 200, {
    verificar: (j) => [
      ['mais recente primeiro', j[0]?.id === m2.json?.id && j[1]?.id === idM1],
      ['sem duels', j.every((p) => p.duels === undefined)],
    ],
  });
  await teste(
    'B22 filtro club_id',
    'GET',
    `/matches?club_id=${delta.id}`,
    undefined,
    200,
    {
      verificar: (j) => [['2 partidas', j.length === 2]],
    },
  );
  await teste(
    'B22 filtro de clube sem partidas',
    'GET',
    `/matches?club_id=${eco.id}`,
    undefined,
    200,
    { verificar: (j) => [['vazio', j.length === 0]] },
  );
  await teste(
    'B22 club_id inválido',
    'GET',
    '/matches?club_id=abc',
    undefined,
    400,
  );
  await teste(
    'B22 club_id repetido',
    'GET',
    `/matches?club_id=${gama.id}&club_id=${delta.id}`,
    undefined,
    400,
  );
  await teste(
    'B22 club_id inexistente',
    'GET',
    '/matches?club_id=999999',
    undefined,
    404,
  );
  await teste(
    'B22 GET /matches/{id}',
    'GET',
    `/matches/${idM1}`,
    undefined,
    200,
    {
      verificar: (j) => [
        ['6 duelos', j.duels?.length === 6],
        ['3 x 0', j.home.goals === 3],
      ],
    },
  );
  await teste('B22 /matches/999999', 'GET', '/matches/999999', undefined, 404);
  await teste('B22 /matches/01', 'GET', '/matches/01', undefined, 404);
  await teste('B22 classificação', 'GET', '/standings', undefined, 200, {
    verificar: (j) => {
      const t = lista(j);
      const g = t.find((x) => x.club_id === gama.id);
      const d = t.find((x) => x.club_id === delta.id);
      return [
        ['todos os clubes', t.length >= 7],
        [
          'posições 1..n sem repetir',
          t.map((x) => x.position).join() === t.map((_, i) => i + 1).join(),
        ],
        [
          'Gama 2 jogos, 2 vitórias, 6 pts, gols 5-0',
          g?.played === 2 &&
            g.wins === 2 &&
            g.points === 6 &&
            g.goals_for === 5 &&
            g.goals_against === 0 &&
            g.goal_difference === 5,
        ],
        [
          'Delta 0 pts, saldo -5',
          d?.points === 0 && d.goal_difference === -5 && d.losses === 2,
        ],
        ['Gama em 1º', g?.position === 1],
      ];
    },
  });

  secao('B20 escalação: venda, DOENTE e substituição');
  await teste(
    'B20 troca titular por reserva saudável',
    'PUT',
    L(gama.id),
    (() => {
      return {
        formation: '2-1-1',
        player_ids: [tG[0], tG[1], tG[2], tG[3], tG[4]],
      };
    })(),
    200,
  );
  const zagRes = await exigir(
    'POST',
    '/players',
    jog({ name: 'Zag Reserva', position: 'ZAG', ...todos(70) }),
    201,
  );
  await exigir(
    'POST',
    `/players/${zagRes.id}/buy`,
    { club_id: gama.id, loyalty_until: fid(120) },
    200,
  );
  const zagDoente = await exigir(
    'POST',
    '/players',
    jog({ name: 'Zag Doente', position: 'ZAG', ...todos(70) }),
    201,
  );
  await exigir(
    'POST',
    `/players/${zagDoente.id}/buy`,
    { club_id: gama.id, loyalty_until: fid(120) },
    200,
  );
  await exigir(
    'PATCH',
    `/players/${zagDoente.id}/condition`,
    { condition: 'DOENTE' },
    200,
  );
  await teste(
    'B20 409 jogador DOENTE',
    'PUT',
    L(gama.id),
    {
      formation: '2-1-1',
      player_ids: [tG[0], zagDoente.id, tG[2], tG[3], tG[4]],
    },
    409,
  );
  await teste(
    'B20 substitui escalação inteira (reserva entra)',
    'PUT',
    L(gama.id),
    { formation: '2-1-1', player_ids: [tG[0], zagRes.id, tG[2], tG[3], tG[4]] },
    200,
    {
      verificar: (j) => [
        ['reserva entrou', j.players.some((p) => p.id === zagRes.id)],
        ['titular saiu', !j.players.some((p) => p.id === tG[1])],
      ],
    },
  );
  await exigir('POST', `/players/${tD[4]}/sell`, undefined, 200);
  await teste(
    'B20 titular vendido sai da escalação',
    'GET',
    L(delta.id),
    undefined,
    200,
    {
      verificar: (j) => [
        ['complete false', j.complete === false],
        ['4 jogadores', j.players.length === 4],
        ['formation mantida', j.formation === '2-1-1'],
      ],
    },
  );
  await teste(
    'B21 409 clube com escalação incompleta',
    'POST',
    '/matches',
    { home_club_id: delta.id, away_club_id: gama.id },
    409,
  );
  await exigir(
    'PATCH',
    `/players/${tG[3]}/condition`,
    { condition: 'DOENTE' },
    200,
  );
  await teste(
    'B20 titular que fica DOENTE sai da escalação',
    'GET',
    L(gama.id),
    undefined,
    200,
    {
      verificar: (j) => [
        ['complete false', j.complete === false],
        ['4 jogadores', j.players.length === 4],
        ['MEI saiu', !j.players.some((p) => p.id === tG[3])],
      ],
    },
  );
  secao('B09 limite de 20 clubes');
  const nomesLimite = [
    'Aurora',
    'Bravos',
    'Cedro',
    'Dunas',
    'Estrela',
    'Fênix',
    'Garças',
    'Hércules',
    'Icaros',
    'Jaguar',
    'Kiwi',
    'Lunar',
    'Mares',
    'Nortes',
    'Ondas',
    'Pampas',
    'Quasar',
    'Rubis',
    'Sabiás',
    'Tigres',
  ];
  const jaExistem = lista((await chamar('GET', '/clubs')).json).length;
  for (const n of nomesLimite.slice(0, Math.max(0, 20 - jaExistem))) {
    await exigir(
      'POST',
      '/clubs',
      { name: `${n} FC`, acronym: sa(n).slice(0, 3).toUpperCase() },
      201,
    );
  }
  await teste(
    'B09 21º clube (limite de 20)',
    'POST',
    '/clubs',
    { name: 'Zeta FC', acronym: 'ZET' },
    409,
  );

  // ---------------- Conciliação ----------------
  secao('Conciliação do caixa (300 + soma das variações = caixa)');
  const clubes = lista((await chamar('GET', '/clubs')).json);
  for (const c of clubes) {
    const tx = lista((await chamar('GET', `/clubs/${c.id}/transactions`)).json);
    const soma = tx.reduce(
      (s, t) => s + Math.round(Number(t.cash_change) * 100),
      0,
    );
    registrar(
      Math.round(Number(c.cash) * 100) === 30000 + soma,
      `caixa ${c.name}`,
      `cash=${c.cash} soma=${soma / 100}`,
    );
  }
}

let vazioClubes = [];
try {
  vazioClubes = lista((await chamar('GET', '/clubs')).json);
  await main();
} catch (e) {
  console.error('\nERRO NA PREPARAÇÃO:', e.message);
  process.exitCode = 1;
}
console.log(`\n=== ${total} testes, ${falhas} falhas ===`);
