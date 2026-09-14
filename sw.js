const CACHE_NAME = 'apex-engine-cache-v4.5.0';

const CORE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Pre-cache App Shell & Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('Non-fatal pre-cache asset fetch warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Purge Stale Caches on Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor: Network-First for App Shell/Code, SWR for Static Vendor Libs
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass Cache for Supabase API Calls & Non-GET Requests
  if (req.method !== 'GET' || url.hostname.includes('supabase.co')) {
    return;
  }

  // Network-First for core application bundle and HTML to ensure immediate updates
  const isCoreCode = url.pathname.endsWith('/app.js') || 
                     url.pathname.endsWith('/index.html') || 
                     url.pathname === '/' || 
                     url.pathname.endsWith('/');

  if (isCoreCode) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Stale-While-Revalidate for external CDNs, manifest, and icons
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(req);

      const fetchPromise = fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          cache.put(req, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});