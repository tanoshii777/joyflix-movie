"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface MovieRequest {
  _id: string
  movieId: string
  title: string
  year?: number
  user: string
  status: "pending" | "approved" | "downloaded" | "rejected"
  createdAt: string
  updatedAt: string
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<MovieRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showEmailForm, setShowEmailForm] = useState<{
    [key: string]: boolean
  }>({})
  const [emailData, setEmailData] = useState<{
    [key: string]: { email: string; type: string }
  }>({})
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean
  }>({})
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const router = useRouter()

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin")
    if (!isAdmin) {
      router.push("/admin/login")
      return
    }

    connectToRealTimeUpdates()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [router])

  const connectToRealTimeUpdates = () => {
    console.log("[v0] Connecting requests page to real-time updates...")
    const eventSource = new EventSource("/api/admin/events")
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log("[v0] Requests page real-time connection established")
      setIsRealTimeConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "requests_update") {
          setRequests(data.requests)
          setLoading(false)
        }
      } catch (error) {
        console.error("[v0] Error parsing SSE data:", error)
      }
    }

    eventSource.onerror = (error) => {
      console.error("[v0] SSE connection error:", error)
      setIsRealTimeConnected(false)

      // Retry connection after 5 seconds
      setTimeout(() => {
        connectToRealTimeUpdates()
      }, 5000)
    }
  }

  const approveRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to approve this request?")) return

    setActionLoading((prev) => ({ ...prev, [requestId]: true }))
    try {
      const response = await fetch("/api/request-movie", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: requestId, status: "approved" }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to approve request")
      }

      await fetchRequests()
      alert("Request approved successfully!")
    } catch (error) {
      console.error("Failed to approve request:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to approve request"
      alert(`Error: ${errorMessage}`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  const deleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) return

    setActionLoading((prev) => ({ ...prev, [requestId]: true }))
    try {
      const response = await fetch("/api/request-movie", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: requestId }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete request")
      }

      await fetchRequests()
      alert("Request deleted successfully!")
    } catch (error) {
      console.error("Failed to delete request:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete request"
      alert(`Error: ${errorMessage}`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  const markAsDownloaded = async (requestId: string) => {
    if (!confirm("Mark this request as downloaded?")) return

    setActionLoading((prev) => ({ ...prev, [requestId]: true }))
    try {
      const response = await fetch("/api/request-movie", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: requestId, status: "downloaded" }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to mark as downloaded")
      }

      await fetchRequests()
      alert("Request marked as downloaded successfully!")
    } catch (error) {
      console.error("Failed to mark as downloaded:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to mark as downloaded"
      alert(`Error: ${errorMessage}`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  const sendNotification = async (requestId: string) => {
    const emailInfo = emailData[requestId]
    if (!emailInfo?.email || !emailInfo?.type) {
      alert("Please fill in email and notification type")
      return
    }

    setActionLoading((prev) => ({ ...prev, [`email-${requestId}`]: true }))
    try {
      const request = requests.find((r) => r._id === requestId)

      if (!request) {
        alert("Request not found")
        return
      }

      const payload = {
        type: emailInfo.type,
        request: {
          _id: request._id,
          movieId: request.movieId,
          title: request.title,
          year: request.year,
          user: request.user,
          status: request.status,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        },
        userEmail: emailInfo.email,
      }

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send notification")
      }

      alert("Notification sent successfully!")
      setShowEmailForm((prev) => ({ ...prev, [requestId]: false }))
    } catch (error) {
      console.error("Failed to send notification:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to send notification"
      alert(`Error: ${errorMessage}`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [`email-${requestId}`]: false }))
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      localStorage.removeItem("isAdmin")
      window.location.href = "/admin/login"
    }
  }

  const toggleEmailForm = (requestId: string) => {
    setShowEmailForm((prev) => ({ ...prev, [requestId]: !prev[requestId] }))
    if (!emailData[requestId]) {
      setEmailData((prev) => ({
        ...prev,
        [requestId]: { email: "", type: "available" },
      }))
    }
  }

  const updateEmailData = (requestId: string, field: string, value: string) => {
    setEmailData((prev) => ({
      ...prev,
      [requestId]: { ...prev[requestId], [field]: value },
    }))
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      downloaded: "bg-blue-500",
      rejected: "bg-red-500",
    }
    return (
      <span
        className={`px-2 py-1 rounded text-white text-sm ${colors[status as keyof typeof colors] || "bg-gray-500"}`}
      >
        {status}
      </span>
    )
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/request-movie", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error("Error fetching requests:", error)
      alert("Failed to fetch requests. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading requests...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">📩</div>
          <h1 className="text-2xl font-bold">Movie Requests</h1>
          {isRealTimeConnected && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Back to Home
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">
            Logout
          </button>
        </div>
      </div>

      <div className="p-6">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No movie requests found</div>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{request.title}</h3>
                    <div className="text-gray-400 text-sm mt-1">
                      {request.year && `Year: ${request.year} • `}
                      Request ID: #{request._id.slice(-6)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Requested: {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(request.status)}
                    <button
                      onClick={() => toggleEmailForm(request._id)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                    >
                      {showEmailForm[request._id] ? "Hide Email" : "Send Email"}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => approveRequest(request._id)}
                    disabled={actionLoading[request._id] || request.status === "approved"}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    {actionLoading[request._id] ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => markAsDownloaded(request._id)}
                    disabled={actionLoading[request._id] || request.status === "downloaded"}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    {actionLoading[request._id] ? "Processing..." : "Downloaded"}
                  </button>
                  <button
                    onClick={() => deleteRequest(request._id)}
                    disabled={actionLoading[request._id]}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    {actionLoading[request._id] ? "Processing..." : "Delete"}
                  </button>
                </div>

                {showEmailForm[request._id] && (
                  <div className="bg-gray-700 rounded p-4 mt-4">
                    <h4 className="text-lg font-medium mb-3 flex items-center gap-2">📧 Send Email Notification</h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">User Email Address</label>
                        <input
                          type="email"
                          value={emailData[request._id]?.email || ""}
                          onChange={(e) => updateEmailData(request._id, "email", e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-blue-500"
                          placeholder="Enter user email address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Notification Type</label>
                        <select
                          value={emailData[request._id]?.type || "available"}
                          onChange={(e) => updateEmailData(request._id, "type", e.target.value)}
                          className="px-3 py-2 bg-blue-600 text-white rounded focus:outline-none focus:bg-blue-700"
                        >
                          <option value="available">📥 Available</option>
                          <option value="approved">✅ Approved</option>
                        </select>
                      </div>

                      <button
                        onClick={() => sendNotification(request._id)}
                        disabled={actionLoading[`email-${request._id}`]}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        {actionLoading[`email-${request._id}`]
                          ? "Sending..."
                          : `📤 Send ${
                              emailData[request._id]?.type === "approved" ? "Approved" : "Available"
                            } Notification`}
                      </button>

                      <div className="bg-blue-900 border border-blue-700 rounded p-3 text-sm">
                        <strong>Preview:</strong> This will send a{" "}
                        <span className="text-blue-300">movie {emailData[request._id]?.type || "available"}</span>{" "}
                        notification for "{request.title}" ({request.year})
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
