"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear session/token (for now just localStorage or cookie)
    localStorage.removeItem("token"); // example
    router.push("/login"); // redirect to login page
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-black text-white">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-red-600">
        JOYFLIX
      </Link>

      {/* Links */}
      <div className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/movies">Movies</Link>
        <Link href="/series">Series</Link>
      </div>

      {/* Auth actions */}
      <div className="flex gap-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}