"use client";
import { useState } from "react";
import type React from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("isAdmin", "true");
        toast.success("✅ Admin login successful!");
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        toast.error("❌ " + (data.error || "Invalid admin password"));
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("❌ Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
      <div className="auth-card rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">JoyFlix Admin</h1>
          <p className="text-gray-400">Enter admin password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-focus w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button-hover w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login to Admin Panel"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
