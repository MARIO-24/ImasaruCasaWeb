// Casa Vacacional Imasaru Gestión - Service Worker PWA
const CACHE_NAME = 'imasaru-gestion-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first fetch strategy
self.addEventListener('fetch', (event) => {
  // Never intercept or cache Supabase API or auth calls
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

