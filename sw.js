const CACHE_NAME = 'expenses-v1';
const urlsToCache = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    return cache.addAll(urlsToCache).catch(function(err) { console.log('Cache error:', err); });
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.map(function(n) {
      if (n !== CACHE_NAME) return caches.delete(n);
    }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.url.indexOf('script.google.com') !== -1) return;
  event.respondWith(caches.match(event.request).then(function(response) {
    return response || fetch(event.request).then(function(fetchResp) {
      if (event.request.method === 'GET' && event.request.url.indexOf(self.location.origin) === 0) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, fetchResp.clone());
          return fetchResp;
        });
      }
      return fetchResp;
    }).catch(function() { return caches.match('./index.html'); });
  }));
});
