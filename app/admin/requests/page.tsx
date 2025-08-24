"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MovieRequest {
  _id: string;
  movieId: string;
  title: string;
  year?: number;
  user: string;
  status: "pending" | "approved" | "downloaded" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<MovieRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState<{
    [key: string]: boolean;
  }>({});
  const [emailData, setEmailData] = useState<{
    [key: string]: { email: string; type: string };
  }>({});
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    fetchRequests();
  }, [router]);

  const fetchRequests = async () => {
    try {
      console.log("[v0] Fetching movie requests...");
      const response = await fetch("/api/request-movie");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("[v0] Fetched requests:", data);
      setRequests(data);
    } catch (error) {
      console.error("[v0] Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      console.log("[v0] Approving request:", requestId);
      const response = await fetch("/api/request-movie", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: requestId, status: "approved" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to approve request");
      }

      console.log("[v0] Request approved successfully:", result);

      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "approved" } : req
        )
      );
      alert("Request approved successfully!");
    } catch (error) {
      console.error("[v0] Failed to approve request:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to approve request";
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      console.log("[v0] Deleting request:", requestId);
      const response = await fetch("/api/request-movie", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: requestId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete request");
      }

      console.log("[v0] Request deleted successfully:", result);

      setRequests((prev) => prev.filter((req) => req._id !== requestId));
      alert("Request deleted successfully!");
    } catch (error) {
      console.error("[v0] Failed to delete request:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete request";
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const markAsDownloaded = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      console.log("[v0] Marking as downloaded:", requestId);
      const response = await fetch("/api/request-movie", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: requestId, status: "downloaded" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to mark as downloaded");
      }

      console.log("[v0] Request marked as downloaded:", result);

      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "downloaded" } : req
        )
      );
      alert("Request marked as downloaded successfully!");
    } catch (error) {
      console.error("[v0] Failed to mark as downloaded:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to mark as downloaded";
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const sendNotification = async (requestId: string) => {
    const emailInfo = emailData[requestId];
    if (!emailInfo?.email || !emailInfo?.type) {
      alert("Please fill in email and notification type");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [`email-${requestId}`]: true }));
    try {
      console.log("[v0] Sending notification:", { requestId, emailInfo });
      const request = requests.find((r) => r._id === requestId);

      if (!request) {
        alert("Request not found");
        return;
      }

      // Backend expects: type, request (object), userEmail
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
      };

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send notification");
      }

      console.log("[v0] Notification sent successfully");
      alert("Notification sent successfully!");
      setShowEmailForm((prev) => ({ ...prev, [requestId]: false }));
    } catch (error) {
      console.error("[v0] Failed to send notification:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send notification";
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`email-${requestId}`]: false }));
    }
  };

  const toggleEmailForm = (requestId: string) => {
    setShowEmailForm((prev) => ({ ...prev, [requestId]: !prev[requestId] }));
    if (!emailData[requestId]) {
      setEmailData((prev) => ({
        ...prev,
        [requestId]: { email: "", type: "available" },
      }));
    }
  };

  const updateEmailData = (requestId: string, field: string, value: string) => {
    setEmailData((prev) => ({
      ...prev,
      [requestId]: { ...prev[requestId], [field]: value },
    }));
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      downloaded: "bg-blue-500",
      rejected: "bg-red-500",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-white text-sm ${
          colors[status as keyof typeof colors] || "bg-gray-500"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            📩
          </div>
          <h1 className="text-2xl font-bold">Movie Requests</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("isAdmin");
              router.push("/admin/login");
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
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
                    disabled={
                      actionLoading[request._id] ||
                      request.status === "approved"
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    {actionLoading[request._id] ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => markAsDownloaded(request._id)}
                    disabled={
                      actionLoading[request._id] ||
                      request.status === "downloaded"
                    }
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    {actionLoading[request._id]
                      ? "Processing..."
                      : "Downloaded"}
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
                    <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
                      Send Notification for:{" "}
                      <span className="text-yellow-400">{request.title}</span>
                    </h4>

                    <div className="flex flex-col gap-3 max-w-md">
                      <input
                        type="email"
                        placeholder="Recipient Email"
                        value={emailData[request._id]?.email || ""}
                        onChange={(e) =>
                          updateEmailData(request._id, "email", e.target.value)
                        }
                        className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      />

                      <select
                        value={emailData[request._id]?.type || "available"}
                        onChange={(e) =>
                          updateEmailData(request._id, "type", e.target.value)
                        }
                        className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      >
                        <option value="available">Movie Available</option>
                        <option value="unavailable">Movie Unavailable</option>
                        <option value="download">Download Link</option>
                        <option value="other">Other</option>
                      </select>

                      <button
                        onClick={() => sendNotification(request._id)}
                        disabled={actionLoading[`email-${request._id}`]}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-black font-semibold transition-colors"
                      >
                        {actionLoading[`email-${request._id}`]
                          ? "Sending..."
                          : "Send Notification"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
