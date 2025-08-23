"use client"

import { useState, useEffect } from "react"
import { useOffline } from "./useOffline"

interface CachedMovie {
  id: string
  title: string
  poster_path: string
  backdrop_path: string
  overview: string
  release_date: string
  vote_average: number
  genre_ids: number[]
  cachedAt: number
}

interface CachedSearchResult {
  query: string
  results: CachedMovie[]
  cachedAt: number
}

export function useOfflineCache() {
  const { isOnline, cacheMovieData, getCachedMovieData } = useOffline()
  const [cachedMovies, setCachedMovies] = useState<CachedMovie[]>([])
  const [cachedSearches, setCachedSearches] = useState<CachedSearchResult[]>([])

  useEffect(() => {
    loadCachedData()
  }, [])

  const loadCachedData = () => {
    try {
      // Load cached movies
      const moviesCache = localStorage.getItem("cached-movies")
      if (moviesCache) {
        const movies = Object.values(JSON.parse(moviesCache)) as CachedMovie[]
        setCachedMovies(movies.filter((movie) => movie.cachedAt > Date.now() - 7 * 24 * 60 * 60 * 1000))
      }

      // Load cached searches
      const searchCache = localStorage.getItem("cached-searches")
      if (searchCache) {
        const searches = JSON.parse(searchCache) as CachedSearchResult[]
        setCachedSearches(searches.filter((search) => search.cachedAt > Date.now() - 24 * 60 * 60 * 1000))
      }
    } catch (error) {
      console.error("[OfflineCache] Failed to load cached data:", error)
    }
  }

  const cacheSearchResults = (query: string, results: any[]) => {
    try {
      const searchResult: CachedSearchResult = {
        query: query.toLowerCase(),
        results: results.map((movie) => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          overview: movie.overview,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids || [],
          cachedAt: Date.now(),
        })),
        cachedAt: Date.now(),
      }

      // Cache individual movies
      results.forEach((movie) => cacheMovieData(movie))

      // Cache search result
      const existing = cachedSearches.filter((s) => s.query !== query.toLowerCase())
      const updated = [...existing, searchResult].slice(-20) // Keep last 20 searches

      setCachedSearches(updated)
      localStorage.setItem("cached-searches", JSON.stringify(updated))
    } catch (error) {
      console.error("[OfflineCache] Failed to cache search results:", error)
    }
  }

  const getCachedSearchResults = (query: string): CachedMovie[] | null => {
    const cached = cachedSearches.find((s) => s.query === query.toLowerCase())
    if (cached && cached.cachedAt > Date.now() - 24 * 60 * 60 * 1000) {
      return cached.results
    }
    return null
  }

  const cacheMovieList = (listName: string, movies: any[]) => {
    try {
      const cacheKey = `cached-list-${listName}`
      const cachedList = {
        movies: movies.map((movie) => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          overview: movie.overview,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids || [],
          cachedAt: Date.now(),
        })),
        cachedAt: Date.now(),
      }

      localStorage.setItem(cacheKey, JSON.stringify(cachedList))

      // Also cache individual movies
      movies.forEach((movie) => cacheMovieData(movie))
    } catch (error) {
      console.error(`[OfflineCache] Failed to cache ${listName} list:`, error)
    }
  }

  const getCachedMovieList = (listName: string): CachedMovie[] | null => {
    try {
      const cacheKey = `cached-list-${listName}`
      const cached = localStorage.getItem(cacheKey)

      if (cached) {
        const parsedCache = JSON.parse(cached)
        // Return cached data if less than 6 hours old
        if (parsedCache.cachedAt > Date.now() - 6 * 60 * 60 * 1000) {
          return parsedCache.movies
        }
      }
      return null
    } catch (error) {
      console.error(`[OfflineCache] Failed to get cached ${listName} list:`, error)
      return null
    }
  }

  const cacheUserData = (userData: any) => {
    try {
      const userCache = {
        ...userData,
        cachedAt: Date.now(),
      }
      localStorage.setItem("cached-user", JSON.stringify(userCache))
    } catch (error) {
      console.error("[OfflineCache] Failed to cache user data:", error)
    }
  }

  const getCachedUserData = () => {
    try {
      const cached = localStorage.getItem("cached-user")
      if (cached) {
        const userData = JSON.parse(cached)
        // Return cached user data if less than 1 hour old
        if (userData.cachedAt > Date.now() - 60 * 60 * 1000) {
          return userData
        }
      }
      return null
    } catch (error) {
      console.error("[OfflineCache] Failed to get cached user data:", error)
      return null
    }
  }

  const clearExpiredCache = () => {
    try {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

      // Clear old movie cache
      const moviesCache = localStorage.getItem("cached-movies")
      if (moviesCache) {
        const movies = JSON.parse(moviesCache)
        const filtered = Object.fromEntries(
          Object.entries(movies).filter(([_, data]: [string, any]) => data.cachedAt > oneWeekAgo),
        )
        localStorage.setItem("cached-movies", JSON.stringify(filtered))
      }

      // Clear old search cache
      const searchCache = localStorage.getItem("cached-searches")
      if (searchCache) {
        const searches = JSON.parse(searchCache) as CachedSearchResult[]
        const filtered = searches.filter((search) => search.cachedAt > oneDayAgo)
        localStorage.setItem("cached-searches", JSON.stringify(filtered))
        setCachedSearches(filtered)
      }

      // Clear old list caches
      const keys = Object.keys(localStorage).filter((key) => key.startsWith("cached-list-"))
      keys.forEach((key) => {
        const cached = localStorage.getItem(key)
        if (cached) {
          const parsedCache = JSON.parse(cached)
          if (parsedCache.cachedAt <= oneDayAgo) {
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.error("[OfflineCache] Failed to clear expired cache:", error)
    }
  }

  const getCacheStats = () => {
    try {
      const moviesCount = Object.keys(JSON.parse(localStorage.getItem("cached-movies") || "{}")).length
      const searchesCount = cachedSearches.length
      const listsCount = Object.keys(localStorage).filter((key) => key.startsWith("cached-list-")).length

      return {
        movies: moviesCount,
        searches: searchesCount,
        lists: listsCount,
        isOnline,
      }
    } catch (error) {
      return { movies: 0, searches: 0, lists: 0, isOnline }
    }
  }

  return {
    isOnline,
    cachedMovies,
    cacheSearchResults,
    getCachedSearchResults,
    cacheMovieList,
    getCachedMovieList,
    cacheUserData,
    getCachedUserData,
    clearExpiredCache,
    getCacheStats,
    getCachedMovieData,
  }
}
