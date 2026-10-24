/* eslint-env serviceworker */
// Offline shell so the itinerary opens in an airport or train dead zone.
// Hand-written, no build plugin (same approach as the betsheet static app).
//
//   * trip.json and navigations - NETWORK FIRST, cache as the fallback, so an
//     online visit always shows the latest plan and an offline one shows the
//     last plan that reached this device.
//   * /assets/*                 - CACHE FIRST: Vite hashes the filenames, so
//     their contents never change under an old name.

const CACHE = 'trip-planner-v1';
const SHELL = ['./', './index.html', './trip.json'];

/** Hashed bundle URLs named in index.html, so they are cached at install. */
async function shellAssets() {
  try {
    const html = await (await fetch('./index.html', { cache: 'no-cache' })).text();
    return [...html.matchAll(/(?:src|href)="(\.?\/?[^"]*assets\/[^"]+)"/g)].map((m) => new URL(m[1], self.registration.scope).href);
  } catch {
    return [];
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL).catch(() => {});
    await cache.addAll(await shellAssets()).catch(() => {});
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) || (await cache.match('./index.html')) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/assets/')) event.respondWith(cacheFirst(request));
  else if (request.mode === 'navigate' || url.pathname.endsWith('/trip.json')) event.respondWith(networkFirst(request));
});
