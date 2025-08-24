import { NextResponse } from "next/server"
import { AuthTokens } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Get token from cookies
    const cookie = req.headers.get("cookie") || ""
    const token = cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token using centralized auth utility
    const payload = await AuthTokens.verifyToken(token)

    // Return user info
    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        username: payload.username,
        fullName: payload.fullName,
      },
    })
  } catch (err) {
    console.error("Auth check failed:", err)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
