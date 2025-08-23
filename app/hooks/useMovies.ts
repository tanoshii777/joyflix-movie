"use client"

import { useState } from "react"
import { useOfflineCache } from "./useOfflineCache"

interface Movie {
  id: string
  title: string
  poster_path: string
  backdrop_path: string
  overview: string
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export function useMovies() {
  const { isOnline, cacheMovieList, getCachedMovieList, cacheSearchResults, getCachedSearchResults } = useOfflineCache()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMovies = async (endpoint: string, cacheKey: string): Promise<Movie[]> => {
    const cached = getCachedMovieList(cacheKey)
    if (cached && (!isOnline || cached.length > 0)) {
      return cached
    }

    if (!isOnline) {
      throw new Error("No internet connection and no cached data available")
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.statusText}`)
      }

      const data = await response.json()
      const movies = data.results || data

      cacheMovieList(cacheKey, movies)

      return movies
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch movies"
      setError(errorMessage)

      const fallbackCache = getCachedMovieList(cacheKey)
      if (fallbackCache) {
        return fallbackCache
      }

      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const searchMovies = async (query: string): Promise<Movie[]> => {
    if (!query.trim()) return []

    const cached = getCachedSearchResults(query)
    if (cached && (!isOnline || cached.length > 0)) {
      return cached
    }

    if (!isOnline) {
      throw new Error("No internet connection and no cached search results")
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      const results = data.results || []

      cacheSearchResults(query, results)

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed"
      setError(errorMessage)

      const fallbackCache = getCachedSearchResults(query)
      if (fallbackCache) {
        return fallbackCache
      }

      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getPopularMovies = () => fetchMovies("/api/movies/popular", "popular")
  const getTrendingMovies = () => fetchMovies("/api/movies/trending", "trending")
  const getRecentMovies = () => fetchMovies("/api/movies/recent", "recent")
  const getTopRatedMovies = () => fetchMovies("/api/movies/top-rated", "top-rated")

  return {
    loading,
    error,
    isOnline,
    searchMovies,
    getPopularMovies,
    getTrendingMovies,
    getRecentMovies,
    getTopRatedMovies,
  }
}
