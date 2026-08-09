const CACHE_VERSION = "v5-prod";
const CACHE_NAME = `beereddy-erp-${CACHE_VERSION}`;
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

// Install Event - Pre-cache App Shell & Assets, immediately skip waiting
self.addEventListener("install", (event) => {
  console.log(`[PWA Service Worker ${CACHE_VERSION}] Installing & precaching assets`);
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Immediately purge obsolete caches & claim active clients
self.addEventListener("activate", (event) => {
  console.log(`[PWA Service Worker ${CACHE_VERSION}] Activating & purging old caches`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== STATIC_CACHE && cache !== API_CACHE && cache !== CACHE_NAME) {
              console.log(`[PWA SW ${CACHE_VERSION}] Deleting stale cache:`, cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Message Listener for immediate SW update activation
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch Event - High-Performance SPA Caching & Instant Navigation Fallback
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== "GET") return;

  // Bypass Service Worker for Vite dev modules, node_modules, HMR, and localhost dev server
  if (
    url.pathname.includes("/node_modules/") ||
    url.pathname.includes("/@vite") ||
    url.pathname.includes("/@react-refresh") ||
    url.search.includes("v=") ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1"
  ) {
    return;
  }

  // 1. SPA Navigation Requests (Android PWA Instant Navigation Fix)
  // For HTML navigation (mode === 'navigate' or accept: text/html), serve the precached /index.html app shell
  if (request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      caches.match("/index.html").then((cachedIndex) => {
        if (cachedIndex) {
          return cachedIndex;
        }
        return fetch("/index.html").catch(() => {
          return caches.match("/");
        });
      })
    );
    return;
  }

  // 2. API Requests -> Network Only (Never serve stale API responses from SW cache)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 3. Vite Build Assets (/assets/*) -> Cache First, Network Fallback
  if (url.pathname.includes("/assets/")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Other Static Resources (images, icons, fonts) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notifications Handler
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

// Message Event - Respond to SKIP_WAITING from app update prompt
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[PWA Service Worker] Received SKIP_WAITING signal. Activating new worker...");
    self.skipWaiting();
  }
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
