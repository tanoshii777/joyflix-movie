import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Rating from "@/models/Rating"
import { AuthTokens } from "@/lib/auth"
import { recommendationEngine, type UserPreferences } from "@/lib/recommendationEngine"

export async function GET(req: Request) {
  try {
    await dbConnect()

    const cookie = req.headers.get("cookie") || ""
    const token = cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await AuthTokens.verifyToken(token)

    // Get user data
    const user = await User.findById(payload.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user ratings
    const userRatings = await Rating.find({ userId: payload.id })
    const ratingsMap = userRatings.reduce(
      (acc, rating) => {
        acc[rating.movieId] = rating.rating
        return acc
      },
      {} as { [key: string]: number },
    )

    // Get viewing history from localStorage (in real app, this would be in database)
    const url = new URL(req.url)
    const watchedMoviesParam = url.searchParams.get("watchedMovies")
    const watchedMovies = watchedMoviesParam ? JSON.parse(decodeURIComponent(watchedMoviesParam)) : []

    // Build user preferences
    const userPrefs: UserPreferences = {
      favoriteGenres: [], // Could be derived from highly rated movies
      averageRating:
        userRatings.length > 0 ? userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length : 0,
      watchedMovies,
      ratedMovies: ratingsMap,
      favoriteMovies: user.favorites || [],
      watchlistMovies: user.watchlist || [],
    }

    // Get recommendations using different algorithms
    const contentBased = recommendationEngine.getContentBasedRecommendations(userPrefs, 6)
    const collaborative = recommendationEngine.getCollaborativeRecommendations(userPrefs, 4)
    const trending = recommendationEngine.getTrendingRecommendations(userPrefs, 6)
    const hybrid = recommendationEngine.getHybridRecommendations(userPrefs, 12)

    return NextResponse.json({
      recommendations: {
        contentBased,
        collaborative,
        trending,
        hybrid,
      },
      userPrefs: {
        totalRatings: userRatings.length,
        averageRating: userPrefs.averageRating,
        favoriteGenres: userPrefs.favoriteGenres,
      },
    })
  } catch (error: any) {
    console.error("Recommendations fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 })
  }
}
