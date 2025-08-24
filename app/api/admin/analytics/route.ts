import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import MovieRequest from "@/models/MovieRequest"
import Notification from "@/models/Notification"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    jwt.verify(token, JWT_SECRET)
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    // User Analytics
    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    // Request Analytics
    const requestStats = await MovieRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Top Users by Activity
    const topUsers = await User.aggregate([
      {
        $project: {
          fullName: 1,
          email: 1,
          loginCount: 1,
          watchlistCount: { $size: "$watchlist" },
          favoritesCount: { $size: "$favorites" },
          totalActivity: {
            $add: ["$loginCount", { $size: "$watchlist" }, { $size: "$favorites" }],
          },
        },
      },
      { $sort: { totalActivity: -1 } },
      { $limit: 10 },
    ])

    // System Health Metrics
    const systemHealth = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      totalRequests: await MovieRequest.countDocuments(),
      pendingRequests: await MovieRequest.countDocuments({ status: "pending" }),
      totalNotifications: await Notification.countDocuments(),
      unreadNotifications: await Notification.countDocuments({ read: false }),
    }

    // Popular Content
    const popularMovies = await MovieRequest.aggregate([
      {
        $group: {
          _id: { movieId: "$movieId", title: "$title" },
          requestCount: { $sum: 1 },
          statuses: { $push: "$status" },
        },
      },
      { $sort: { requestCount: -1 } },
      { $limit: 10 },
    ])

    return NextResponse.json({
      userGrowth,
      requestStats,
      topUsers,
      systemHealth,
      popularMovies,
      period: Number.parseInt(period),
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
