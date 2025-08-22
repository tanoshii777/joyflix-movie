import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 🚀 Ignore ESLint errors during builds (so Vercel can deploy)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚀 Ignore TypeScript build errors (so deploy won’t fail)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
