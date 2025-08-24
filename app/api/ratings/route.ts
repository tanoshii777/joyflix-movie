import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Rating from "@/models/Rating"
import MovieStats from "@/models/MovieStats"
import { AuthTokens } from "@/lib/auth"

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

    // Get user's ratings from database
    const userRatings = await Rating.find({ userId: payload.id })

    // Convert to the format expected by the frontend
    const ratingsMap = userRatings.reduce(
      (acc, rating) => {
        acc[rating.movieId] = rating.rating
        return acc
      },
      {} as { [key: string]: number },
    )

    return NextResponse.json({ ratings: ratingsMap })
  } catch (error: any) {
    console.error("Ratings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
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
    const { movieId, rating, review } = await req.json()

    if (!movieId || rating < 1 || rating > 10) {
      return NextResponse.json({ error: "Invalid rating data" }, { status: 400 })
    }

    // Upsert rating (update if exists, create if not)
    const existingRating = await Rating.findOne({ userId: payload.id, movieId })

    if (existingRating) {
      existingRating.rating = rating
      if (review !== undefined) existingRating.review = review
      await existingRating.save()
    } else {
      await Rating.create({
        userId: payload.id,
        movieId,
        rating,
        review: review || undefined,
      })
    }

    // Update movie statistics
    await updateMovieStats(movieId)

    return NextResponse.json({
      success: true,
      message: "Rating saved successfully",
      movieId,
      rating,
    })
  } catch (error: any) {
    console.error("Rating save error:", error)
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 })
  }
}

// Helper function to update movie statistics
async function updateMovieStats(movieId: string) {
  try {
    const ratings = await Rating.find({ movieId })

    if (ratings.length === 0) {
      await MovieStats.findOneAndDelete({ movieId })
      return
    }

    const totalRatings = ratings.length
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
    ratings.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++
    })

    await MovieStats.findOneAndUpdate(
      { movieId },
      {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: distribution,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true },
    )
  } catch (error) {
    console.error("Failed to update movie stats:", error)
  }
}
