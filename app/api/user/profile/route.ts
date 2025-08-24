import { NextResponse } from "next/server"
import * as jose from "jose"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function GET(req: Request) {
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

    const user = await User.findById(payload.id).select("-password")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        theme: user.theme,
        bio: user.bio,
        location: user.location,
        website: user.website,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error: any) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

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

    const updateData = await req.json()
    const { fullName, username, bio, location, website, socialLinks, preferences } = updateData

    // Validate username if provided
    if (username && username !== payload.username) {
      const existingUser = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: payload.id },
      })
      if (existingUser) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
      }
    }

    // Validate website URL if provided
    if (website && website.trim()) {
      const urlPattern = /^https?:\/\/.+/
      if (!urlPattern.test(website)) {
        return NextResponse.json(
          { error: "Website must be a valid URL starting with http:// or https://" },
          { status: 400 },
        )
      }
    }

    const user = await User.findByIdAndUpdate(
      payload.id,
      {
        ...(fullName && { fullName: fullName.trim() }),
        ...(username && { username: username.toLowerCase().trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(location !== undefined && { location: location.trim() }),
        ...(website !== undefined && { website: website.trim() }),
        ...(socialLinks && { socialLinks }),
        ...(preferences && { preferences }),
        updatedAt: new Date(),
      },
      { new: true, select: "-password" },
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        theme: user.theme,
        bio: user.bio,
        location: user.location,
        website: user.website,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
      },
    })
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
