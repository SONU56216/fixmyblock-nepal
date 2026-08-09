// ================================================================
//  SERVICE WORKER – FixMyBlock Nepal
// ================================================================

const CACHE_NAME = 'fixmyblock-v1';
const ASSETS = [
  'https://sonu56216.github.io/fixmyblock-nepal/',
  'https://sonu56216.github.io/fixmyblock-nepal/index.html',
  'https://sonu56216.github.io/fixmyblock-nepal/login.html',
  'https://sonu56216.github.io/fixmyblock-nepal/admin.html',
  'https://sonu56216.github.io/fixmyblock-nepal/css/style.css',
  'https://sonu56216.github.io/fixmyblock-nepal/css/admin.css',
  'https://sonu56216.github.io/fixmyblock-nepal/css/glassmorphism.css',
  'https://sonu56216.github.io/fixmyblock-nepal/css/responsive.css',
  'https://sonu56216.github.io/fixmyblock-nepal/js/app.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/admin.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/auth.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/report.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/duplicate-check.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/haversine.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/priority.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/support.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/storage.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/utils.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/translations.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/map-utils.js',
  'https://sonu56216.github.io/fixmyblock-nepal/js/firebase-config.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install – cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch – serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            // Cache new resources that aren't cached yet
            if (!event.request.url.includes('firestore.googleapis.com') &&
                !event.request.url.includes('firebase.googleapis.com')) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page or a fallback response
            return new Response('You are offline. Please reconnect.', { status: 503 });
          });
      })
  );
});