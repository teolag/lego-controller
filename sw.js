const PRECACHE = 'precache-v0.2.18';
//const RUNTIME = 'runtime';

const PRECACHE_URLS = [
  './',
  'favicon.ico',
  'favicon-128x128.png',
  'favicon-256x256.png',
  'index.html',
  'manifest.json',
  'js/main.js',
  'js/solver-worker.js',
  'css/style.css',
  'css/dialog.css',
  'css/button.css',
];

const isSameOrigin = (request) => request.url.startsWith(self.location.origin)
self.addEventListener('install', event => event.waitUntil(preCacheResources()))
self.addEventListener('activate', event => event.waitUntil(removeOldCaches()))
self.addEventListener('fetch', event => isSameOrigin(event.request) && event.respondWith(getFromCacheOrFetch(event.request)))
self.addEventListener('message', handleIncomingMessage)



function handleIncomingMessage(messageEvent) {
  if(messageEvent.data.action === 'skipWaiting') {
    console.debug("SW: Got message to skip waiting")
    self.skipWaiting()
  }
}

async function getFromCacheOrFetch(request) {
  let response = await caches.match(request)
  if (response) {
    console.debug("SW: Get file from cache", request.url)
  } else {
    console.debug("SW: Fetch file from server", request.url)
    response = await fetch(request)
    // const runtimeCache = await caches.open(RUNTIME)
    // Put a copy of the response in the runtime cache.
    // await runtimeCache.put(request, response.clone())
  }
  return response
}

async function removeOldCaches() {
  const cacheNames = await caches.keys()
  const cachesToDelete = cacheNames.filter(cacheName => cacheName !== PRECACHE);
  if(cachesToDelete.length>0) {
    await Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete)));
    console.debug("SW: Delete caches ", cachesToDelete.join(', '))
  }
  self.clients.claim()
}

async function preCacheResources() {
  console.debug("SW: Precache all resources")
  const cache = await caches.open(PRECACHE)
  await cache.addAll(PRECACHE_URLS)
  console.debug("SW: Precache complete")
}