import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Check admin password (use environment variable or default)
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 })
    }

    // Create JWT token
    const token = jwt.sign(
      {
        isAdmin: true,
        timestamp: Date.now(),
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    // Create response with redirect
    const response = NextResponse.json({ success: true, message: "Admin login successful" }, { status: 200 })

    // Set HTTP-only cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
