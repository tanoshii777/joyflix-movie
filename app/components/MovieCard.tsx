"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

export default function MovieCard({
  movie,
  onSelect,
}: {
  movie: any;
  onSelect: (m: any) => void;
}) {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const savedProgress = localStorage.getItem("watch-progress");
    if (savedProgress) {
      const data = JSON.parse(savedProgress);
      if (data[movie.id]) {
        setProgress(data[movie.id].progress || 0);
      }
    }
  }, [movie.id]);

  const handleClick = () => {
    onSelect(movie);
  };

  async function handleRequest() {
    try {
      const res = await fetch("/api/request-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movie.id,
          title: movie.title,
          year: movie.year,
          user: "guest",
        }),
      });

      if (res.ok) {
        toast(`🎬 Request sent`, {
          description: `${movie.title} has been requested successfully.`,
        });
      } else {
        toast(`❌ Error`, {
          description: "Something went wrong while sending your request.",
        });
      }
    } catch (err) {
      toast(`⚠️ Network Error`, {
        description: "Failed to connect to server. Try again later.",
      });
    }
  }

  return (
    <div
      onClick={handleClick}
      className="group relative min-w-[150px] sm:min-w-0 cursor-pointer 
                 overflow-hidden rounded-lg shadow-lg 
                 transform transition duration-300 hover:scale-105 hover:shadow-xl"
    >
      {/* Poster */}
      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg">
        <Image
          src={movie.thumbnail || "/placeholder.svg"}
          alt={movie.title}
          width={500}
          height={750}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Glassy Circle with Play Button */}
        <div
          className="w-18 h-18 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center 
               shadow-lg border-2 border-white 
               opacity-0 scale-90 transition-all duration-500 ease-in-out
               group-hover:opacity-100 group-hover:scale-110 
               group-hover:border-red-600 group-hover:shadow-white-500/50"
        >
          {/* Red Play Triangle */}
          <div
            className="w-0 h-0 border-l-[24px] border-l-red-600 border-y-[14px] border-y-transparent 
                 opacity-0 transition-all duration-500 ease-in-out
                 group-hover:opacity-100 group-hover:border-l-red"
          ></div>
        </div>
      </div>

      <div className="absolute top-2 left-2">
        <span className="bg-red-600/90 text-white text-xs px-2 py-1 rounded-full font-medium">
          {movie.category}
        </span>
      </div>

      {movie.year && (
        <div className="absolute top-2 right-2">
          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {movie.year}
          </span>
        </div>
      )}

      {/* Title */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <h3 className="text-sm sm:text-base font-semibold">{movie.title}</h3>
        {movie.duration && (
          <p className="text-xs text-gray-300 mt-1">{movie.duration} min</p>
        )}
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
          <div
            className="h-1 bg-red-600"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
