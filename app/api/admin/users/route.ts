import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const filter = searchParams.get("filter") || "all"
    const sort = searchParams.get("sort") || "created"
    const search = searchParams.get("search") || ""

    // Build query
    const query: any = {}
    if (filter === "active") query.isActive = { $ne: false }
    if (filter === "inactive") query.isActive = false
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort
    const sortOptions: any = {}
    switch (sort) {
      case "name":
        sortOptions.fullName = 1
        break
      case "email":
        sortOptions.email = 1
        break
      case "lastLogin":
        sortOptions.lastLogin = -1
        break
      default:
        sortOptions.createdAt = -1
    }

    const users = await User.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit)
      .select("-password")
      .lean()

    const total = await User.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Get stats
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: { $ne: false } }),
      inactive: await User.countDocuments({ isActive: false }),
      newThisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
    }

    return NextResponse.json({
      users,
      totalPages,
      currentPage: page,
      stats,
    })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    jwt.verify(token, JWT_SECRET)
    await dbConnect()

    const { userId, action } = await request.json()

    let updateData: any = {}
    switch (action) {
      case "activate":
        updateData = { isActive: true }
        break
      case "suspend":
        updateData = { isActive: false }
        break
      case "delete":
        await User.findByIdAndDelete(userId)
        return NextResponse.json({ success: true })
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await User.findByIdAndUpdate(userId, updateData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
