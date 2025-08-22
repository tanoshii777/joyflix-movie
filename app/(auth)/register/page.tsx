"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, username, email, password }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="relative min-h-screen w-full text-white">
      {/* 🎥 Background */}
      <div className="absolute inset-0">
        <img
          src="/background/background-image.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" /> {/* dark overlay */}
      </div>

      {/* Logo top-left */}
      <div className="absolute top-6 left-8 z-10">
        <h1 className="text-4xl font-bold text-red-600">JoyFlix</h1>
      </div>

      {/* Centered Register Box */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-lg bg-black/75 p-10 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">
            Create Your JoyFlix Account
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
            required
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-semibold transition"
          >
            Register
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-red-400 hover:underline">
              Login
            </Link>
          </p>

          {message && (
            <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
