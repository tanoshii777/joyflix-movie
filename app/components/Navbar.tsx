"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { Search, X, User } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-8 py-4 bg-black/60 backdrop-blur-md">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-red-600 tracking-wide drop-shadow-md"
        >
          <span className="text-2xl sm:hidden">JoyFlix</span>
          <span className="hidden sm:inline text-4xl">JOYFLIX</span>
        </Link>

        {/* Navigation and Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            className="sm:hidden text-gray-300 hover:text-red-400"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search size={22} />
          </button>

          {/* Links */}
          <div className="hidden sm:flex gap-6">
            <Link href="/" className="hover:text-red-400 transition">
              Home
            </Link>
            <Link href="/movies" className="hover:text-red-400 transition">
              Movies
            </Link>
            <Link href="/series" className="hover:text-red-400 transition">
              Series
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-red-400 transition flex items-center gap-1"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Auth actions */}
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Search</h2>
            <button
              className="text-gray-400 hover:text-red-400"
              onClick={() => setMobileSearchOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <input
            type="text"
            autoFocus
            placeholder="Search movies..."
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            className="w-full px-4 py-3 rounded-lg bg-black/70 text-white outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      )}
    </>
  );
}
