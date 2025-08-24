import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import PasswordReset from "@/models/PasswordReset"
import { PasswordUtils, RateLimiter } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    // Rate limiting for password reset requests
    const rateLimitCheck = RateLimiter.checkLimit(`reset_${email}`, 3, 60 * 60 * 1000) // 3 attempts per hour
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: `Too many password reset attempts. Please try again in ${rateLimitCheck.remainingTime} minutes.` },
        { status: 429 },
      )
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account with this email exists, you will receive a password reset link shortly.",
      })
    }

    // Generate reset token
    const resetToken = PasswordUtils.generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token
    await PasswordReset.create({
      email: user.email,
      token: resetToken,
      userId: user._id,
      expiresAt,
      used: false,
    })

    // In a real app, you would send an email here
    console.log(`Password reset token for ${email}: ${resetToken}`)

    return NextResponse.json({
      success: true,
      message: "If an account with this email exists, you will receive a password reset link shortly.",
      // Remove this in production - only for development
      ...(process.env.NODE_ENV === "development" && { resetToken }),
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
