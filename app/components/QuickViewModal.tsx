"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { useFavorites } from "@/app/hooks/useFavorites"
import { useRatings } from "@/app/hooks/useRatings"
import { useEffect, useState } from "react"
import { toast } from "sonner" // ✅ Sonner for notifications

export default function QuickViewModal({
  movie,
  onClose,
}: {
  movie: any
  onClose: () => void
}) {
  const router = useRouter()
  const { favorites, toggleFavorite } = useFavorites()
  const { ratings, rateMovie } = useRatings()

  const [progressTime, setProgressTime] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)

  // 🔹 Load watch progress (time + duration) from localStorage
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

  // 🔹 Handle movie request
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
        toast("🎬 Request Sent", {
          description: `${movie.title} has been requested successfully.`,
        })
      } else {
        toast("❌ Error", {
          description: data.error || "Something went wrong while sending your request.",
        })
      }
    } catch (err) {
      console.error("[v0] Network error requesting movie:", err)
      toast("⚠️ Network Error", {
        description: "Failed to connect to server. Try again later.",
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl max-w-lg w-full p-6 relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          ✕
        </button>

        {/* Poster */}
        <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
          <Image src={movie.thumbnail || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
        </div>

        {/* Title + Info */}
        <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
        <p className="text-sm text-gray-400 mb-2">
          {movie.category} • ⭐ {ratings[movie.id] || "8.5"}
        </p>
        <p className="text-gray-300 text-sm mb-4">{movie.description}</p>

        {/* Rating System */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              onClick={() => rateMovie(movie.id, star)}
              className={star <= (ratings[movie.id] || 0) ? "text-yellow-400" : "text-gray-400"}
            >
              ⭐
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        {progressTime && duration && (
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-2 transition-all duration-500 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
              style={{ width: `${(progressTime / duration) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(movie.id)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                favorites.includes(movie.id) ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              ❤️ {favorites.includes(movie.id) ? "Remove" : "Add to List"}
            </button>

            {/* Watch / Continue */}
            {progressTime && duration ? (
              <button
                onClick={() => {
                  onClose()
                  router.push(`/watch/${movie.id}?resume=true`)
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              >
                ▶ Continue ({formatTime(progressTime)} / {formatTime(duration)})
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose()
                  router.push(`/watch/${movie.id}`)
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              >
                ▶ Watch Now
              </button>
            )}
          </div>

          {/* ✅ Request button (only if not downloaded) */}
          {!movie.downloaded && (
            <button
              onClick={handleRequest}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              📩 Request Movie
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
