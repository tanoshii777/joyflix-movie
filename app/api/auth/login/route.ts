import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { AuthTokens, PasswordUtils, RateLimiter } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { identifier, password, rememberMe } = await req.json()

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/username and password are required" }, { status: 400 })
    }

    // Rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const rateLimitCheck = RateLimiter.checkLimit(clientIP)

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimitCheck.remainingTime} minutes.` },
        { status: 429 },
      )
    }

    // Find user
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/username or password. Please check your credentials and try again." },
        { status: 401 },
      )
    }

    // Verify password
    const isValidPassword = await PasswordUtils.verify(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email/username or password. Please check your credentials and try again." },
        { status: 401 },
      )
    }

    // Reset rate limit on successful login
    RateLimiter.resetAttempts(clientIP)

    // Create tokens
    const userPayload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      loginTime: Date.now(),
    }

    const token = await AuthTokens.createUserToken(userPayload, rememberMe)
    const refreshToken = await AuthTokens.createRefreshToken(user._id.toString())

    // Update user login info
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      $inc: { loginCount: 1 },
    })

    const response = NextResponse.json(
      {
        success: true,
        message: `Welcome back, ${user.fullName}! You have successfully logged in.`,
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          profileImage: user.profileImage,
          theme: user.theme,
        },
      },
      { status: 200 },
    )

    // Set cookies
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    })

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    response.cookies.set("user_theme", user.theme, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    })

    return response
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
