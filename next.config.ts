import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["image.tmdb.org"],
  },
  // ✅ Disable Dev Tools overlay
  devIndicators: false,
};

export default nextConfig;
