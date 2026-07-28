const { onRequest } = require('firebase-functions/v2/https');
const https = require('https');
const http = require('http');

const SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

function doRequest(url, postData) {
  return new Promise(function(resolve, reject) {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'CALI-App/1.0'
      }
    };
    const req = lib.request(options, function(res) {
      let data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        if (res.statusCode !== 200) {
          reject(new Error('HTTP ' + res.statusCode));
        } else {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, function() { req.destroy(new Error('Timeout')); });
    req.write(postData);
    req.end();
  });
}

exports.overpass = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  let query = '';
  if (req.method === 'POST') {
    const raw = req.rawBody ? req.rawBody.toString('utf8') : '';
    query = raw.startsWith('data=') ? decodeURIComponent(raw.slice(5)) : raw;
  } else {
    query = req.query.data || '';
  }

  if (!query) {
    res.status(400).json({ error: 'No query' });
    return;
  }

  const postData = 'data=' + encodeURIComponent(query);
  let lastError = '';

  for (let i = 0; i < SERVERS.length; i++) {
    try {
      const result = await doRequest(SERVERS[i], postData);
      res.status(200).type('application/json').send(result);
      return;
    } catch (e) {
      lastError = SERVERS[i] + ': ' + e.message;
      console.log('Failed:', lastError);
    }
  }

  res.status(502).json({ error: 'All servers failed: ' + lastError });
});
