const CACHE_NAME = 'cali-v1';
const STATIC_ASSETS = [
  '/tracker.html',
  '/index.html',
  '/pages.html',
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
  '/parks.js',
  '/rekorde.js',
  '/leaderboard.js',
  '/manifest.json'
];

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
  // Firebase & externe Requests immer live holen
  if(e.request.url.includes('firebase') ||
     e.request.url.includes('googleapis') ||
     e.request.url.includes('gstatic') ||
     e.request.url.includes('overpass')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
