const CACHE_NAME = "joyflix-v1"
const urlsToCache = ["/", "/offline.html", "/icon-192x192.png", "/icon-512x512.png"]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// Push event
self.addEventListener("push", (event) => {
  const options = {
    body: "New notification from JoyFlix",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View",
        icon: "/icon-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192x192.png",
      },
    ],
  }

  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.title = data.title || "JoyFlix"
    options.data = { ...options.data, ...data.data }
  }

  event.waitUntil(self.registration.showNotification("JoyFlix", options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow(event.notification.data.actionUrl || "/"))
  } else if (event.action === "close") {
    // Just close the notification
  } else {
    // Default action
    event.waitUntil(clients.openWindow("/"))
  }
})
