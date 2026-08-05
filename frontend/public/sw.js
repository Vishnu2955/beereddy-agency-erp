const CACHE_VERSION = "v5-prod";
const APP_CACHE = `beereddy-app-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `beereddy-static-${CACHE_VERSION}`;
const API_CACHE = `beereddy-api-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/favicon.png",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-icon-192x192.png",
  "/icons/maskable-icon-512x512.png",
];

const navigationRoute = (request) => {
  return request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
};

const networkFirst = async (request, cacheName = STATIC_CACHE) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    if (navigationRoute(request)) {
      return caches.match("/index.html");
    }
    throw error;
  }
};

const cacheFirst = async (request, cacheName = STATIC_CACHE) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener("install", (event) => {
  console.log(`[PWA Service Worker ${CACHE_VERSION}] Installing & precaching assets`);
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log(`[PWA Service Worker ${CACHE_VERSION}] Activating & purging old caches`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![APP_CACHE, STATIC_CACHE, API_CACHE].includes(cacheName)) {
              console.log(`[PWA SW ${CACHE_VERSION}] Deleting stale cache:`, cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api")) {
    event.respondWith(
      networkFirst(request, API_CACHE).catch(() =>
        new Response(
          JSON.stringify({
            success: false,
            offline: true,
            message: "You are currently offline. Showing cached system data.",
          }),
          { headers: { "Content-Type": "application/json" } }
        )
      )
    );
    return;
  }

  if (navigationRoute(request)) {
    event.respondWith(
      networkFirst(request, APP_CACHE).catch(async () => {
        const cached = await caches.match("/index.html");
        return cached || new Response("", { status: 503, statusText: "Service Unavailable" });
      })
    );
    return;
  }

  if (["script", "style", "font", "image", "worker"].includes(request.destination)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(
    cacheFirst(request).catch(async () => {
      if (navigationRoute(request)) {
        return caches.match("/index.html");
      }
    })
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || "New update from Beereddy Agency ERP",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [100, 50, 100],
      data: { url: data.url || "/dashboard" },
    };
    event.waitUntil(self.registration.showNotification(data.title || "Beereddy ERP Alert", options));
  } catch (_) {}
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
