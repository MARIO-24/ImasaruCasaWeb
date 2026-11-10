// Casa Vacacional Imasaru Gestión - Service Worker PWA
const CACHE_NAME = 'imasaru-gestion-v3';

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
  // Never intercept or cache Supabase API, realtime or auth calls
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

// ==============================================================================
// WEB PUSH NOTIFICATIONS
// ==============================================================================

self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: 'Nueva opinión recibida', body: event.data.text() };
    }
  }

  // Resolver URL absoluta para que el sistema operativo (Android, Windows, macOS, etc.)
  // descargue y muestre el icono oficial de la aplicación en vez de recurrir al genérico del navegador
  const origin = self.location.origin;
  const resolveIconUrl = (path, fallback) => {
    const target = path || fallback;
    if (target.startsWith('http://') || target.startsWith('https://')) return target;
    return `${origin}${target.startsWith('/') ? '' : '/'}${target}`;
  };

  const title = payload.title || 'Nueva opinión recibida';
  const options = {
    body: payload.body || 'Casa Vacacional Imasaru: tienes una nueva valoración pendiente de revisar.',
    icon: resolveIconUrl(payload.icon, '/pwa-192.png'),
    badge: resolveIconUrl(payload.badge, '/favicon-96x96.png'),
    tag: payload.tag || 'new-review',
    data: payload.data || { url: '/admin/resenas' },
    vibrate: [200, 100, 200],
    silent: false, // Reproducir el sonido de notificación predeterminado del sistema operativo
    requireInteraction: false
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin/resenas';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Si ya hay una ventana o pestaña de administración abierta, navegar a /admin/resenas y enfocarla
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // 2. Si no hay ventana abierta, abrir directamente /admin/resenas
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
