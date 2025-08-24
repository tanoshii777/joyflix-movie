import { NextResponse } from "next/server"
import * as jose from "jose"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function POST(req: Request) {
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

    const { movieId } = await req.json()

    if (!movieId) {
      return NextResponse.json({ error: "Movie ID is required" }, { status: 400 })
    }

    const user = await User.findById(payload.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Convert movieId to string for consistency
    const movieIdStr = movieId.toString()

    user.favorites = user.favorites.filter((id: string) => id !== movieIdStr)
    await user.save()

    return NextResponse.json({ message: "Movie removed from favorites" }, { status: 200 })
  } catch (error: any) {
    console.error("Favorites remove error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
