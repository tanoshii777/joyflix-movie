"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

interface Notification {
  _id: string
  userId: string
  type: "info" | "success" | "warning" | "error" | "movie_request" | "movie_available" | "system" | "admin"
  title: string
  message: string
  data?: any
  read: boolean
  readAt?: string
  priority: "low" | "normal" | "high" | "urgent"
  category: "general" | "movie" | "account" | "system" | "admin"
  actionUrl?: string
  actionText?: string
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pagination, setPagination] = useState<any>(null)

  const fetchNotifications = async (
    options: {
      page?: number
      limit?: number
      filter?: "all" | "unread" | "read"
      type?: string
      category?: string
    } = {},
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(options).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const response = await fetch(`/api/notifications/in-app?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string | string[]) => {
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds]

      const response = await fetch("/api/notifications/in-app", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: ids, read: true }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (ids.includes(n._id) ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
        )
        setUnreadCount((prev) => Math.max(0, prev - ids.length))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id)
      if (unreadIds.length === 0) return

      await markAsRead(unreadIds)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const createNotification = async (notification: Omit<Notification, "_id" | "read" | "readAt" | "createdAt">) => {
    try {
      const response = await fetch("/api/notifications/in-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      })

      if (response.ok) {
        fetchNotifications()

        const toastConfig = {
          description: notification.message,
          duration: notification.priority === "urgent" ? 10000 : 4000,
        }

        switch (notification.type) {
          case "success":
            toast.success(notification.title, toastConfig)
            break
          case "error":
            toast.error(notification.title, toastConfig)
            break
          case "warning":
            toast.warning(notification.title, toastConfig)
            break
          default:
            toast.info(notification.title, toastConfig)
        }
      }
    } catch (error) {
      console.error("Failed to create notification:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()

    const eventSource = new EventSource("/api/admin/events")

    eventSource.addEventListener("notification", (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "new_notification") {
        fetchNotifications()
      }
    })

    return () => {
      eventSource.close()
    }
  }, [])

  return {
    notifications,
    loading,
    unreadCount,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
  }
}
