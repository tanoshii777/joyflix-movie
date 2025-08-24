"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFavorites } from "@/app/hooks/useFavorites"
import MovieCard from "@/app/components/MovieCard"
import QuickViewModal from "@/app/components/QuickViewModal"
import NavbarWrapper from "@/app/components/NavbarWrapper"
import Footer from "@/app/components/Footer"
import { movies } from "@/app/moviesData"
import { Heart, Search, Filter, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FavoritesPage() {
  const router = useRouter()
  const { favorites, loading } = useFavorites()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<any>(null)
  const [sortBy, setSortBy] = useState("title")
  const [filterBy, setFilterBy] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) {
          router.replace("/login")
          return
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        router.replace("/login")
        return
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [router])

  if (!authChecked) {
    return (
      <main className="flex items-center justify-center h-screen text-white bg-black">
        <p>Loading...</p>
      </main>
    )
  }

  // Filter movies that are in favorites
  const favoriteMovies = movies.filter((movie) => favorites.includes(movie.id.toString()))

  // Apply search filter
  const searchFiltered = favoriteMovies.filter((movie) => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))

  // Apply category filter
  const categoryFiltered =
    filterBy === "all"
      ? searchFiltered
      : searchFiltered.filter((movie) => movie.category.toLowerCase() === filterBy.toLowerCase())

  // Apply sorting
  const sortedMovies = [...categoryFiltered].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title)
      case "year":
        return (b.year || 0) - (a.year || 0)
      case "category":
        return a.category.localeCompare(b.category)
      case "recently-added":
        // Sort by position in favorites array (most recently added first)
        return favorites.indexOf(b.id.toString()) - favorites.indexOf(a.id.toString())
      default:
        return 0
    }
  })

  const handleMovieSelect = (movie: any) => {
    setSelectedMovie(movie)
  }

  const categories = [...new Set(favoriteMovies.map((movie) => movie.category))]

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NavbarWrapper />

      <div className="pt-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="text-red-500" size={32} />
          <h1 className="text-3xl md:text-4xl font-bold">My Favorites</h1>
          {loading && (
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search your favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recently-added">Recently Added</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="year">Year (Newest)</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none border-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none border-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {sortedMovies.length > 0 && (
          <p className="text-gray-400 mb-6">
            {sortedMovies.length} movie{sortedMovies.length !== 1 ? "s" : ""} in your favorites
            {searchTerm && ` matching "${searchTerm}"`}
            {filterBy !== "all" && ` in ${filterBy}`}
          </p>
        )}

        {/* Movies Display */}
        {sortedMovies.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {sortedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={handleMovieSelect} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMovies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieSelect(movie)}
                  className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={movie.thumbnail || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">{movie.title}</h3>
                    <p className="text-gray-400 text-sm">{movie.category}</p>
                    {movie.year && <p className="text-gray-500 text-sm">{movie.year}</p>}
                    {movie.description && (
                      <p className="text-gray-300 text-sm mt-2 line-clamp-2">{movie.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : favorites.length > 0 ? (
          <div className="text-center py-16">
            <Search className="mx-auto text-gray-600 mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">No movies found</h2>
            <p className="text-gray-400">
              No movies in your favorites match your current filters
              {searchTerm && ` for "${searchTerm}"`}
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setFilterBy("all")
              }}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="mx-auto text-gray-600 mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-gray-400 mb-6">Start adding movies to your favorites to see them here</p>
            <Button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700">
              Browse Movies
            </Button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedMovie && <QuickViewModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}

      <Footer />
    </main>
  )
}
