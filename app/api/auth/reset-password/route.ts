import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import PasswordReset from "@/models/PasswordReset"
import { PasswordUtils } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Reset token and new password are required" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = PasswordUtils.validateStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 })
    }

    // Find and validate reset token
    const resetRequest = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!resetRequest) {
      return NextResponse.json(
        { error: "Invalid or expired reset token. Please request a new password reset." },
        { status: 400 },
      )
    }

    // Hash new password
    const hashedPassword = await PasswordUtils.hash(password)

    // Update user password
    await User.findByIdAndUpdate(resetRequest.userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    })

    // Mark reset token as used
    await PasswordReset.findByIdAndUpdate(resetRequest._id, { used: true })

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. You can now log in with your new password.",
    })
  } catch (error) {
    console.error("Password reset confirmation error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
