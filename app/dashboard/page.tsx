"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Heart, Star, Clock, Play, Settings } from "lucide-react"
import { movies as localMovies } from "../moviesData"
import MovieCard from "../components/MovieCard"
import NavbarWrapper from "../components/NavbarWrapper"
import Footer from "../components/Footer"
import { useFavorites } from "../hooks/useFavorites"
import { useRatings } from "../hooks/useRatings"

type UserType = {
  email: string
  username?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { favorites } = useFavorites()
  const { ratings } = useRatings()

  const [user, setUser] = useState<UserType | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [watchHistory, setWatchHistory] = useState<any[]>([])
  const [continueWatching, setContinueWatching] = useState<any[]>([])

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
        console.error("Auth check failed:", err)
        router.replace("/login")
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    // Load watch progress data
    const savedProgress = localStorage.getItem("watch-progress")
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress)
      const continueList = Object.entries(progressData)
        .filter(([_, data]: [string, any]) => data.progress > 0 && data.progress < 0.9)
        .map(([movieId, data]: [string, any]) => {
          const movie = localMovies.find((m) => m.id.toString() === movieId)
          return movie ? { ...movie, progress: data.progress } : null
        })
        .filter(Boolean)
        .slice(0, 6)

      setContinueWatching(continueList)
    }

    // Load watch history (recently watched)
    const watchedMovies = localStorage.getItem("recently-watched")
    if (watchedMovies) {
      const recentlyWatched = JSON.parse(watchedMovies)
      setWatchHistory(recentlyWatched.slice(0, 6))
    }
  }, [])

  if (!authChecked) {
    return (
      <main className="flex items-center justify-center h-screen text-white bg-black">
        <p>Loading...</p>
      </main>
    )
  }

  if (!user) return null

  const favoriteMovies = localMovies.filter((movie) => favorites.includes(Number(movie.id))).slice(0, 6)
  const ratedMovies = localMovies.filter((movie) => ratings[Number(movie.id)]).slice(0, 6)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NavbarWrapper />

      <div className="pt-20 px-6">
        {/* User Profile Header */}
        <section className="py-8 border-b border-gray-800">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.username || "User"}</h1>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  {favorites.length} Favorites
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {Object.keys(ratings).length} Rated
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {continueWatching.length} In Progress
                </span>
              </div>
            </div>
            <div className="ml-auto">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          </div>
        </section>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section className="py-8">
            <div className="flex items-center gap-2 mb-6">
              <Play className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-semibold">Continue Watching</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {continueWatching.map((movie) => (
                <div key={movie.id} className="relative">
                  <MovieCard movie={movie} onSelect={() => router.push(`/watch/${movie.id}`)} />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg">
                    <div className="h-1 bg-red-600 rounded-b-lg" style={{ width: `${movie.progress * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Favorite Movies */}
        {favoriteMovies.length > 0 && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-semibold">My Favorites</h2>
              </div>
              <Link href="/favorites" className="text-red-500 hover:text-red-400 text-sm">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favoriteMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={() => router.push(`/watch/${movie.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Rated */}
        {ratedMovies.length > 0 && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-semibold">Recently Rated</h2>
              </div>
              <Link href="/ratings" className="text-red-500 hover:text-red-400 text-sm">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {ratedMovies.map((movie) => (
                <div key={movie.id} className="relative">
                  <MovieCard movie={movie} onSelect={() => router.push(`/watch/${movie.id}`)} />
                  <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs">{ratings[Number(movie.id)]}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Watch History */}
        {watchHistory.length > 0 && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-semibold">Recently Watched</h2>
              </div>
              <Link href="/history" className="text-red-500 hover:text-red-400 text-sm">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchHistory.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={() => router.push(`/watch/${movie.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {favorites.length === 0 && Object.keys(ratings).length === 0 && continueWatching.length === 0 && (
          <section className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Welcome to Your Dashboard</h3>
              <p className="text-gray-400 mb-6">
                Start watching movies to see your favorites, ratings, and continue watching here.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Browse Movies
              </Link>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  )
}
