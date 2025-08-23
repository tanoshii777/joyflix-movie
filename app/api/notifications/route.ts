import { NextResponse } from "next/server"
import { emailService } from "@/app/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, request, userEmail } = body

    if (!type || !request || !userEmail) {
      return NextResponse.json({ error: "Missing required fields: type, request, and userEmail" }, { status: 400 })
    }

    let success = false

    switch (type) {
      case "approved":
        if (process.env.RESEND_API_KEY) {
          success = await emailService.sendMovieApprovedNotification(request, userEmail)
        } else {
          await emailService.logEmailNotification("approved", request, userEmail)
          success = true // Consider logging as success when email service is not configured
        }
        break

      case "available":
        if (process.env.RESEND_API_KEY) {
          success = await emailService.sendMovieAvailableNotification(request, userEmail)
        } else {
          await emailService.logEmailNotification("available", request, userEmail)
          success = true
        }
        break

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    if (success) {
      return NextResponse.json({ success: true, message: "Notification sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("[Notifications] Error sending notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
