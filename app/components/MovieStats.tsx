"use client"

import { useState, useEffect } from "react"
import { Star, BarChart3, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MovieStatsProps {
  movieId: string
  className?: string
}

interface MovieStatsData {
  totalRatings: number
  averageRating: number
  ratingDistribution: {
    [key: number]: number
  }
}

export default function MovieStats({ movieId, className = "" }: MovieStatsProps) {
  const [stats, setStats] = useState<MovieStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovieStats()
  }, [movieId])

  const fetchMovieStats = async () => {
    try {
      const response = await fetch(`/api/ratings/${movieId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch movie stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
        <CardContent className="p-4 text-center">
          <Star className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No ratings yet</p>
          <p className="text-xs text-gray-500">Be the first to rate this movie!</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...Object.values(stats.ratingDistribution))

  return (
    <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Movie Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
            <span className="text-gray-400">/10</span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              {stats.totalRatings} rating{stats.totalRatings !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Rating Distribution</h4>
          <div className="space-y-1">
            {Object.entries(stats.ratingDistribution)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-gray-400">{rating}★</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: maxCount > 0 ? `${(count / maxCount) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="w-8 text-gray-400 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
