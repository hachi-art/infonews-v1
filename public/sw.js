// infonews.day — Service Worker v9.2
const CACHE = 'infonews-v9.2';
const NEVER_CACHE = ['/', '/index.html'];

self.addEventListener('install', e => {
  self.skipWaiting();
  // Ne mettre que le manifest en cache, PAS index.html
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/manifest.json'])));
});

self.addEventListener('activate', e => {
  // Supprimer TOUS les anciens caches (v7, v8, v9, etc.)
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => {
      console.log('[SW] Suppression ancien cache:', k);
      return caches.delete(k);
    }))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Toujours réseau pour les APIs
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  // Toujours réseau pour index.html et la racine (jamais de cache)
  if (NEVER_CACHE.includes(url.pathname)) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // Cache-first pour les assets statiques (manifest, icons)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
