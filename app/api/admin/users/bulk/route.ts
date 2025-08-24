import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    jwt.verify(token, JWT_SECRET)
    await dbConnect()

    const { userIds, action } = await request.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid user IDs" }, { status: 400 })
    }

    let result
    switch (action) {
      case "activate":
        result = await User.updateMany({ _id: { $in: userIds } }, { isActive: true })
        break
      case "suspend":
        result = await User.updateMany({ _id: { $in: userIds } }, { isActive: false })
        break
      case "delete":
        result = await User.deleteMany({ _id: { $in: userIds } })
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      modified: result.modifiedCount || result.deletedCount,
    })
  } catch (error) {
    console.error("Failed to perform bulk action:", error)
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 })
  }
}
