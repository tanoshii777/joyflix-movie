import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { NotificationService } from "@/lib/notificationService"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const filter = (searchParams.get("filter") as "all" | "unread" | "read") || "all"
    const type = searchParams.get("type") || "all"
    const category = searchParams.get("category") || "all"

    const result = await NotificationService.getUserNotifications(userId, {
      page,
      limit,
      filter,
      type,
      category,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const data = await request.json()

    const notification = await NotificationService.createNotification({
      userId: data.userId || decoded.userId,
      ...data,
    })

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error("Failed to create notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const { notificationIds, read } = await request.json()

    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds]
    await NotificationService.markAsRead(ids, decoded.userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update notifications:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
