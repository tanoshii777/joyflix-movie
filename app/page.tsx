"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Filter, Search } from "lucide-react"

import { movies as localMovies } from "./moviesData"
import Hero from "./components/Hero"
import QuickViewModal from "./components/QuickViewModal"
import Footer from "./components/Footer"
import MovieCard from "./components/MovieCard"
import MovieCardSkeleton from "./components/MovieCardSkeleton"
import NavbarWrapper from "./components/NavbarWrapper"
import SearchSuggestions from "./components/SearchSuggestions"
import RecommendationEngine from "./components/RecommendationEngine"
import type { Movie } from "./types/movie"

const categories: string[] = [
  "All",
  "Action",
  "Romance",
  "Horror",
  "Sci-Fi",
  "Drama",
  "Animation",
  "True Crime",
  "Thriller",
  "Fantasy",
]

type User = {
  email: string
  username?: string
}

export default function HomePage() {
  const router = useRouter()

  // 🔒 Auth states
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // 🎬 Page states
  const [query, setQuery] = useState<string>("")
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>(() =>
    Object.fromEntries(categories.map((c) => [c, 5])),
  )

  const [apiMovies, setApiMovies] = useState<Movie[]>([])
  const [allMovies, setAllMovies] = useState<Movie[]>(localMovies)
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)

  // 🔍 Search states
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  // 🔒 Check authentication via API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setIsLoggedIn(true)
          setUser(data.user)
        } else {
          router.replace("/login")
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        router.replace("/login")
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [router])

  // ✅ Fetch movies from TMDB
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoadingMovies(true)
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`,
        )
        const data = await res.json()

        const mapped: Movie[] = data.results.map((m: any) => ({
          id: `tmdb-${m.id}`,
          title: m.title,
          description: m.overview,
          thumbnail: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "/placeholder.svg",
          category: "Trending",
          year: new Date(m.release_date).getFullYear(),
        }))

        setApiMovies(mapped)
        setAllMovies([...localMovies, ...mapped])
      } catch (err) {
        console.error("Failed to fetch TMDB movies:", err)
      } finally {
        setIsLoadingMovies(false)
      }
    }

    fetchMovies()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      // your logic
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!authChecked) {
    return (
      <main className="flex items-center justify-center h-screen text-white">
        <p>Loading...</p>
      </main>
    )
  }

  if (!isLoggedIn) return null

  // ✅ Search and filter movies
  const filteredMovies = allMovies.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const recentlyAdded = allMovies.filter((m) => m.year && m.year >= 2023).slice(0, 10)

  const popularMovies = allMovies
    .filter((m) =>
      ["Avengers", "Pirates", "Sonic", "Transformers", "Dune"].some((keyword) =>
        m.title.toLowerCase().includes(keyword.toLowerCase()),
      ),
    )
    .slice(0, 10)

  const loadMore = (category: string) => {
    setVisibleCount((prev) => ({
      ...prev,
      [category]: prev[category] + 5,
    }))
  }

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie)

    try {
      // Get existing history or start with an empty array
      const history = JSON.parse(localStorage.getItem("viewingHistory") || "[]")

      // Use a Set to handle uniqueness efficiently
      const updatedHistory = new Set([movie.id, ...history])

      // Convert the Set back to an array and limit the size
      const finalHistory = Array.from(updatedHistory).slice(0, 20)

      // Save the new history
      localStorage.setItem("viewingHistory", JSON.stringify(finalHistory))
    } catch (error) {
      console.error("Failed to update viewing history:", error)
      // You could also show a user-facing message here
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NavbarWrapper />

      {/* 🔍 Enhanced Desktop Search */}
      <div className="hidden md:block fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-96">
        <div className="search-container relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search movies..."
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onFocus={() => {
                setSearchFocused(true)
                setShowSearchSuggestions(true)
              }}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/80 backdrop-blur-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
            />
          </div>

          {(showSearchSuggestions || searchFocused) && (
            <SearchSuggestions
              query={query}
              movies={allMovies}
              onMovieSelect={(movie) => {
                handleMovieSelect(movie)
                setShowSearchSuggestions(false)
                setQuery("")
              }}
              onQueryChange={setQuery}
            />
          )}
        </div>
      </div>

      {/* 🔍 Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Search</h2>
            <button className="text-gray-400 hover:text-red-400" onClick={() => setMobileSearchOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <input
            type="text"
            autoFocus
            placeholder="Search movies..."
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/70 text-white outline-none focus:ring-2 focus:ring-red-500"
          />

          {query && (
            <div className="mt-4 w-full bg-black/90 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      handleMovieSelect(movie)
                      setQuery("")
                      setMobileSearchOpen(false)
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-red-600/30 rounded cursor-pointer"
                  >
                    <Image
                      src={movie.thumbnail || "/placeholder.svg"}
                      alt={movie.title}
                      width={50}
                      height={75}
                      className="rounded"
                    />
                    <p>{movie.title}</p>
                  </div>
                ))
              ) : (
                <p className="p-3 text-gray-400">No results found.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="pt-20">
        <Hero movies={allMovies} />

        <RecommendationEngine movies={allMovies} onMovieSelect={handleMovieSelect} />

        <section className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Filter by genre:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {recentlyAdded.length > 0 && (
          <section className="px-4 sm:px-6 py-8">
            <h2 className="text-xl font-semibold mb-6">🆕 Recently Added</h2>
            <div className="movie-grid-mobile sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6 scrollbar-hide">
              {isLoadingMovies
                ? Array.from({ length: 5 }).map((_, i) => <MovieCardSkeleton key={i} />)
                : recentlyAdded.map((movie) => <MovieCard key={movie.id} movie={movie} onSelect={handleMovieSelect} />)}
            </div>
          </section>
        )}

        {popularMovies.length > 0 && (
          <section className="px-4 sm:px-6 py-8">
            <h2 className="text-xl font-semibold mb-6">🔥 Popular Movies</h2>
            <div className="movie-grid-mobile sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6 scrollbar-hide">
              {isLoadingMovies
                ? Array.from({ length: 5 }).map((_, i) => <MovieCardSkeleton key={i} />)
                : popularMovies.map((movie) => <MovieCard key={movie.id} movie={movie} onSelect={handleMovieSelect} />)}
            </div>
          </section>
        )}

        {apiMovies.length > 0 && (
          <section className="px-4 sm:px-6 py-8">
            <h2 className="text-xl font-semibold mb-6">🌍 Trending Now</h2>
            <div className="movie-grid-mobile sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6 scrollbar-hide">
              {isLoadingMovies
                ? Array.from({ length: 5 }).map((_, i) => <MovieCardSkeleton key={i} />)
                : apiMovies.map((movie) => <MovieCard key={movie.id} movie={movie} onSelect={handleMovieSelect} />)}
            </div>
          </section>
        )}

        <div className="pt-6 sm:pt-12">
          {categories.slice(1).map((category) => {
            const categoryMovies = allMovies.filter((m) => m.category === category)
            if (categoryMovies.length === 0) return null

            const visibleMovies = categoryMovies.slice(0, visibleCount[category])

            return (
              <section key={category} className="px-4 sm:px-6 py-8">
                <h2 className="text-xl font-semibold mb-6">{category}</h2>
                <div className="movie-grid-mobile sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6 scrollbar-hide">
                  {isLoadingMovies
                    ? Array.from({ length: 5 }).map((_, i) => <MovieCardSkeleton key={i} />)
                    : visibleMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} onSelect={handleMovieSelect} />
                      ))}
                </div>

                {visibleMovies.length < categoryMovies.length && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => loadMore(category)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded-lg text-white font-semibold"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </div>

      {selectedMovie && <QuickViewModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}

      <Footer />
    </main>
  )
}
