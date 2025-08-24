"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

export function useRatings() {
  const [ratings, setRatings] = useState<{ [id: number]: number }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("ratings")
    if (stored) {
      try {
        setRatings(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse stored ratings:", error)
      }
    }
  }, [])

  const rateMovie = async (id: number, value: number) => {
    if (value < 0 || value > 10) {
      toast.error("Invalid rating", { description: "Rating must be between 1 and 10" })
      return
    }

    setLoading(true)

    try {
      // Update local state immediately for better UX
      const updated = value === 0 ? { ...ratings } : { ...ratings, [id]: value }

      if (value === 0) {
        delete updated[id]
      }

      setRatings(updated)
      localStorage.setItem("ratings", JSON.stringify(updated))

      // Sync with API (for future database integration)
      if (value > 0) {
        const response = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId: id, rating: value }),
        })

        if (!response.ok) {
          throw new Error("Failed to save rating")
        }

        toast.success("Rating saved", {
          description: `Rated ${value}/10 stars`,
        })
      } else {
        // Remove rating
        const response = await fetch(`/api/ratings/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to remove rating")
        }

        toast.success("Rating removed")
      }
    } catch (error) {
      console.error("Failed to save rating:", error)
      toast.error("Failed to save rating", {
        description: "Your rating was saved locally but couldn't sync to server",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRating = (id: number): number => {
    return ratings[id] || 0
  }

  const hasRating = (id: number): boolean => {
    return id in ratings && ratings[id] > 0
  }

  const getRatedMovies = (): number[] => {
    return Object.keys(ratings)
      .map(Number)
      .filter((id) => ratings[id] > 0)
  }

  const getAverageRating = (): number => {
    const ratedIds = getRatedMovies()
    if (ratedIds.length === 0) return 0

    const sum = ratedIds.reduce((acc, id) => acc + ratings[id], 0)
    return sum / ratedIds.length
  }

  return {
    ratings,
    rateMovie,
    getRating,
    hasRating,
    getRatedMovies,
    getAverageRating,
    loading,
  }
}
