import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Rating from "@/models/Rating"
import MovieStats from "@/models/MovieStats"
import { AuthTokens } from "@/lib/auth"

export async function DELETE(req: Request, { params }: { params: { movieId: string } }) {
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
    const movieId = params.movieId

    // Delete the rating
    const deletedRating = await Rating.findOneAndDelete({
      userId: payload.id,
      movieId,
    })

    if (!deletedRating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 })
    }

    // Update movie statistics
    await updateMovieStats(movieId)

    return NextResponse.json({
      success: true,
      message: "Rating removed successfully",
      movieId,
    })
  } catch (error: any) {
    console.error("Rating delete error:", error)
    return NextResponse.json({ error: "Failed to remove rating" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { movieId: string } }) {
  try {
    await dbConnect()
    const movieId = params.movieId

    // Get movie statistics
    const stats = await MovieStats.findOne({ movieId })

    if (!stats) {
      return NextResponse.json({
        movieId,
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
      })
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("Movie stats fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch movie statistics" }, { status: 500 })
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
