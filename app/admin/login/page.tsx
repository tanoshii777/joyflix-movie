"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // simple hardcoded password (replace later with env or DB)
    if (password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin/requests");
    } else {
      alert("Wrong password!");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 w-80"
      >
        <h1 className="text-xl font-bold">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="w-full py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
