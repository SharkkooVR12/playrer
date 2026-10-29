const API = 'https://discord.com/api/v10';
const H = { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' };
const CH = process.env.CHANNEL_ID;

async function count() {
  const r = await fetch(`https://${process.env.PLAYFAB_TITLE_ID}.playfabapi.com/Admin/GetTitleInternalData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-SecretKey': process.env.PLAYFAB_SECRET_KEY },
    body: JSON.stringify({ Keys: ['ActivePlayers'] }),
  });
  const raw = (await r.json()).data?.Data?.ActivePlayers;
  if (!raw) return 0;
  const now = Date.now();
  return Object.values(JSON.parse(raw)).filter(t => now - t <= 300000).length;
}

(async () => {
  const me = await (await fetch(`${API}/users/@me`, { headers: H })).json();
  const msgs = await (await fetch(`${API}/channels/${CH}/messages?limit=50`, { headers: H })).json();

  for (const m of msgs) {
    if (m.author.id === me.id) {
      await fetch(`${API}/channels/${CH}/messages/${m.id}`, { method: 'DELETE', headers: H });
    }
  }

  const n = await count();
  await fetch(`${API}/channels/${CH}/messages`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({
      content: `**Sharkkoo's Doomed Agony Player Count**\nActive Player Count: ${n}`,
    }),
  });
  console.log(`Posted count: ${n}`);
})();
