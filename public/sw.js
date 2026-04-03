const CACHE = 'marcheenschatz-v1';

// Cache everything on first fetch, serve from cache when offline.
// On activate, drop any old cache versions.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(request).then(cached => {
        const network = fetch(request).then(response => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        // Stale-while-revalidate: serve cache instantly, refresh in background
        return cached ?? network;
      })
    )
  );
});
