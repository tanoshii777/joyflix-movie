"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react"; // ✅ add icons

import { movies } from "./moviesData";
import Hero from "./components/Hero";
import QuickViewModal from "./components/QuickViewModal";
import Footer from "./components/Footer";
import MovieCard from "./components/MovieCard";
import type { Movie } from "./types/movie";

const categories: string[] = [
  "Action",
  "Romance",
  "Horror",
  "Sci-Fi",
  "Drama",
  "Animation",
  "True Crime",
  "Thriller",
  "Fantasy",
];

type User = {
  email: string;
  username?: string;
};

export default function HomePage() {
  const router = useRouter();

  // 🔒 Auth states
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 🎬 Page states
  const [query, setQuery] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [topViewed, setTopViewed] = useState<Movie[]>([]);
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>(() =>
    Object.fromEntries(categories.map((c) => [c, 5]))
  );

  // 🔍 Mobile search overlay
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // 🔒 Check authentication via API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUser(data.user);
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/login");
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  // Load top viewed movies
  useEffect(() => {
    if (!isLoggedIn) return;

    const viewsData: Record<string, number> = {};
    movies.forEach((m) => {
      const count = localStorage.getItem(`views-${m.id}`);
      viewsData[m.id] = count ? Number.parseInt(count) : 0;
    });

    const sorted = [...movies].sort(
      (a, b) => (viewsData[b.id] || 0) - (viewsData[a.id] || 0)
    );

    const top = sorted.filter((m) => viewsData[m.id] > 0).slice(0, 10);
    setTopViewed(top);
  }, [isLoggedIn, selectedMovie]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Prevent UI flash before auth check
  if (!authChecked) {
    return (
      <main className="flex items-center justify-center h-screen text-white">
        <p>Loading...</p>
      </main>
    );
  }

  if (!isLoggedIn) return null;

  // ✅ Normal HomePage logic
  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  const loadMore = (category: string) => {
    setVisibleCount((prev) => ({
      ...prev,
      [category]: prev[category] + 5,
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-8 py-4 bg-black/60 backdrop-blur-md">
        {/* Logo + Greeting */}
        <div className="flex flex-col">
          <h1 className="font-bold text-red-600 tracking-wide drop-shadow-md">
            <span className="text-2xl sm:hidden">JoyFlix</span>
            <span className="hidden sm:inline text-4xl">JOYFLIX</span>
          </h1>
          {user && (
            <p className="text-sm text-gray-300 mt-1">
              Hi, {user.username ?? user.email}
            </p>
          )}
        </div>

        {/* 🔍 Search Bar (desktop only) */}
        <div className="relative w-full max-w-md ml-6 hidden sm:block">
          <input
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg bg-black/70 text-white outline-none focus:ring-2 focus:ring-red-500"
          />
          {query && (
            <div className="absolute mt-2 w-full bg-black/90 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      setSelectedMovie(movie);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-red-600/30 rounded cursor-pointer"
                  >
                    <Image
                      src={movie.thumbnail || "/placeholder.svg"}
                      alt={movie.title}
                      width={50}
                      height={75}
                      className="rounded"
                    />
                    <p>{movie.title}</p>
                  </div>
                ))
              ) : (
                <p className="p-3 text-gray-400">No results found.</p>
              )}
            </div>
          )}
        </div>

        {/* Mobile: Search Icon + Nav + Logout */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile search icon */}
          <button
            className="sm:hidden text-gray-300 hover:text-red-400"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search size={22} />
          </button>

          {/* Nav (desktop only) */}
          <nav className="space-x-6 hidden sm:flex">
            <a href="#" className="hover:text-red-400 transition">
              Home
            </a>
            <a href="#" className="hover:text-red-400 transition">
              Movies
            </a>
            <a href="#" className="hover:text-red-400 transition">
              Series
            </a>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* 🔍 Mobile Search Overlay */}
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

          {query && (
            <div className="mt-4 w-full bg-black/90 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      setSelectedMovie(movie);
                      setQuery("");
                      setMobileSearchOpen(false);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-red-600/30 rounded cursor-pointer"
                  >
                    <Image
                      src={movie.thumbnail || "/placeholder.svg"}
                      alt={movie.title}
                      width={50}
                      height={75}
                      className="rounded"
                    />
                    <p>{movie.title}</p>
                  </div>
                ))
              ) : (
                <p className="p-3 text-gray-400">No results found.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hero Banner */}
      <Hero movies={movies} />

      {/* 🔥 Top Viewed */}
      {topViewed.length > 0 && (
        <section className="px-6 py-8">
          <h2 className="text-2xl font-bold mb-6">🔥 Top Viewed</h2>
          <div className="flex gap-4 overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 scrollbar-hide">
            {topViewed.map((movie, index) => (
              <div key={movie.id} className="relative">
                <span className="absolute -top-3 -left-3 bg-red-600 text-white font-bold text-lg w-8 h-8 flex items-center justify-center rounded-full shadow-md">
                  {index + 1}
                </span>
                <MovieCard movie={movie} onSelect={setSelectedMovie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <div className="pt-6 sm:pt-12">
        {categories.map((category) => {
          const categoryMovies = movies.filter((m) => m.category === category);
          if (categoryMovies.length === 0) return null;

          const visibleMovies = categoryMovies.slice(0, visibleCount[category]);

          return (
            <section key={category} className="px-6 py-8">
              <h2 className="text-xl font-semibold mb-6">{category}</h2>
              <div className="flex gap-4 overflow-x-auto sm:overflow-visible sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 scrollbar-hide">
                {visibleMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={setSelectedMovie}
                  />
                ))}
              </div>

              {visibleMovies.length < categoryMovies.length && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => loadMore(category)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded-lg text-white font-semibold"
                  >
                    Load More
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Quick View Modal */}
      {selectedMovie && (
        <QuickViewModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {/* Footer */}
      <Footer />
    </main>
  );
}
