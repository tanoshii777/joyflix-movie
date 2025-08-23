"use client";

// app/movies/[id]/page.tsx

import { useParams } from "next/navigation";
import { movies } from "@/app/moviesData";

import Image from "next/image";
import Link from "next/link";

export default function MovieDetails() {
  const params = useParams();
  const movieId = Number(params.id);

  const movie = movies.find((m) => m.id === movieId);

  if (!movie) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        <p>Movie not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="flex justify-between items-center px-8 py-6">
        <Link
          href="/"
          className="text-red-500 font-bold text-xl hover:text-red-400"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">🎬 JoyFlix</h1>
      </header>

      <section className="px-6 py-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Poster */}
        <div className="rounded-lg overflow-hidden shadow-lg">
          <Image
            src={movie.thumbnail}
            alt={movie.title}
            width={500}
            height={750}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">{movie.title}</h2>
          <p className="text-gray-300 mb-6">
            This is a placeholder description for{" "}
            <span className="font-semibold">{movie.title}</span>. You can add
            genre, year, duration, rating, and storyline here.
          </p>

          {/* Play button */}
          <Link
            href={`/watch/${movie.id}`}
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ▶ Play Now
          </Link>
        </div>
      </section>
    </main>
  );
}
