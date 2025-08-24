import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import NotificationPreference from "@/models/NotificationPreference"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    await dbConnect()

    let preferences = await NotificationPreference.findOne({ userId: decoded.userId })

    if (!preferences) {
      preferences = new NotificationPreference({ userId: decoded.userId })
      await preferences.save()
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Failed to get notification preferences:", error)
    return NextResponse.json({ error: "Failed to get preferences" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const data = await request.json()

    await dbConnect()

    const preferences = await NotificationPreference.findOneAndUpdate({ userId: decoded.userId }, data, {
      upsert: true,
      new: true,
    })

    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error("Failed to update notification preferences:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}
