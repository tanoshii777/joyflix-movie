"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("❌ " + (data.error || "Login failed"));
        return;
      }

      localStorage.setItem("auth", "true");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("⚠️ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
      {/* 🎥 Background */}
      <div className="absolute inset-0">
        <img
          src="/background/background-image.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay with gradient for cinematic effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/90" />
      </div>

      {/* Logo top-left */}
      <div className="absolute top-6 left-8 z-10">
        <h1 className="text-4xl font-extrabold text-red-600 drop-shadow-lg">
          JoyFlix
        </h1>
      </div>

      {/* Centered Login Box */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-black/75 p-10 rounded-lg shadow-lg backdrop-blur-md"
        >
          <h2 className="text-3xl font-bold mb-6">Sign In</h2>

          <div className="mb-4">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or Username"
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-red-600" /> Remember me
            </label>
            <Link href="#" className="hover:underline">
              Forgot password?
            </Link>
          </div>

          <p className="text-center text-gray-400 mt-6">
            New to JoyFlix?{" "}
            <Link href="/register" className="text-red-400 hover:underline">
              Sign up now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
