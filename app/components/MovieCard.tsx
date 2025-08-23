"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import { toast } from "sonner"; // ✅ using Sonner

export default function MovieCard({
  movie,
  onSelect,
}: {
  movie: any;
  onSelect: (m: any) => void;
}) {
  const [views, setViews] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Load stored views + progress
  useEffect(() => {
    const savedViews = localStorage.getItem(`views_${movie.id}`);
    if (savedViews) setViews(parseInt(savedViews, 10));

    const savedProgress = localStorage.getItem("watch-progress");
    if (savedProgress) {
      const data = JSON.parse(savedProgress);
      if (data[movie.id]) {
        setProgress(data[movie.id].progress || 0);
      }
    }
  }, [movie.id]);

  // Just open modal (no increment here)
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
    <div className="group relative">
      <div
        onClick={handleClick}
        className="min-w-[150px] sm:min-w-0 cursor-pointer overflow-hidden rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
      >
        {/* Poster */}
        <div className="aspect-[2/3] w-full overflow-hidden rounded-lg">
          <Image
            src={movie.thumbnail}
            alt={movie.title}
            width={500}
            height={750}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dark overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex justify-between items-center">
          <h3 className="text-sm sm:text-base font-semibold">{movie.title}</h3>
          <div className="flex items-center gap-1 text-gray-300 text-xs">
            <Eye size={14} /> {views}
          </div>
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
    </div>
  );
}
