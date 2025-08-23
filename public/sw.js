const CACHE_NAME = "joyflix-v1"
const STATIC_CACHE = "joyflix-static-v1"
const DYNAMIC_CACHE = "joyflix-dynamic-v1"
const IMAGE_CACHE = "joyflix-images-v1"

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/watchlist",
  "/search",
  "/movies",
  "/series",
  "/offline",
  "/manifest.json",
  // Add critical CSS and JS files
  "/_next/static/css/",
  "/_next/static/js/",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching static assets")
      return cache.addAll(STATIC_ASSETS.filter((url) => !url.includes("_next")))
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith("http")) return

  // Handle different types of requests
  if (request.url.includes("/api/")) {
    // API requests - Network first, cache fallback
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
  } else if (request.url.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    // Images - Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE))
  } else if (request.url.includes("/_next/static/")) {
    // Static assets - Cache first
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
  } else {
    // Pages - Network first, cache fallback
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
  }
})

// Network first strategy (for dynamic content)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url)
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/offline")
    }

    throw error
  }
}

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Failed to fetch:", request.url)
    throw error
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "watchlist-sync") {
    event.waitUntil(syncWatchlist())
  }
})

// Sync watchlist when back online
async function syncWatchlist() {
  try {
    const pendingActions = await getStoredActions("watchlist-actions")

    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        })

        // Remove successful action
        await removeStoredAction("watchlist-actions", action.id)
      } catch (error) {
        console.log("[SW] Failed to sync action:", action.id)
      }
    }
  } catch (error) {
    console.log("[SW] Watchlist sync failed:", error)
  }
}

// Helper functions for IndexedDB operations
async function getStoredActions(storeName) {
  // Simplified - in real implementation, use IndexedDB
  return []
}

async function removeStoredAction(storeName, actionId) {
  // Simplified - in real implementation, use IndexedDB
  return true
}

// Push notification handling (optional)
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: data.data,
    actions: [
      {
        action: "view",
        title: "View Movie",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"))
  }
})
