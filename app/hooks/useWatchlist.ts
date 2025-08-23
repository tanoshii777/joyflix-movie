"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useOffline } from "./useOffline" // Assuming useOffline is defined in another file

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { isOnline, addPendingAction } = useOffline()

  useEffect(() => {
    // Load watchlist from localStorage on mount
    const savedWatchlist = localStorage.getItem("watchlist")
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist))
    }
  }, [])

  const addToWatchlist = async (movieId: string, movieTitle: string) => {
    setLoading(true)
    try {
      // Always update local state immediately
      const updatedWatchlist = [...watchlist, movieId]
      setWatchlist(updatedWatchlist)
      localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist))

      if (isOnline) {
        // Try to sync with server if online
        const user = localStorage.getItem("user")
        if (user) {
          const res = await fetch("/api/watchlist/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId }),
          })

          if (!res.ok) {
            throw new Error("Failed to add to watchlist")
          }
        }
      } else {
        // Add to pending actions if offline
        addPendingAction({
          type: "watchlist-add",
          movieId,
          movieTitle,
        })
      }

      toast.success("Added to Watchlist", {
        description: `${movieTitle} has been added to your watchlist.${!isOnline ? " (Will sync when online)" : ""}`,
      })
    } catch (error) {
      // Revert local state on error
      setWatchlist(watchlist)
      localStorage.setItem("watchlist", JSON.stringify(watchlist))

      toast.error("Error", {
        description: "Failed to add movie to watchlist. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (movieId: string, movieTitle: string) => {
    setLoading(true)
    try {
      // Always update local state immediately
      const updatedWatchlist = watchlist.filter((id) => id !== movieId)
      setWatchlist(updatedWatchlist)
      localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist))

      if (isOnline) {
        // Try to sync with server if online
        const user = localStorage.getItem("user")
        if (user) {
          const res = await fetch("/api/watchlist/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId }),
          })

          if (!res.ok) {
            throw new Error("Failed to remove from watchlist")
          }
        }
      } else {
        // Add to pending actions if offline
        addPendingAction({
          type: "watchlist-remove",
          movieId,
          movieTitle,
        })
      }

      toast.success("Removed from Watchlist", {
        description: `${movieTitle} has been removed from your watchlist.${!isOnline ? " (Will sync when online)" : ""}`,
      })
    } catch (error) {
      // Revert local state on error
      setWatchlist([...watchlist, movieId])
      localStorage.setItem("watchlist", JSON.stringify([...watchlist, movieId]))

      toast.error("Error", {
        description: "Failed to remove movie from watchlist. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const isInWatchlist = (movieId: string) => {
    return watchlist.includes(movieId)
  }

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    loading,
  }
}
