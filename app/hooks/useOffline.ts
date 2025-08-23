"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

interface OfflineAction {
  id: string
  type: "watchlist-add" | "watchlist-remove" | "favorite-add" | "favorite-remove"
  movieId: string
  movieTitle: string
  timestamp: number
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    // Load pending actions from localStorage
    const stored = localStorage.getItem("offline-actions")
    if (stored) {
      setPendingActions(JSON.parse(stored))
    }

    const handleOnline = () => {
      setIsOnline(true)
      toast.success("Connection restored!", {
        description: "Syncing your offline changes...",
      })
      syncPendingActions()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.info("You're now offline", {
        description: "Your changes will sync when connection is restored.",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const addPendingAction = (action: Omit<OfflineAction, "id" | "timestamp">) => {
    const newAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }

    const updated = [...pendingActions, newAction]
    setPendingActions(updated)
    localStorage.setItem("offline-actions", JSON.stringify(updated))
  }

  const removePendingAction = (actionId: string) => {
    const updated = pendingActions.filter((action) => action.id !== actionId)
    setPendingActions(updated)
    localStorage.setItem("offline-actions", JSON.stringify(updated))
  }

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return

    const actionsToSync = [...pendingActions]

    for (const action of actionsToSync) {
      try {
        let endpoint = ""
        const method = "POST"

        switch (action.type) {
          case "watchlist-add":
            endpoint = "/api/watchlist/add"
            break
          case "watchlist-remove":
            endpoint = "/api/watchlist/remove"
            break
          case "favorite-add":
            endpoint = "/api/favorites/add"
            break
          case "favorite-remove":
            endpoint = "/api/favorites/remove"
            break
        }

        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId: action.movieId }),
        })

        if (response.ok) {
          removePendingAction(action.id)
          console.log(`[Offline] Synced action: ${action.type} for ${action.movieTitle}`)
        }
      } catch (error) {
        console.error(`[Offline] Failed to sync action ${action.id}:`, error)
      }
    }

    if (pendingActions.length === 0) {
      toast.success("All changes synced!", {
        description: "Your offline actions have been saved.",
      })
    }
  }

  const cacheMovieData = (movieData: any) => {
    try {
      const cached = localStorage.getItem("cached-movies") || "{}"
      const cachedMovies = JSON.parse(cached)

      cachedMovies[movieData.id] = {
        ...movieData,
        cachedAt: Date.now(),
      }

      localStorage.setItem("cached-movies", JSON.stringify(cachedMovies))
    } catch (error) {
      console.error("[Offline] Failed to cache movie data:", error)
    }
  }

  const getCachedMovieData = (movieId: string) => {
    try {
      const cached = localStorage.getItem("cached-movies") || "{}"
      const cachedMovies = JSON.parse(cached)
      return cachedMovies[movieId] || null
    } catch (error) {
      console.error("[Offline] Failed to get cached movie data:", error)
      return null
    }
  }

  const clearOldCache = () => {
    try {
      const cached = localStorage.getItem("cached-movies") || "{}"
      const cachedMovies = JSON.parse(cached)
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

      const filtered = Object.fromEntries(
        Object.entries(cachedMovies).filter(([_, data]: [string, any]) => data.cachedAt > oneWeekAgo),
      )

      localStorage.setItem("cached-movies", JSON.stringify(filtered))
    } catch (error) {
      console.error("[Offline] Failed to clear old cache:", error)
    }
  }

  return {
    isOnline,
    pendingActions,
    addPendingAction,
    removePendingAction,
    syncPendingActions,
    cacheMovieData,
    getCachedMovieData,
    clearOldCache,
  }
}
