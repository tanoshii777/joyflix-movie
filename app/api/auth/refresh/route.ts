import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { AuthTokens } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await dbConnect()

    // Get refresh token from cookies
    const refreshToken = req.headers
      .get("cookie")
      ?.split("; ")
      .find((row) => row.startsWith("refresh_token="))
      ?.split("=")[1]

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
    }

    // Verify refresh token
    const { userId } = await AuthTokens.verifyRefreshToken(refreshToken)

    // Get user data
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create new access token
    const userPayload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      loginTime: Date.now(),
    }

    const newToken = await AuthTokens.createUserToken(userPayload, false)

    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        theme: user.theme,
      },
    })

    // Set new token cookie
    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
  }
}
