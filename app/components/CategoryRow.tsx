"use client";

import { useState } from "react";
import QuickViewModal from "./QuickViewModal";

export default function CategoryRow({
  title,
  movies,
}: {
  title: string;
  movies: any[];
}) {
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <section className="px-6 py-6">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="min-w-[180px] relative cursor-pointer group"
            onClick={() => setSelectedMovie(movie)}
          >
            <img
              src={movie.thumbnail}
              alt={movie.title}
              className="rounded-lg shadow-md group-hover:scale-105 transition"
            />
          </div>
        ))}
      </div>

      {selectedMovie && (
        <QuickViewModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </section>
  );
}