"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, Trash2, Filter } from "lucide-react"
import { movies as localMovies } from "../moviesData"
import NavbarWrapper from "../components/NavbarWrapper"
import { useRatings } from "../hooks/useRatings"
import StarRating from "../components/StarRating"

export default function RatingsPage() {
  const router = useRouter()
  const { ratings, rateMovie } = useRatings()
  const [user, setUser] = useState<any>(null)
  const [sortBy, setSortBy] = useState<"rating" | "title" | "date">("rating")
  const [filterRating, setFilterRating] = useState<number>(0)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          router.replace("/login")
        }
      } catch (err) {
        router.replace("/login")
      }
    }
    checkAuth()
  }, [router])

  if (!user) {
    return (
      <main className="flex items-center justify-center h-screen text-white bg-black">
        <p>Loading...</p>
      </main>
    )
  }

  const ratedMovies = localMovies
    .filter((movie) => ratings[movie.id])
    .filter((movie) => filterRating === 0 || ratings[movie.id] >= filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (ratings[b.id] || 0) - (ratings[a.id] || 0)
        case "title":
          return a.title.localeCompare(b.title)
        case "date":
          return b.id - a.id // Assuming higher ID = more recent
        default:
          return 0
      }
    })

  const averageRating =
    ratedMovies.length > 0 ? ratedMovies.reduce((sum, movie) => sum + ratings[movie.id], 0) / ratedMovies.length : 0

  const removeRating = (movieId: number) => {
    rateMovie(movieId, 0)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NavbarWrapper />

      <div className="pt-20 px-4 sm:px-6">
        {/* Header */}
        <div className="py-8 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">My Ratings</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span>{ratedMovies.length} movies rated</span>
            <span>•</span>
            <span>Average rating: {averageRating.toFixed(1)}/10</span>
          </div>
        </div>

        {/* Filters */}
        <div className="py-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value="rating">Rating (High to Low)</option>
              <option value="title">Title (A-Z)</option>
              <option value="date">Recently Added</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Min rating:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value={0}>All ratings</option>
              <option value={8}>8+ stars</option>
              <option value={6}>6+ stars</option>
              <option value={4}>4+ stars</option>
            </select>
          </div>
        </div>

        {/* Ratings Grid */}
        {ratedMovies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {ratedMovies.map((movie) => (
              <div key={movie.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                <div className="flex gap-4">
                  <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={movie.thumbnail || "/placeholder.svg"}
                      alt={movie.title}
                      width={80}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{movie.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {movie.category} • {movie.year}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <StarRating
                        rating={ratings[movie.id]}
                        onRatingChange={(rating) => rateMovie(movie.id, rating)}
                        size="sm"
                        showValue
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/watch/${movie.id}`)}
                        className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
                      >
                        Watch
                      </button>
                      <button
                        onClick={() => removeRating(movie.id)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No ratings yet</h2>
            <p className="text-gray-400 mb-6">Start rating movies to see them here</p>
            <button
              onClick={() => router.push("/")}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors"
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
