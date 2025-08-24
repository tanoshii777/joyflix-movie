import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0]
    let userName = "User"

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        userName = decoded.fullName || decoded.username || "User"
      } catch (error) {
        // Token invalid, but still proceed with logout
        console.log("Invalid token during logout")
      }
    }

    const response = NextResponse.json({
      success: true,
      message: `Goodbye, ${userName}! You have been successfully logged out. Thank you for using JoyFlix!`,
    })

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    }

    response.cookies.set("token", "", cookieOptions)

    response.cookies.set("user_theme", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({
      success: true,
      message: "You have been logged out successfully.",
    })
  }
}
