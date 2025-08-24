"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmailNotificationForm from "@/app/components/EmailNotificationForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showEmailForm, setShowEmailForm] = useState<{
    [key: number]: boolean;
  }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const router = useRouter();

  // Simple admin check
  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      router.push("/admin/login");
    }
  }, [router]);

  async function loadRequests() {
    console.log("[v0] Loading requests...");
    try {
      const res = await fetch("/api/request-movie", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("[v0] Loaded requests:", data);
        setRequests(data);
      } else {
        console.error("[v0] Failed to load requests:", res.status);
        toast.error("Failed to load requests");
      }
    } catch (error) {
      console.error("[v0] Error loading requests:", error);
      toast.error("Network error loading requests");
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id: number, status: string) {
    console.log(`[v0] Updating request ${id} to status: ${status}`);
    setLoading((prev) => ({ ...prev, [id]: true }));

    const originalRequest = requests.find((req) => req.id === id);

    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req))
    );

    try {
      const res = await fetch("/api/request-movie", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log("[v0] Request updated successfully:", responseData);
        toast.success(`✅ Request ${status} successfully`);

        setTimeout(() => {
          console.log("[v0] Reloading requests after update...");
          loadRequests();
        }, 500);
      } else {
        const errorData = await res.json();
        console.error("[v0] Failed to update status:", errorData);
        toast.error(`❌ Failed to ${status} request`);

        if (originalRequest) {
          setRequests((prev) =>
            prev.map((req) => (req.id === id ? originalRequest : req))
          );
        }
      }
    } catch (error) {
      console.error("[v0] Error updating status:", error);
      toast.error("Network error updating request");

      if (originalRequest) {
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? originalRequest : req))
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function deleteRequest(id: number) {
    console.log(`[v0] Deleting request ${id}`);
    setLoading((prev) => ({ ...prev, [id]: true }));

    const originalRequests = [...requests];

    setRequests((prev) => prev.filter((req) => req.id !== id));

    try {
      const res = await fetch("/api/request-movie", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log("[v0] Request deleted successfully:", responseData);
        toast.success("✅ Request deleted successfully");

        setTimeout(() => {
          console.log("[v0] Reloading requests after delete...");
          loadRequests();
        }, 500);
      } else {
        const errorData = await res.json();
        console.error("[v0] Failed to delete request:", errorData);
        toast.error("❌ Failed to delete request");

        setRequests(originalRequests);
      }
    } catch (error) {
      console.error("[v0] Error deleting request:", error);
      toast.error("Network error deleting request");

      setRequests(originalRequests);
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  function handleLogout() {
    localStorage.removeItem("isAdmin");
    toast.success("👋 Logged out successfully");
    router.push("/admin/login");
  }

  function goHome() {
    router.push("/");
  }

  const toggleEmailForm = (requestId: number) => {
    setShowEmailForm((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-600",
      approved: "bg-green-600",
      downloaded: "bg-blue-600",
    };
    return (
      <Badge
        className={`${
          variants[status as keyof typeof variants] || "bg-gray-600"
        } text-white`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Header row with title + buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📩 Movie Requests</h1>
        <div className="flex gap-2">
          <button
            onClick={goHome}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-800 text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {request.title}
                  </h3>
                  <p className="text-gray-400">
                    Year: {request.year} • Request ID: #{request.id}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Requested: {new Date(request.createdAt).toLocaleString()}
                  </p>
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
                  disabled={loading[request.id]}
                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[request.id] ? "..." : "Approve"}
                </button>
                <button
                  onClick={() => updateStatus(request.id, "downloaded")}
                  disabled={loading[request.id]}
                  className="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[request.id] ? "..." : "Downloaded"}
                </button>
                <button
                  onClick={() => deleteRequest(request.id)}
                  disabled={loading[request.id]}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[request.id] ? "..." : "Delete"}
                </button>
              </div>

              {showEmailForm[request.id] && (
                <EmailNotificationForm
                  request={request}
                  onNotificationSent={() => {
                    setShowEmailForm((prev) => ({
                      ...prev,
                      [request.id]: false,
                    }));
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
            <p className="text-sm">
              Requests will appear here when users submit them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
