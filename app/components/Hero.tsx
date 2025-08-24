"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import type { HeroProps } from "../types/movie";

export default function Hero({ movies }: HeroProps) {
  const [featuredMovie, setFeaturedMovie] = useState(movies[0]);
  const [isMuted, setIsMuted] = useState(true);
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-rotate banner
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (index + 1) % movies.length;
      setIndex(nextIndex);
      setFeaturedMovie(movies[nextIndex]);
    }, 10000); // 10s per movie
    return () => clearInterval(interval);
  }, [index, movies]);

  // Jump video to "climax" start time
  useEffect(() => {
    if (videoRef.current && featuredMovie?.startTime !== undefined) {
      videoRef.current.currentTime = featuredMovie.startTime;

      videoRef.current.play().catch((err) => {
        console.warn("Autoplay interrupted:", err);
      });
    }
  }, [featuredMovie]);

  return (
    <section className="relative h-[70vh] w-full flex items-end overflow-hidden">
      {/* 🎥 Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-50"
        src={featuredMovie.video}
      />

      {/* 🌫 Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* 🔊 Sound Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-87 right-4 z-20 bg-black/60 p-3 rounded-full hover:bg-black/80 transition"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>

      {/* 📄 Hero Content */}
      <div className="absolute bottom-16 left-4 right-4 sm:left-12 sm:right-auto max-w-md sm:max-w-xl z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={featuredMovie.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xl sm:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
              {featuredMovie.title}
            </h2>
            <p className="text-yellow-400 font-semibold text-sm sm:text-base">
              ⭐ {featuredMovie.rating || "8.5"} |{" "}
              {featuredMovie.year || "2023"}
            </p>
            <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-4">
              {featuredMovie.category}
            </p>
            <p className="text-gray-200 mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3 drop-shadow-md text-sm sm:text-base">
              {featuredMovie.description || "No description available."}
            </p>

            {/* ✅ Fixed Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Link
                href={`/watch/${featuredMovie.id}`}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm sm:text-base font-semibold text-center transition w-full sm:w-auto sm:max-w-[160px]"
              >
                ▶ Play Now
              </Link>
              <Link
                href={`/movies/${featuredMovie.id}`}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md text-sm sm:text-base font-semibold text-center transition w-full sm:w-auto sm:max-w-[160px]"
              >
                ℹ More Info
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ⏱ Progress Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {movies.map((_: any, i: number) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              i === index ? "bg-red-500 scale-125" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
