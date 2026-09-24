const CACHE_NAME = 'cali-v19';
const STATIC_ASSETS = [
  '/tracker.html',
  '/index.html',
  '/pages.html',
  '/motion.js',
  '/exdb.js',
  '/calc.js',
  '/econ.js',
  '/app1.js',
  '/app2.js',
  '/app3.js',
  '/main2aa.js',
  '/main2ab.js',
  '/main2ba.js',
  '/main2bb.js',
  '/battle.js',
  '/xp.js',
  '/skills.js',
  '/community.js',
  '/weekly.js',
  '/wochen.js',
  '/wallet.js',
  '/verify.js',
  '/friends.js',
  '/account.js',
  '/legal.html',
  '/parks.js',
  '/rekorde.js',
  '/leaderboard.js',
  '/buddyfinder.js',
  '/hero-workout.jpg',
  '/challenge-p1.jpg',
  '/challenge-p4.jpg',
  '/challenge-p22.jpg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Nach so vielen ms gewinnt der Cache gegen ein stockendes Netz (Outdoor-Park-Szenario)
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if(e.request.method !== 'GET') return;
  // Firebase & externe Requests immer live holen
  if(e.request.url.includes('firebase') ||
     e.request.url.includes('googleapis') ||
     e.request.url.includes('gstatic') ||
     e.request.url.includes('overpass')) {
    return;
  }
  e.respondWith(
    Promise.race([
      fetch(e.request).then(function(res) {
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, resClone); });
        return res;
      }),
      new Promise(function(_, reject) {
        setTimeout(function(){ reject(new Error('network timeout')); }, NETWORK_TIMEOUT_MS);
      })
    ]).catch(function() {
      return caches.match(e.request).then(function(cached) {
        // Timeout, aber nichts im Cache: doch auf das Netz warten statt Fehlerseite
        return cached || fetch(e.request);
      });
    })
  );
});
