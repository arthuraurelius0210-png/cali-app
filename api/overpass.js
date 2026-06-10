export const config = { api: { bodyParser: false } };

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let query = '';
  if (req.method === 'POST') {
    const raw = await readBody(req);
    // body is either raw QL or "data=<encoded>"
    query = raw.startsWith('data=') ? decodeURIComponent(raw.slice(5)) : raw;
  } else {
    query = req.query.data || '';
  }

  if (!query) return res.status(400).json({ error: 'No query' });

  for (const server of SERVERS) {
    try {
      const r = await fetch(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok) { console.log(server, 'HTTP', r.status); continue; }
      const data = await r.json();
      return res.status(200).json(data);
    } catch (e) {
      console.log(server, 'failed:', e.message);
    }
  }
  return res.status(502).json({ error: 'All Overpass servers failed' });
}
