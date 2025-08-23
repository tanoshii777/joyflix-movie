"use client"

import { useState } from "react"
import { useWatchlist } from "@/app/hooks/useWatchlist"
import MovieCard from "@/app/components/MovieCard"
import { movies } from "@/app/moviesData"
import { Bookmark, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function WatchlistPage() {
  const { watchlist } = useWatchlist()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<any>(null)

  // Filter movies that are in the watchlist
  const watchlistMovies = movies.filter((movie) => watchlist.includes(movie.id))

  // Filter by search term
  const filteredMovies = watchlistMovies.filter((movie) => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleMovieSelect = (movie: any) => {
    setSelectedMovie(movie)
    // You can add navigation to movie details page here
    console.log("Selected movie:", movie)
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="text-primary" size={32} />
          <h1 className="text-3xl md:text-4xl font-bold">My Watchlist</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={20} />
          <Input
            type="text"
            placeholder="Search your watchlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <>
            <p className="text-muted mb-6">
              {filteredMovies.length} movie{filteredMovies.length !== 1 ? "s" : ""} in your watchlist
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={handleMovieSelect} />
              ))}
            </div>
          </>
        ) : watchlist.length > 0 ? (
          <div className="text-center py-16">
            <Search className="mx-auto text-muted mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">No movies found</h2>
            <p className="text-muted">No movies in your watchlist match "{searchTerm}"</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <Bookmark className="mx-auto text-muted mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-muted">Start adding movies to your watchlist to see them here</p>
          </div>
        )}
      </div>
    </div>
  )
}
