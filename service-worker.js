const CACHE_NAME = 'couplelist-v1';
const urlsToCache = [
  '/couplelist/',
  '/couplelist/index.html'
];

// Install - Cache dosyaları
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate - Eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network'ten çek, başarısızsa cache'den
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push Notification - Arka plan bildirimi
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'CoupleList';
  const options = {
    body: data.body || 'Yeni bir güncelleme var',
    icon: 'https://raw.githubusercontent.com/oozata/couplelist/main/icon.png',
    badge: 'https://raw.githubusercontent.com/oozata/couplelist/main/icon.png',
    vibrate: [200, 100, 200],
    sound: 'default',
    tag: 'couplelist-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click - Tıklanınca uygulamayı aç
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.includes('couplelist') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/couplelist/');
      }
    })
  );
});
