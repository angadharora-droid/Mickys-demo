import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // self-contained server in .next/standalone for the Docker image (Vercel ignores this setting)
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
