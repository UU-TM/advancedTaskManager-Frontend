/* Minimal offline shell for My Work + last board */
const CACHE = "kanban-shell-v1";
const SHELL = ["/my-work", "/manifest.webmanifest", "/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isShell =
    url.pathname === "/my-work" ||
    url.pathname.startsWith("/boards/") ||
    SHELL.includes(url.pathname);

  if (!isShell) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        void caches.open(CACHE).then((cache) => {
          if (url.pathname.startsWith("/boards/")) {
            cache.put("/__last-board", copy);
          } else {
            cache.put(req, copy);
          }
        });
        return res;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE);
        if (url.pathname.startsWith("/boards/")) {
          return (
            (await cache.match(req)) ||
            (await cache.match("/__last-board")) ||
            (await cache.match("/my-work"))
          );
        }
        return (await cache.match(req)) || (await cache.match("/my-work"));
      }),
  );
});
