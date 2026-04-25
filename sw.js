const CACHE_NAME = 'zion-v1.0.8';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/zion.html',
    '/css/tokens.css',
    '/css/base.css',
    '/css/components.css',
    '/config.js',
    '/auth.js',
    '/assets/zion-alto.avif'
];

// Instala e guarda ficheiros em cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
    );
    self.skipWaiting();
});

// Limpa caches antigas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Responde com cache ou vai à rede
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).catch(() => caches.match('/index.html'));
        })
    );
});
