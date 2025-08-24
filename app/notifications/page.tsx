"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, CheckCheck, Filter } from "lucide-react"
import NavbarWrapper from "../components/NavbarWrapper"
import { useNotifications } from "../hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications()
  const [user, setUser] = useState<any>(null)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          router.replace("/login")
        }
      } catch (err) {
        router.replace("/login")
      }
    }
    checkAuth()
  }, [router])

  if (!user) {
    return (
      <main className="flex items-center justify-center h-screen text-white bg-black">
        <p>Loading...</p>
      </main>
    )
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread" && notification.read) return false
    if (filter === "read" && !notification.read) return false
    if (typeFilter !== "all" && notification.type !== typeFilter) return false
    return true
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      case "movie_request":
        return "🎬"
      case "movie_available":
        return "🍿"
      case "system":
        return "⚙️"
      default:
        return "ℹ️"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NavbarWrapper />

      <div className="pt-20 px-4 sm:px-6">
        {/* Header */}
        <div className="py-8 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span>{notifications.length} total notifications</span>
            <span>•</span>
            <span>{unreadCount} unread</span>
          </div>
        </div>

        {/* Filters */}
        <div className="py-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value="all">All notifications</option>
              <option value="unread">Unread only</option>
              <option value="read">Read only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value="all">All types</option>
              <option value="movie_request">Movie Requests</option>
              <option value="movie_available">Movie Available</option>
              <option value="system">System</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3 pb-8">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors border-l-4 ${
                  !notification.read ? "border-blue-500 bg-blue-900/10" : "border-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-300 mb-2">{notification.message}</p>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          notification.type === "success"
                            ? "bg-green-900/50 text-green-300"
                            : notification.type === "error"
                              ? "bg-red-900/50 text-red-300"
                              : notification.type === "warning"
                                ? "bg-yellow-900/50 text-yellow-300"
                                : notification.type === "movie_request"
                                  ? "bg-purple-900/50 text-purple-300"
                                  : notification.type === "movie_available"
                                    ? "bg-blue-900/50 text-blue-300"
                                    : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {notification.type.replace("_", " ")}
                      </span>
                      {!notification.read && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">New</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No notifications found</h2>
            <p className="text-gray-400 mb-6">
              {filter === "unread"
                ? "All caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors"
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
