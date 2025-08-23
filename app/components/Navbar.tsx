"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import {
  Search,
  X,
  User,
  Menu,
  Home,
  Film,
  Tv,
  LogOut,
  Sun,
  Moon,
  Bookmark,
} from "lucide-react";
import { movies } from "../moviesData";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      const filtered = movies
        .filter(
          (movie) =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleMovieSelect = (movieId: number) => {
    setMobileSearchOpen(false);
    setQuery("");
    setSearchResults([]);
    router.push(`/watch/${movieId}`);
  };

  const handleAdvancedSearch = () => {
    const searchQuery = query.trim();
    setMobileSearchOpen(false);
    setQuery("");
    setSearchResults([]);
    router.push(
      `/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`
    );
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
          <div className="flex items-center gap-2 sm:hidden">
            <button
              className="text-gray-300 hover:text-red-400"
              onClick={() => setMobileSearchOpen(true)}
            >
              <Search size={22} />
            </button>
            <button
              className="text-gray-300 hover:text-red-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Desktop Links */}
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
              href="/search"
              className="hover:text-red-400 transition flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link
              href="/watchlist"
              className="hover:text-red-400 transition flex items-center gap-1"
            >
              <Bookmark className="w-4 h-4" />
              Watchlist
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-red-400 transition flex items-center gap-1"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Theme toggle button for desktop */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400" />
            )}
          </button>

          {/* Auth actions */}
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-red-600">JoyFlix</h2>
            <button
              className="text-gray-400 hover:text-red-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 p-6">
            <nav className="space-y-6">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg hover:text-red-400 transition"
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              <Link
                href="/movies"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg hover:text-red-400 transition"
              >
                <Film className="w-5 h-5" />
                Movies
              </Link>
              <Link
                href="/series"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg hover:text-red-400 transition"
              >
                <Tv className="w-5 h-5" />
                Series
              </Link>
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg hover:text-red-400 transition"
              >
                <Search className="w-5 h-5" />
                Advanced Search
              </Link>
              <Link
                href="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg hover:text-red-400 transition"
              >
                <Bookmark className="w-5 h-5" />
                Watchlist
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg hover:text-red-400 transition"
              >
                <User className="w-5 h-5" />
                Dashboard
              </Link>
              {/* Theme toggle for mobile menu */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 text-lg hover:text-red-400 transition w-full text-left"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-5 h-5" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    Dark Mode
                  </>
                )}
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 text-lg text-red-500 hover:text-red-400 transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Search Movies</h2>
            <button
              className="text-gray-400 hover:text-red-400"
              onClick={() => {
                setMobileSearchOpen(false);
                setQuery("");
                setSearchResults([]);
              }}
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4">
            <input
              type="text"
              autoFocus
              placeholder="Search movies..."
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleSearch(e.target.value)
              }
              onKeyDown={(e) => e.key === "Enter" && handleAdvancedSearch()}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
            />
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleMovieSelect(movie.id)}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <img
                      src={movie.thumbnail || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {movie.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {movie.year} • {movie.category}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-700 mt-4 pt-4">
                  <button
                    onClick={handleAdvancedSearch}
                    className="w-full p-3 text-center text-red-400 hover:text-red-300 transition-colors bg-gray-800/30 rounded-lg"
                  >
                    View all results in Advanced Search
                  </button>
                </div>
              </div>
            ) : query.trim() ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  No movies found for "{query}"
                </p>
                <button
                  onClick={handleAdvancedSearch}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Try Advanced Search
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">
                  Start typing to search movies...
                </p>
                <button
                  onClick={handleAdvancedSearch}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Go to Advanced Search
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
