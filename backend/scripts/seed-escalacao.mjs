// Uso (API rodando, dentro de backend/):  node scripts/seed-escalacao.mjs [--partida]
const BASE = process.env.API_URL ?? 'http://localhost:3000/api/v1';

async function chamar(metodo, caminho, corpo) {
  const res = await fetch(BASE + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await res.text();
  let json;
  try {
    json = JSON.parse(texto);
  } catch {
    json = texto;
  }
  if (!res.ok)
    throw new Error(
      `${metodo} ${caminho} -> ${res.status} ${JSON.stringify(json)}`,
    );
  return json;
}

// fidelidade: daqui a 120 dias, no formato AAAA-MM-DDTHH:MM-03:00 (horário de Brasília)
const fidelidade =
  new Date(Date.now() + 120 * 864e5 - 3 * 3600e3).toISOString().slice(0, 16) +
  '-03:00';

// atr = [pace, shooting, passing, dribbling, defending, physical]
const jogador = (name, position, atr) => {
  const [pace, shooting, passing, dribbling, defending, physical] = atr;
  return {
    name,
    position,
    agility: 70,
    age: 25,
    pace,
    shooting,
    passing,
    dribbling,
    defending,
    physical,
    potential: Math.min(99, Math.max(...atr) + 5),
  };
};

const TIMES = [
  {
    clube: { name: 'Cometas FC', acronym: 'COM' },
    jogadores: [
      jogador('Caio Mendes', 'GOL', [55, 50, 60, 52, 74, 68]),
      jogador('Beto Almeida', 'ZAG', [62, 45, 58, 56, 72, 74]),
      jogador('Davi Torres', 'LAT', [74, 55, 63, 72, 64, 66]),
      jogador('Lauro Pires', 'MEI', [66, 64, 76, 72, 55, 62]),
      jogador('Otto Ramos', 'ATA', [76, 75, 60, 70, 40, 66]),
    ],
  },
  {
    clube: { name: 'Lobos FC', acronym: 'LOB' },
    jogadores: [
      jogador('Ivo Santana', 'GOL', [52, 48, 58, 50, 72, 70]),
      jogador('Hugo Barros', 'ZAG', [60, 42, 56, 54, 76, 75]),
      jogador('Lino Cardoso', 'LAT', [72, 52, 62, 74, 66, 64]),
      jogador('Nei Fontes', 'MEI', [68, 62, 70, 69, 54, 60]),
      jogador('Ugo Ferraz', 'ATA', [78, 73, 58, 68, 38, 64]),
    ],
  },
];

const criados = [];
for (const time of TIMES) {
  const clube = await chamar('POST', '/clubs', time.clube);
  const ids = [];
  for (const j of time.jogadores) {
    const novo = await chamar('POST', '/players', j);
    await chamar('POST', `/players/${novo.id}/buy`, {
      club_id: clube.id,
      loyalty_until: fidelidade,
    });
    ids.push(novo.id);
  }
  await chamar('PUT', `/clubs/${clube.id}/lineup`, {
    formation: '2-1-1',
    player_ids: ids,
  });
  criados.push({ clube, ids });
  console.log(
    `${clube.name} (id ${clube.id}): jogadores ${ids.join(', ')}, escalados no 2-1-1`,
  );
}

if (process.argv.includes('--partida')) {
  const p = await chamar('POST', '/matches', {
    home_club_id: criados[0].clube.id,
    away_club_id: criados[1].clube.id,
  });
  console.log(
    `Partida ${p.id}: ${p.home.club_name} ${p.home.goals} x ${p.away.goals} ${p.away.club_name} (${p.result})`,
  );
}
console.log('Pronto.');
