"use client";

import Link from "next/link";
import Image from "next/image";
import { movies } from "@/app/moviesData";

export default function AllMovies() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="flex justify-between items-center px-8 py-6">
        <Link href="/" className="text-red-500 font-bold text-xl hover:text-red-400">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">🎬 JoyFlix — All Movies</h1>
      </header>

      <section className="px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <Link key={movie.id} href={`/watch/${movie.id}`}>
              <div className="group bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform">
                <Image
                  src={movie.thumbnail}
                  alt={movie.title}
                  width={300}
                  height={450}
                  className="w-full h-auto object-cover"
                />
                <div className="p-3">
                  <h3 className="text-sm font-semibold">{movie.title}</h3>
                  <p className="text-xs text-gray-400">{movie.category}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
