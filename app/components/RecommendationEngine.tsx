"use client"

import { useState, useEffect } from "react"
import MovieCard from "./MovieCard"
import type { Movie } from "../types/movie"

interface RecommendationEngineProps {
  movies: Movie[]
  onMovieSelect: (movie: Movie) => void
}

export default function RecommendationEngine({ movies, onMovieSelect }: RecommendationEngineProps) {
  const [viewingHistory, setViewingHistory] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Movie[]>([])

  useEffect(() => {
    // Get viewing history from localStorage
    const history = localStorage.getItem("viewingHistory")
    if (history) {
      setViewingHistory(JSON.parse(history))
    }
  }, [])

  useEffect(() => {
    if (viewingHistory.length === 0) {
      // If no history, show popular movies
      const popular = movies
        .filter((movie) =>
          ["Avengers", "Spider-Man", "Batman", "Star Wars", "Transformers", "Pirates"].some((keyword) =>
            movie.title.toLowerCase().includes(keyword.toLowerCase()),
          ),
        )
        .slice(0, 8)
      setRecommendations(popular)
      return
    }

    // Get categories from viewing history
    const watchedMovies = movies.filter((movie) => viewingHistory.includes(movie.id))
    const watchedCategories = [...new Set(watchedMovies.map((movie) => movie.category))]

    // Recommend movies from same categories
    const categoryRecommendations = movies
      .filter((movie) => !viewingHistory.includes(movie.id) && watchedCategories.includes(movie.category))
      .slice(0, 6)

    // Add some popular movies if we don't have enough recommendations
    const popularMovies = movies
      .filter(
        (movie) =>
          !viewingHistory.includes(movie.id) &&
          !categoryRecommendations.find((rec) => rec.id === movie.id) &&
          movie.year &&
          movie.year >= 2020,
      )
      .slice(0, 2)

    setRecommendations([...categoryRecommendations, ...popularMovies])
  }, [movies, viewingHistory])

  if (recommendations.length === 0) return null

  const getRecommendationTitle = () => {
    if (viewingHistory.length === 0) {
      return "🎬 Popular Movies"
    }
    return "🎯 Recommended for You"
  }

  return (
    <section className="px-6 py-8">
      <h2 className="text-xl font-semibold mb-6">{getRecommendationTitle()}</h2>
      <div className="flex gap-4 overflow-x-auto sm:overflow-visible sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 scrollbar-hide">
        {recommendations.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onSelect={onMovieSelect} />
        ))}
      </div>
    </section>
  )
}
