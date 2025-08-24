import { NextResponse } from "next/server"
import * as jose from "jose"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function PATCH(req: Request) {
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

    const { profileImage } = await req.json()

    if (!profileImage) {
      return NextResponse.json({ error: "Profile image data is required" }, { status: 400 })
    }

    // Basic validation for base64 image data
    if (!profileImage.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(
      payload.id,
      {
        profileImage,
        updatedAt: new Date(),
      },
      { new: true, select: "-password" },
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: user.profileImage,
    })
  } catch (error: any) {
    console.error("Avatar update error:", error)
    return NextResponse.json({ error: "Failed to update profile image" }, { status: 500 })
  }
}
