// Pulsivio Service Worker
const CACHE_NAME = 'pulsivio-cache-v4';

// Install event - activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches and take control of all clients
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

// Fetch event - Network-first strategy with cache fallback
// Ensures the user always receives the latest updates immediately when online
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore browser extensions or external analytics if any
  if (url.origin !== self.location.origin && !url.origin.includes('fonts.googleapis.com') && !url.origin.includes('fonts.gstatic.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful response in background
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If offline or network fails, try cache
        return caches.match(event.request);
      })
  );
});
