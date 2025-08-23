"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EmailNotificationForm from "@/app/components/EmailNotificationForm"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, EyeOff } from "lucide-react"

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showEmailForm, setShowEmailForm] = useState<{ [key: number]: boolean }>({})
  const router = useRouter()

  // Simple admin check
  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      router.push("/admin/login")
    }
  }, [router])

  async function loadRequests() {
    const res = await fetch("/api/request-movie")
    const data = await res.json()
    setRequests(data)
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function updateStatus(id: number, status: string) {
    await fetch("/api/request-movie", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    loadRequests()
  }

  async function deleteRequest(id: number) {
    await fetch("/api/request-movie", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadRequests()
  }

  function handleLogout() {
    localStorage.removeItem("isAdmin")
    router.push("/admin/login")
  }

  function goHome() {
    router.push("/")
  }

  const toggleEmailForm = (requestId: number) => {
    setShowEmailForm((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-600",
      approved: "bg-green-600",
      downloaded: "bg-blue-600",
    }
    return (
      <Badge className={`${variants[status as keyof typeof variants] || "bg-gray-600"} text-white`}>{status}</Badge>
    )
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Header row with title + buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📩 Movie Requests</h1>
        <div className="flex gap-2">
          <button onClick={goHome} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">
            Back to Home
          </button>
          <button onClick={handleLogout} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-800 text-white text-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{request.title}</h3>
                  <p className="text-gray-400">
                    Year: {request.year} • Request ID: #{request.id}
                  </p>
                  <p className="text-gray-400 text-sm">Requested: {new Date(request.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(request.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleEmailForm(request.id)}
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {showEmailForm[request.id] ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide Email
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-1" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => updateStatus(request.id, "approved")}
                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(request.id, "downloaded")}
                  className="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                >
                  Downloaded
                </button>
                <button
                  onClick={() => deleteRequest(request.id)}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Delete
                </button>
              </div>

              {showEmailForm[request.id] && (
                <EmailNotificationForm
                  request={request}
                  onNotificationSent={() => {
                    setShowEmailForm((prev) => ({ ...prev, [request.id]: false }))
                  }}
                />
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg border border-gray-700">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg">No movie requests yet.</p>
            <p className="text-sm">Requests will appear here when users submit them.</p>
          </div>
        )}
      </div>
    </div>
  )
}
