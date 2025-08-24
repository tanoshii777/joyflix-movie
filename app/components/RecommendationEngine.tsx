"use client"

import { useState, useEffect } from "react"
import MovieCard from "./MovieCard"
import type { Movie } from "../types/movie"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, Users, Sparkles } from "lucide-react"

interface RecommendationEngineProps {
  movies: Movie[]
  onMovieSelect: (movie: Movie) => void
}

type RecommendationType = "hybrid" | "contentBased" | "collaborative" | "trending"

export default function RecommendationEngine({ movies, onMovieSelect }: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<{
    contentBased: Movie[]
    collaborative: Movie[]
    trending: Movie[]
    hybrid: Movie[]
  }>({
    contentBased: [],
    collaborative: [],
    trending: [],
    hybrid: [],
  })
  const [activeType, setActiveType] = useState<RecommendationType>("hybrid")
  const [loading, setLoading] = useState(false)
  const [userStats, setUserStats] = useState<{
    totalRatings: number
    averageRating: number
    favoriteGenres: string[]
  } | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      // Get viewing history from localStorage
      const watchedMovies = JSON.parse(localStorage.getItem("viewingHistory") || "[]")

      const response = await fetch(
        `/api/recommendations?watchedMovies=${encodeURIComponent(JSON.stringify(watchedMovies))}`,
      )

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
        setUserStats(data.userPrefs)
      } else {
        // Fallback to local recommendations
        setRecommendations(getLocalRecommendations())
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
      setRecommendations(getLocalRecommendations())
    } finally {
      setLoading(false)
    }
  }

  const getLocalRecommendations = () => {
    const viewingHistory = JSON.parse(localStorage.getItem("viewingHistory") || "[]")

    if (viewingHistory.length === 0) {
      // New users get popular movies
      const popular = movies
        .filter((movie) =>
          ["Avengers", "Spider-Man", "Batman", "Star Wars", "Transformers", "Pirates"].some((keyword) =>
            movie.title.toLowerCase().includes(keyword.toLowerCase()),
          ),
        )
        .slice(0, 12)

      return {
        contentBased: popular.slice(0, 6),
        collaborative: popular.slice(6, 10),
        trending: popular.slice(0, 6),
        hybrid: popular,
      }
    }

    // Existing users get category-based recommendations
    const watchedMovies = movies.filter((movie) => viewingHistory.includes(movie.id))
    const watchedCategories = [...new Set(watchedMovies.map((movie) => movie.category))]

    const categoryRecommendations = movies
      .filter((movie) => !viewingHistory.includes(movie.id) && watchedCategories.includes(movie.category))
      .slice(0, 8)

    const recentMovies = movies
      .filter((movie) => !viewingHistory.includes(movie.id) && movie.year && movie.year >= 2020)
      .slice(0, 6)

    return {
      contentBased: categoryRecommendations.slice(0, 6),
      collaborative: categoryRecommendations.slice(0, 4),
      trending: recentMovies,
      hybrid: [...categoryRecommendations.slice(0, 6), ...recentMovies.slice(0, 6)].slice(0, 12),
    }
  }

  const currentRecommendations = recommendations[activeType] || []

  if (currentRecommendations.length === 0 && !loading) return null

  const getRecommendationTitle = () => {
    switch (activeType) {
      case "contentBased":
        return { title: "Based on Your Preferences", icon: Sparkles }
      case "collaborative":
        return { title: "Users Like You Also Enjoyed", icon: Users }
      case "trending":
        return { title: "Trending Now", icon: TrendingUp }
      default:
        return { title: "Recommended for You", icon: Sparkles }
    }
  }

  const { title, icon: Icon } = getRecommendationTitle()

  return (
    <section className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {userStats && (
            <div className="text-xs text-muted-foreground mr-4">
              {userStats.totalRatings} ratings • Avg: {userStats.averageRating.toFixed(1)}/10
            </div>
          )}

          <div className="flex gap-1">
            <Button
              variant={activeType === "hybrid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveType("hybrid")}
              className="text-xs"
            >
              For You
            </Button>
            <Button
              variant={activeType === "contentBased" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveType("contentBased")}
              className="text-xs"
            >
              Similar
            </Button>
            <Button
              variant={activeType === "trending" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveType("trending")}
              className="text-xs"
            >
              Trending
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={fetchRecommendations} disabled={loading} className="ml-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-40 h-60 bg-gray-800 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto sm:overflow-visible sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 scrollbar-hide">
          {currentRecommendations.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onSelect={onMovieSelect} />
          ))}
        </div>
      )}
    </section>
  )
}
