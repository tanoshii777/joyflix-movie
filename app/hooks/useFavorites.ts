"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useOffline } from "./useOffline"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { isOnline, addPendingAction } = useOffline()

  useEffect(() => {
    // Load favorites from localStorage on mount
    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites)
        const stringFavorites = Array.isArray(parsed) ? parsed.map((id) => id.toString()) : []
        setFavorites(stringFavorites)
      } catch (error) {
        console.error("Error parsing favorites:", error)
        setFavorites([])
      }
    }

    // Sync with server if online and authenticated
    syncWithServer()
  }, [])

  const syncWithServer = async () => {
    try {
      const user = localStorage.getItem("user")
      if (!user || !isOnline) return

      const res = await fetch("/api/favorites")
      if (res.ok) {
        const data = await res.json()
        const serverFavorites = data.favorites || []
        setFavorites(serverFavorites)
        localStorage.setItem("favorites", JSON.stringify(serverFavorites))
      }
    } catch (error) {
      console.error("Failed to sync favorites with server:", error)
    }
  }

  const addToFavorites = async (movieId: string | number, movieTitle: string) => {
    const movieIdStr = movieId.toString()
    setLoading(true)

    try {
      // Always update local state immediately
      const updatedFavorites = [...favorites, movieIdStr]
      setFavorites(updatedFavorites)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))

      if (isOnline) {
        // Try to sync with server if online
        const user = localStorage.getItem("user")
        if (user) {
          const res = await fetch("/api/favorites/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId: movieIdStr }),
          })

          if (!res.ok) {
            throw new Error("Failed to add to favorites")
          }
        }
      } else {
        // Add to pending actions if offline
        addPendingAction({
          type: "favorite-add",
          movieId: movieIdStr,
          movieTitle,
        })
      }

      toast.success("Added to Favorites", {
        description: `${movieTitle} has been added to your favorites.${!isOnline ? " (Will sync when online)" : ""}`,
      })
    } catch (error) {
      // Revert local state on error
      setFavorites(favorites)
      localStorage.setItem("favorites", JSON.stringify(favorites))

      toast.error("Error", {
        description: "Failed to add movie to favorites. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromFavorites = async (movieId: string | number, movieTitle: string) => {
    const movieIdStr = movieId.toString()
    setLoading(true)

    try {
      // Always update local state immediately
      const updatedFavorites = favorites.filter((id) => id !== movieIdStr)
      setFavorites(updatedFavorites)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))

      if (isOnline) {
        // Try to sync with server if online
        const user = localStorage.getItem("user")
        if (user) {
          const res = await fetch("/api/favorites/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId: movieIdStr }),
          })

          if (!res.ok) {
            throw new Error("Failed to remove from favorites")
          }
        }
      } else {
        // Add to pending actions if offline
        addPendingAction({
          type: "favorite-remove",
          movieId: movieIdStr,
          movieTitle,
        })
      }

      toast.success("Removed from Favorites", {
        description: `${movieTitle} has been removed from your favorites.${!isOnline ? " (Will sync when online)" : ""}`,
      })
    } catch (error) {
      // Revert local state on error
      setFavorites([...favorites, movieIdStr])
      localStorage.setItem("favorites", JSON.stringify([...favorites, movieIdStr]))

      toast.error("Error", {
        description: "Failed to remove movie from favorites. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (movieId: string | number, movieTitle = "Movie") => {
    const movieIdStr = movieId.toString()
    if (isInFavorites(movieIdStr)) {
      await removeFromFavorites(movieIdStr, movieTitle)
    } else {
      await addToFavorites(movieIdStr, movieTitle)
    }
  }

  const isInFavorites = (movieId: string | number) => {
    return favorites.includes(movieId.toString())
  }

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isInFavorites,
    loading,
  }
}
