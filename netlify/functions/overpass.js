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

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let query = '';
  if (event.httpMethod === 'POST') {
    const raw = event.body || '';
    query = raw.startsWith('data=') ? decodeURIComponent(raw.slice(5)) : raw;
  } else {
    const params = event.queryStringParameters || {};
    query = params.data || '';
  }

  if (!query) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'No query' }) };
  }

  const postData = 'data=' + encodeURIComponent(query);
  let lastError = '';

  for (let i = 0; i < SERVERS.length; i++) {
    try {
      const result = await doRequest(SERVERS[i], postData);
      return { statusCode: 200, headers, body: result };
    } catch (e) {
      lastError = SERVERS[i] + ': ' + e.message;
      console.log('Failed:', lastError);
    }
  }

  return { statusCode: 502, headers, body: JSON.stringify({ error: 'All servers failed: ' + lastError }) };
};
