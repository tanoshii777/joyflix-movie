"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const router = useRouter();

  // Simple admin check
  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      router.push("/admin/login");
    }
  }, [router]);

  async function loadRequests() {
    const res = await fetch("/api/request-movie");
    const data = await res.json();
    setRequests(data);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id: number, status: string) {
    await fetch("/api/request-movie", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadRequests();
  }

  async function deleteRequest(id: number) {
    await fetch("/api/request-movie", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadRequests();
  }

  function handleLogout() {
    localStorage.removeItem("isAdmin");
    router.push("/admin/login");
  }

  function goHome() {
    router.push("/");
  }

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

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="border border-gray-700 p-3 text-left">Title</th>
              <th className="border border-gray-700 p-3 text-left">Year</th>
              <th className="border border-gray-700 p-3 text-left">Status</th>
              <th className="border border-gray-700 p-3 text-left">
                Requested At
              </th>
              <th className="border border-gray-700 p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-gray-800 transition-colors duration-200"
              >
                <td className="border border-gray-700 p-3">{r.title}</td>
                <td className="border border-gray-700 p-3">{r.year}</td>
                <td className="border border-gray-700 p-3 capitalize">
                  {r.status}
                </td>
                <td className="border border-gray-700 p-3">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="border border-gray-700 p-3 flex gap-2">
                  <button
                    onClick={() => updateStatus(r.id, "approved")}
                    className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "downloaded")}
                    className="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                  >
                    Downloaded
                  </button>
                  <button
                    onClick={() => deleteRequest(r.id)}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-400 py-6 border border-gray-700"
                >
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
