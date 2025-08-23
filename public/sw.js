const CACHE_NAME = "joyflix-v1"
const STATIC_CACHE = "joyflix-static-v1"
const DYNAMIC_CACHE = "joyflix-dynamic-v1"

// Assets to cache immediately
const STATIC_ASSETS = ["/", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png", "/offline.html"]

// API endpoints to cache
const API_CACHE_PATTERNS = [/^https:\/\/api\.themoviedb\.org\/3\//, /^\/api\/movies/, /^\/api\/search/]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // Serve offline page if network fails
          return caches.match("/offline.html")
        }),
    )
    return
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Return cached version immediately if available
          if (cachedResponse) {
            // Fetch fresh data in background
            fetch(request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(request, response.clone())
                }
              })
              .catch(() => {})
            return cachedResponse
          }

          // No cache, fetch from network
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(request, response.clone())
              }
              return response
            })
            .catch(() => {
              // Return offline response for API calls
              return new Response(JSON.stringify({ error: "Offline", cached: false }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
              })
            })
        })
      }),
    )
    return
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200 && request.method === "GET") {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone))
        }
        return response
      })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag)

  if (event.tag === "movie-request") {
    event.waitUntil(syncMovieRequests())
  }

  if (event.tag === "watchlist-update") {
    event.waitUntil(syncWatchlistUpdates())
  }
})

// Sync movie requests when back online
async function syncMovieRequests() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const requests = await cache.keys()

    for (const request of requests) {
      if (request.url.includes("/api/request-movie") && request.method === "POST") {
        try {
          await fetch(request)
          await cache.delete(request)
        } catch (error) {
          console.log("[SW] Failed to sync movie request:", error)
        }
      }
    }
  } catch (error) {
    console.log("[SW] Sync movie requests failed:", error)
  }
}

// Sync watchlist updates when back online
async function syncWatchlistUpdates() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const requests = await cache.keys()

    for (const request of requests) {
      if (request.url.includes("/api/watchlist") && request.method === "POST") {
        try {
          await fetch(request)
          await cache.delete(request)
        } catch (error) {
          console.log("[SW] Failed to sync watchlist update:", error)
        }
      }
    }
  } catch (error) {
    console.log("[SW] Sync watchlist updates failed:", error)
  }
}
