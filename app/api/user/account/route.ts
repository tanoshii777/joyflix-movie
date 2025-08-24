import { NextResponse } from "next/server"
import * as jose from "jose"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function DELETE(req: Request) {
  try {
    await dbConnect()

    const cookie = req.headers.get("cookie") || ""
    const token = cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))

    const { password, confirmText } = await req.json()

    if (!password || confirmText !== "DELETE MY ACCOUNT") {
      return NextResponse.json({ error: "Password and confirmation text are required" }, { status: 400 })
    }

    const user = await User.findById(payload.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password is incorrect" }, { status: 400 })
    }

    await User.findByIdAndDelete(payload.id)

    // Clear authentication cookie
    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    })

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })

    return response
  } catch (error: any) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
