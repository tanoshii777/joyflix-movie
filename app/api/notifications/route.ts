import { NextResponse } from "next/server";
import { emailService } from "@/app/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, request, userEmail } = body;

    // Validate required fields
    if (!type || !request || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields: type, request, and userEmail" },
        { status: 400 }
      );
    }

    const normalizedRequest = {
      id: request._id || request.id || Math.floor(Math.random() * 100000),
      movieId: request.movieId || "unknown",
      title: request.title || "Untitled",
      year: request.year || "Unknown",
      user: request.user || "N/A",
      status: type,
      createdAt: request.createdAt || new Date().toISOString(),
      userEmail,
    };

    let success = false;

    switch (type) {
      case "approved":
        success = await emailService.sendMovieApprovedNotification(
          normalizedRequest,
          userEmail
        );
        break;

      case "available":
        success = await emailService.sendMovieAvailableNotification(
          normalizedRequest,
          userEmail
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Notification sent successfully",
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to send notification",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Notifications] Error sending notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
