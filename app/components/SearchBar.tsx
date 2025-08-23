"use client";

// app/components/SearchBar.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { movies } from "../moviesData";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-md mx-auto my-6">
      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-black/70 text-white outline-none focus:ring-2 focus:ring-red-500"
      />

      {query && (
        <div className="absolute mt-2 w-full bg-black/90 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
              <Link
                key={movie.id}
                href={`/watch/${movie.id}`}
                className="flex items-center gap-3 p-2 hover:bg-red-600/30 rounded"
              >
                <Image
                  src={movie.thumbnail}
                  alt={movie.title}
                  width={50}
                  height={75}
                  className="rounded"
                />
                <p>{movie.title}</p>
              </Link>
            ))
          ) : (
            <p className="p-3 text-gray-400">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
