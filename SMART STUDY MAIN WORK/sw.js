// Study Guide PWA - Service Worker
const CACHE_NAME = "study-guide-v1"
const STATIC_CACHE_NAME = "study-guide-static-v1"

// Files to cache
const STATIC_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./logo.png",
  "./favicon.ico",
]

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching static files")
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log("Service Worker: Static files cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Cache failed", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle same-origin requests
  if (url.origin === location.origin) {
    event.respondWith(handleSameOriginRequest(request))
  } else {
    // For external requests, just fetch from network
    event.respondWith(fetch(request))
  }
})

async function handleSameOriginRequest(request) {
  const url = new URL(request.url)

  try {
    // For HTML requests (navigation), try cache first, then network
    if (request.mode === "navigate" || request.headers.get("accept").includes("text/html")) {
      return await handleHTMLRequest(request)
    }

    // For static assets, try cache first
    if (isStaticAsset(url.pathname)) {
      return await handleStaticAssetRequest(request)
    }

    // For other requests, try network first
    return await handleNetworkFirstRequest(request)
  } catch (error) {
    console.error("Service Worker: Fetch failed", error)

    // Return offline fallback if available
    if (request.mode === "navigate") {
      const cache = await caches.open(STATIC_CACHE_NAME)
      return await cache.match("./index.html")
    }

    throw error
  }
}

async function handleHTMLRequest(request) {
  try {
    // Try cache first for offline-first approach
    const cache = await caches.open(STATIC_CACHE_NAME)
    const cachedResponse = await cache.match("./index.html")

    if (cachedResponse) {
      // Try to update cache in background
      fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put("./index.html", response.clone())
          }
        })
        .catch(() => {
          // Ignore network errors in background update
        })

      return cachedResponse
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put("./index.html", networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // If both cache and network fail, return a basic offline page
    return new Response(
      `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Study Guide - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: sans-serif; text-align: center; padding: 2rem; }
                    h1 { color: #0d47a1; }
                </style>
            </head>
            <body>
                <h1>Study Guide</h1>
                <p>You're offline. Please check your connection and try again.</p>
                <button onclick="location.reload()">Retry</button>
            </body>
            </html>
        `,
      {
        headers: { "Content-Type": "text/html" },
      },
    )
  }
}

async function handleStaticAssetRequest(request) {
  // Try cache first for static assets
  const cache = await caches.open(STATIC_CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  // If not in cache, fetch from network and cache
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone())
  }
  return networkResponse
}

async function handleNetworkFirstRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // If network fails, try cache
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    throw error
  }
}

function isStaticAsset(pathname) {
  const staticExtensions = [".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2"]
  return (
    staticExtensions.some((ext) => pathname.endsWith(ext)) ||
    pathname === "./manifest.json" ||
    pathname === "/manifest.json"
  )
}

// Handle background sync (if supported)
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic here
  // For example, sync offline data when connection is restored
  console.log("Service Worker: Performing background sync")
}

// Handle push notifications (if needed in future)
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received", event)

  const options = {
    body: event.data ? event.data.text() : "New notification",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  }

  event.waitUntil(self.registration.showNotification("Study Guide", options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event)

  event.notification.close()

  event.waitUntil(clients.openWindow("./"))
})

console.log("Service Worker: Script loaded")
