"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { useFavorites } from "@/app/hooks/useFavorites"
import { useRatings } from "@/app/hooks/useRatings"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Heart, Play } from "lucide-react"
import StarRating from "./StarRating"

export default function QuickViewModal({
  movie,
  onClose,
}: {
  movie: any
  onClose: () => void
}) {
  const router = useRouter()
  const { isInFavorites, toggleFavorite, loading: favoritesLoading } = useFavorites()
  const { ratings, rateMovie, loading: ratingsLoading } = useRatings()

  const [progressTime, setProgressTime] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)

  // Load watch progress (time + duration) from localStorage
  useEffect(() => {
    if (!movie) return
    const saved = localStorage.getItem(`progress-${movie.id}`)
    if (saved) {
      const { time, duration } = JSON.parse(saved)
      if (time > 0 && duration) {
        setProgressTime(time)
        setDuration(duration)
      }
    }
  }, [movie])

  if (!movie) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle movie request
  async function handleRequest() {
    try {
      const res = await fetch("/api/request-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movie.id,
          title: movie.title,
          year: movie.year,
          user: "guest",
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Request Sent", {
          description: `${movie.title} has been requested successfully.`,
        })
      } else {
        toast.error("Error", {
          description: data.error || "Something went wrong while sending your request.",
        })
      }
    } catch (err) {
      console.error("[v0] Network error requesting movie:", err)
      toast.error("Network Error", {
        description: "Failed to connect to server. Try again later.",
      })
    }
  }

  const handleFavoriteToggle = async () => {
    await toggleFavorite(movie.id, movie.title)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors text-xl"
        >
          ✕
        </button>

        {/* Poster */}
        <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
          <Image src={movie.thumbnail || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
        </div>

        {/* Title + Info */}
        <h2 className="text-xl font-bold mb-2 text-white">{movie.title}</h2>
        <div className="flex items-center gap-4 mb-2 text-sm text-gray-400">
          <span>{movie.category}</span>
          {movie.year && <span>{movie.year}</span>}
          <div className="flex items-center gap-1">{/* Star Rating Component */}</div>
        </div>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{movie.description}</p>

        {/* Rating System */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-400">Rate this movie:</span>
          <StarRating
            rating={ratings[movie.id] || 0}
            onRatingChange={(rating) => rateMovie(movie.id, rating)}
            size="md"
            showValue
          />
        </div>

        {/* Progress Bar */}
        {progressTime && duration && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Continue watching</span>
              <span>
                {formatTime(progressTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 transition-all duration-500 bg-gradient-to-r from-red-500 to-red-600"
                style={{ width: `${(progressTime / duration) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              disabled={favoritesLoading}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                isInFavorites(movie.id)
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              } disabled:opacity-50`}
            >
              <Heart className={`w-4 h-4 ${isInFavorites(movie.id) ? "fill-current" : ""}`} />
              {favoritesLoading ? "..." : isInFavorites(movie.id) ? "Remove from Favorites" : "Add to Favorites"}
            </button>

            {/* Watch / Continue Button */}
            {progressTime && duration ? (
              <button
                onClick={() => {
                  onClose()
                  router.push(`/watch/${movie.id}?resume=true`)
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Continue
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose()
                  router.push(`/watch/${movie.id}`)
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Watch Now
              </button>
            )}
          </div>

          {/* Request Button (only if not downloaded) */}
          {!movie.downloaded && (
            <button
              onClick={handleRequest}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              📩 Request Movie
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
