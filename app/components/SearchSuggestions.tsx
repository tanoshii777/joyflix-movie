"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, Clock, TrendingUp } from "lucide-react"
import type { Movie } from "../types/movie"

interface SearchSuggestionsProps {
  query: string
  movies: Movie[]
  onMovieSelect: (movie: Movie) => void
  onQueryChange: (query: string) => void
}

export default function SearchSuggestions({ query, movies, onMovieSelect, onQueryChange }: SearchSuggestionsProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState<string[]>([
    "Avengers",
    "Spider-Man",
    "Batman",
    "Star Wars",
    "Marvel",
    "DC",
    "Horror",
    "Comedy",
  ])

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  const filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6)

  const handleMovieSelect = (movie: Movie) => {
    saveSearch(query)
    onMovieSelect(movie)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion)
    saveSearch(suggestion)
  }

  if (!query && recentSearches.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Popular Searches
          </h3>
          <div className="space-y-2">
            {popularSearches.map((search) => (
              <button
                key={search}
                onClick={() => handleSuggestionClick(search)}
                className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!query && recentSearches.length > 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Searches
          </h3>
          <div className="space-y-2">
            {recentSearches.map((search) => (
              <button
                key={search}
                onClick={() => handleSuggestionClick(search)}
                className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Popular Searches
          </h3>
          <div className="space-y-2">
            {popularSearches.slice(0, 4).map((search) => (
              <button
                key={search}
                onClick={() => handleSuggestionClick(search)}
                className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
      {filteredMovies.length > 0 ? (
        <div className="p-2">
          {filteredMovies.map((movie) => (
            <button
              key={movie.id}
              onClick={() => handleMovieSelect(movie)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left"
            >
              <Image
                src={movie.thumbnail || "/placeholder.svg"}
                alt={movie.title}
                width={40}
                height={60}
                className="rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{movie.title}</p>
                <p className="text-gray-400 text-sm">
                  {movie.category} • {movie.year}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No movies found for "{query}"</p>
        </div>
      )}
    </div>
  )
}
