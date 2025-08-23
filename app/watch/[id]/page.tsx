"use client";

import { useParams } from "next/navigation";
import { movies } from "@/app/moviesData";
import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { toast } from "sonner";

export default function WatchMovie() {
  const params = useParams();
  const movieId = Number((params as any).id);

  const movie = movies.find((m) => m.id === movieId);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Restore saved progress
  useEffect(() => {
    const saved = localStorage.getItem(`progress-${movieId}`);
    if (saved && videoRef.current) {
      const { time } = JSON.parse(saved);
      videoRef.current.currentTime = time;
    }
  }, [movieId]);

  // Save progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = {
        time: videoRef.current.currentTime,
        duration: videoRef.current.duration,
      };
      localStorage.setItem(`progress-${movieId}`, JSON.stringify(progress));
    }
  };

  // Clear when finished
  const handleEnded = () => {
    localStorage.removeItem(`progress-${movieId}`);
  };

  // Increment views
  const handleFirstPlay = () => {
    const viewsKey = `views_${movieId}`;
    const playedKey = `played_${movieId}`;

    if (!sessionStorage.getItem(playedKey)) {
      const currentViews = parseInt(localStorage.getItem(viewsKey) || "0", 10);
      localStorage.setItem(viewsKey, (currentViews + 1).toString());
      sessionStorage.setItem(playedKey, "true");
    }
  };

  if (!movie) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white bg-black">
        <p>Movie not found.</p>
      </main>
    );
  }

  const handlePlayNow = async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      if (videoRef.current.requestFullscreen) {
        await videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitEnterFullscreen) {
        (videoRef.current as any).webkitEnterFullscreen();
      }
    } catch (e) {
      console.error("Autoplay failed:", e);
    }
  };

  const handleRequestMovie = async () => {
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
        toast("🎬 Request Sent", {
          description: `${movie.title} has been requested successfully.`,
        });
      } else {
        toast("❌ Error", {
          description: "Something went wrong while sending your request.",
        });
      }
    } catch (err) {
      toast("⚠️ Network Error", {
        description: "Failed to connect to server. Try again later.",
      });
    }
  };

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

      <section className="px-6 py-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        <div className="rounded-lg overflow-hidden shadow-lg">
          <Image
            src={movie.thumbnail}
            alt={movie.title}
            width={500}
            height={750}
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">{movie.title}</h2>
          <p className="text-gray-300 mb-2">📅 {movie.year}</p>
          <p className="text-gray-300 mb-6">{movie.description}</p>

          <div className="flex gap-4">
            <button
              onClick={handlePlayNow}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              ▶ Start Watching
            </button>

            <button
              onClick={handleRequestMovie}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              📩 Request Movie
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-10 max-w-6xl mx-auto flex flex-col">
        <video
          ref={videoRef}
          controls
          className="w-full rounded-lg shadow-lg"
          poster={movie.thumbnail}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={handleFirstPlay}
        >
          <source src={movie.video} type="video/mp4" />
          {movie.subtitle && (
            <track
              src={movie.subtitle}
              kind="subtitles"
              srcLang="en"
              label="English"
              default
            />
          )}
          Your browser does not support the video tag.
        </video>
      </section>
    </main>
  );
}
