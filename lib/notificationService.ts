import dbConnect from "./dbConnect"
import Notification from "../models/Notification"
import NotificationPreference from "../models/NotificationPreference"
import User from "../models/User"
import { emailService } from "./email"
import { realTimeManager } from "./realtime-manager"

interface CreateNotificationData {
  userId: string
  type: "info" | "success" | "warning" | "error" | "movie_request" | "movie_available" | "system" | "admin"
  title: string
  message: string
  data?: any
  priority?: "low" | "normal" | "high" | "urgent"
  category?: "general" | "movie" | "account" | "system" | "admin"
  expiresAt?: Date
  actionUrl?: string
  actionText?: string
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData) {
    try {
      await dbConnect()

      // Create notification in database
      const notification = new Notification(data)
      await notification.save()

      // Get user preferences
      const preferences = await NotificationPreference.findOne({ userId: data.userId })
      const user = await User.findById(data.userId)

      if (!user) return notification

      // Send real-time notification via SSE
      realTimeManager.broadcast("notification", {
        type: "new_notification",
        notification: notification.toObject(),
        userId: data.userId,
      })

      // Send email notification if enabled
      if (preferences?.email && this.shouldSendEmail(data.type, preferences.email)) {
        await this.sendEmailNotification(user, notification)
      }

      // Send push notification if enabled
      if (preferences?.push && this.shouldSendPush(data.type, preferences.push)) {
        await this.sendPushNotification(user, notification)
      }

      return notification
    } catch (error) {
      console.error("Failed to create notification:", error)
      throw error
    }
  }

  static async createBulkNotification(userIds: string[], data: Omit<CreateNotificationData, "userId">) {
    try {
      await dbConnect()

      const notifications = userIds.map((userId) => ({
        ...data,
        userId,
      }))

      const createdNotifications = await Notification.insertMany(notifications)

      // Send real-time updates
      createdNotifications.forEach((notification) => {
        realTimeManager.broadcast("notification", {
          type: "new_notification",
          notification: notification.toObject(),
          userId: notification.userId,
        })
      })

      return createdNotifications
    } catch (error) {
      console.error("Failed to create bulk notifications:", error)
      throw error
    }
  }

  static async getUserNotifications(
    userId: string,
    options: {
      page?: number
      limit?: number
      filter?: "all" | "unread" | "read"
      type?: string
      category?: string
    } = {},
  ) {
    try {
      await dbConnect()

      const { page = 1, limit = 20, filter = "all", type, category } = options

      const query: any = { userId }

      if (filter === "unread") query.read = false
      if (filter === "read") query.read = true
      if (type && type !== "all") query.type = type
      if (category && category !== "all") query.category = category

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean()

      const total = await Notification.countDocuments(query)
      const unreadCount = await Notification.countDocuments({ userId, read: false })

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      }
    } catch (error) {
      console.error("Failed to get user notifications:", error)
      throw error
    }
  }

  static async markAsRead(notificationIds: string[], userId: string) {
    try {
      await dbConnect()

      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId },
        {
          read: true,
          readAt: new Date(),
        },
      )

      // Send real-time update
      realTimeManager.broadcast("notification", {
        type: "notifications_read",
        notificationIds,
        userId,
      })

      return true
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
      throw error
    }
  }

  static async cleanupExpiredNotifications() {
    try {
      await dbConnect()

      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() },
      })

      console.log(`Cleaned up ${result.deletedCount} expired notifications`)
      return result.deletedCount
    } catch (error) {
      console.error("Failed to cleanup expired notifications:", error)
      throw error
    }
  }

  private static shouldSendEmail(type: string, emailPrefs: any): boolean {
    switch (type) {
      case "movie_request":
      case "movie_available":
        return emailPrefs.movieRequests || emailPrefs.movieAvailable
      case "system":
        return emailPrefs.systemUpdates
      case "admin":
        return emailPrefs.adminMessages
      default:
        return true
    }
  }

  private static shouldSendPush(type: string, pushPrefs: any): boolean {
    switch (type) {
      case "movie_request":
      case "movie_available":
        return pushPrefs.movieRequests || pushPrefs.movieAvailable
      case "system":
        return pushPrefs.systemUpdates
      case "admin":
        return pushPrefs.adminMessages
      default:
        return true
    }
  }

  private static async sendEmailNotification(user: any, notification: any) {
    try {
      if (notification.type === "movie_available" && notification.data?.request) {
        await emailService.sendMovieAvailableNotification(notification.data.request, user.email)
      } else if (notification.type === "movie_request" && notification.data?.request) {
        await emailService.sendMovieApprovedNotification(notification.data.request, user.email)
      }
    } catch (error) {
      console.error("Failed to send email notification:", error)
    }
  }

  private static async sendPushNotification(user: any, notification: any) {
    try {
      if (!user.pushSubscription) return

      const payload = {
        title: notification.title,
        body: notification.message,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        data: {
          notificationId: notification._id,
          actionUrl: notification.actionUrl,
          type: notification.type,
        },
      }

      // This would integrate with web-push library
      console.log("Would send push notification:", payload)
    } catch (error) {
      console.error("Failed to send push notification:", error)
    }
  }
}
