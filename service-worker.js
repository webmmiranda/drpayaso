
const CACHE_NAME = 'dr-payaso-v1';
const RUNTIME = 'runtime';

// Resources to cache immediately
const PRECACHE_URLS = [
  './',
  './index.html'
];

// Install Handler
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// Activate Handler (Clean up old caches)
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch Handler (Network First, then Cache)
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request)
        .then(response => {
          // Put a copy of the response in the runtime cache.
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        })
        .catch(() => {
            // If network fails, return cached response
            return cache.match(event.request);
        });
    })
  );
});
