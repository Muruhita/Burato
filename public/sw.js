// Minimal service worker — обеспечивает installability PWA + лёгкий offline
const CACHE = 'fib-shell-v1';
const PRECACHE = ['/', '/logo.png', '/manifest.json', '/favicon.ico'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) return;        // API — только сеть
  if (url.pathname.startsWith('/_next/')) return;      // Next.js сам управляет чанками

  // Навигация: network-first, при offline — fallback на shell
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() =>
        caches.match('/') || caches.match(request) || new Response('Offline', { status: 503 })
      )
    );
    return;
  }

  // Статика: cache-first
  e.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      });
    })
  );
});
