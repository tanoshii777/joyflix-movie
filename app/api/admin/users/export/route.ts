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

    const users = await User.find({}).select("-password").lean()

    // Convert to CSV
    const headers = [
      "ID",
      "Full Name",
      "Username",
      "Email",
      "Location",
      "Theme",
      "Watchlist Count",
      "Favorites Count",
      "Login Count",
      "Last Login",
      "Created At",
      "Status",
    ]

    const csvRows = [
      headers.join(","),
      ...users.map((user) =>
        [
          user._id,
          `"${user.fullName}"`,
          user.username,
          user.email,
          `"${user.location || ""}"`,
          user.theme,
          user.watchlist?.length || 0,
          user.favorites?.length || 0,
          user.loginCount || 0,
          user.lastLogin ? new Date(user.lastLogin).toISOString() : "",
          new Date(user.createdAt).toISOString(),
          user.isActive !== false ? "Active" : "Inactive",
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Failed to export users:", error)
    return NextResponse.json({ error: "Failed to export users" }, { status: 500 })
  }
}
