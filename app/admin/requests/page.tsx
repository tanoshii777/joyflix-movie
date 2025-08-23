"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const router = useRouter();

  // Simple auth check (replace later with cookie-based if you want stronger)
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

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl mb-4">Movie Requests</h1>
      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr>
            <th className="border border-gray-700 p-2">Title</th>
            <th className="border border-gray-700 p-2">Year</th>
            <th className="border border-gray-700 p-2">Status</th>
            <th className="border border-gray-700 p-2">Requested At</th>
            <th className="border border-gray-700 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td className="border border-gray-700 p-2">{r.title}</td>
              <td className="border border-gray-700 p-2">{r.year}</td>
              <td className="border border-gray-700 p-2">{r.status}</td>
              <td className="border border-gray-700 p-2">
                {new Date(r.createdAt).toLocaleString()}
              </td>
              <td className="border border-gray-700 p-2 flex gap-2">
                <button
                  onClick={() => updateStatus(r.id, "approved")}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(r.id, "downloaded")}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded"
                >
                  Mark Downloaded
                </button>
                <button
                  onClick={() => deleteRequest(r.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
