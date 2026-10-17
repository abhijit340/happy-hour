// Service worker: makes the app installable and lets it open with no signal.
// Network first so updates show up right away; the saved copy is used when the
// network fails or hasn't answered within a few seconds.
const CACHE = "happy-hour-v1"; // bump whenever SHELL changes
const WAIT_MS = 3000;
const SHELL = ["./", "index.html", "manifest.webmanifest", "privacy.html",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-512-maskable.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})))));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const network = fetch(event.request).then((res) => {
      if (res.ok) cache.put(event.request, res.clone());
      return res;
    });
    const timeout = new Promise((resolve) => setTimeout(resolve, WAIT_MS));
    try {
      const first = await Promise.race([network, timeout]);
      if (first) return first;
      return (await cache.match(event.request, { ignoreSearch: true })) || (await network);
    } catch (e) {
      return (await cache.match(event.request, { ignoreSearch: true })) || (await cache.match("index.html")) || Response.error();
    }
  })());
});
