"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { useWatchlist } from "@/app/hooks/useWatchlist"
import { useFavorites } from "@/app/hooks/useFavorites"
import { Bookmark, BookmarkCheck, Heart } from "lucide-react"

export default function MovieCard({
  movie,
  onSelect,
}: {
  movie: any
  onSelect: (m: any) => void
}) {
  const [progress, setProgress] = useState<number>(0)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, loading: watchlistLoading } = useWatchlist()
  const { toggleFavorite, isInFavorites, loading: favoritesLoading } = useFavorites()

  useEffect(() => {
    const savedProgress = localStorage.getItem("watch-progress")
    if (savedProgress) {
      const data = JSON.parse(savedProgress)
      if (data[movie.id]) {
        setProgress(data[movie.id].progress || 0)
      }
    }
  }, [movie.id])

  const handleClick = () => {
    onSelect(movie)
  }

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id, movie.title)
    } else {
      addToWatchlist(movie.id, movie.title)
    }
  }

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(movie.id, movie.title)
  }

  async function handleRequest() {
    try {
      const res = await fetch("/api/request-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movie.id,
          title: movie.title,
          year: movie.year,
          user: "guest",
        }),
      })

      if (res.ok) {
        toast.success("Request sent", {
          description: `${movie.title} has been requested successfully.`,
        })
      } else {
        toast.error("Error", {
          description: "Something went wrong while sending your request.",
        })
      }
    } catch (err) {
      toast.error("Network Error", {
        description: "Failed to connect to server. Try again later.",
      })
    }
  }

  return (
    <div
      onClick={handleClick}
      className="group relative movie-card-mobile sm:min-w-0 cursor-pointer 
                 overflow-hidden rounded-lg shadow-lg 
                 transform transition duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-800">
        <Image
          src={movie.thumbnail || "/placeholder.svg"}
          alt={movie.title}
          width={500}
          height={750}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Glassy Circle with Play Button */}
        <div
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center 
               shadow-lg border-2 border-white 
               opacity-0 scale-90 transition-all duration-500 ease-in-out
               group-hover:opacity-100 group-hover:scale-110 
               group-hover:border-red-600 group-hover:shadow-white-500/50"
        >
          {/* Red Play Triangle */}
          <div
            className="w-0 h-0 border-l-[20px] sm:border-l-[24px] border-l-red-600 
                 border-y-[12px] sm:border-y-[14px] border-y-transparent 
                 opacity-0 transition-all duration-500 ease-in-out
                 group-hover:opacity-100 group-hover:border-l-red"
          ></div>
        </div>
      </div>

      <div className="absolute top-2 left-2">
        <span className="bg-red-600/90 text-white text-xs px-2 py-1 rounded-full font-medium">{movie.category}</span>
      </div>

      {movie.year && (
        <>
          <div className="absolute top-2 right-2 hidden sm:flex items-center gap-1">
            {/* Year badge */}
            <span className="text-white text-xs px-2 py-1 rounded-full bg-black/60">{movie.year}</span>

            <button
              onClick={handleFavoriteToggle}
              disabled={favoritesLoading}
              className="
                bg-red-500/70 hover:bg-red-600/80 text-white rounded-full
                transition-all duration-200 hover:scale-110 disabled:opacity-50
                p-1.5 min-w-[32px] min-h-[32px]
              "
              title={isInFavorites(movie.id) ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart size={14} className={`${isInFavorites(movie.id) ? "fill-current" : ""}`} />
            </button>

            {/* Watchlist button */}
            <button
              onClick={handleWatchlistToggle}
              disabled={watchlistLoading}
              className="
                bg-green-500/70 hover:bg-green-600/80 text-white rounded-full
                transition-all duration-200 hover:scale-110 disabled:opacity-50
                p-1.5 min-w-[32px] min-h-[32px]
              "
              title={isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {isInWatchlist(movie.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
          </div>

          <div className="absolute top-2 right-2 sm:hidden">
            <span className="text-white text-xs px-2 py-1 rounded-full bg-black/60">{movie.year}</span>
          </div>

          <div className="absolute bottom-2 right-2 flex sm:hidden gap-2">
            <button
              onClick={handleFavoriteToggle}
              disabled={favoritesLoading}
              className="
                bg-red-500/80 hover:bg-red-600/90 text-white rounded-full
                transition-all duration-200 hover:scale-110 disabled:opacity-50
                p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center
                shadow-lg backdrop-blur-sm
              "
              title={isInFavorites(movie.id) ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart size={18} className={`${isInFavorites(movie.id) ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleWatchlistToggle}
              disabled={watchlistLoading}
              className="
                bg-green-500/80 hover:bg-green-600/90 text-white rounded-full
                transition-all duration-200 hover:scale-110 disabled:opacity-50
                p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center
                shadow-lg backdrop-blur-sm
              "
              title={isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {isInWatchlist(movie.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>
        </>
      )}

      {/* Progress bar */}
      {progress > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
          <div className="h-1 bg-red-600" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </div>
  )
}
