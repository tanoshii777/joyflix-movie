"use client";

// app/components/MovieRow.tsx

import Image from "next/image";
import Link from "next/link";
import { movies } from "../moviesData";

export default function MovieRow({
  title,
  category,
}: {
  title: string;
  category: string;
}) {
  const filtered = movies.filter((m) => m.category === category);

  return (
    <section className="px-6 py-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex space-x-4 overflow-x-scroll scrollbar-hide">
        {filtered.map((movie) => (
          <Link key={movie.id} href={`/watch/${movie.id}`}>
            <div className="group relative min-w-[180px] cursor-pointer overflow-hidden rounded-lg shadow-lg hover:scale-105 transform transition duration-300">
              <Image
                src={movie.thumbnail}
                alt={movie.title}
                width={300}
                height={450}
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <h3 className="text-sm font-semibold">{movie.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}