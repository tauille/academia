/* ==========================================================================
   iTrainer — Service Worker
   v2: + Network-first para o HTML (sempre busca a versão nova na rede)
       + Cache-first para assets estáticos (css/js/imagens)
       + Cache versionado por release (evita servir app antigo)
   ========================================================================== */

const CACHE = 'itrainer-v11'; /* incremente a cada release */
const CACHE_ASSETS = 'itrainer-assets-v11';

/* Assets estáticos cacheados (versão nova a cada deploy) */
const ARQUIVOS = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/main.js',
  './js/nutricao.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== CACHE_ASSETS)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isPage = req.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html');

  /* Página (HTML): network-first — sempre tenta a rede primeiro,
     cai no cache apenas se estiver offline. Garante que o usuário
     receba a versão nova após cada atualização. */
  if (isPage) {
    e.respondWith(
      fetch(req)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
          return resp;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  /* Assets estáticos (css/js/imagens): cache-first com fallback na rede */
  e.respondWith(
    caches.match(req).then((res) =>
      res ||
      fetch(req).then((resp) => {
        if (resp && resp.ok && url.origin === self.location.origin) {
          const copia = resp.clone();
          caches.open(CACHE_ASSETS).then((c) => c.put(req, copia));
        }
        return resp;
      }).catch(() => caches.match('./index.html'))
    )
  );
});