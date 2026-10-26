import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // self-contained server in .next/standalone for the Docker image (Vercel ignores this setting)
  output: "standalone",
  images: {
    // WebP only: on-the-fly AVIF encoding (sharp/libvips) is slow and the biggest memory spike on the server
    formats: ["image/webp"],
    // keep optimized images for 31 days so each size is encoded once, not again every few hours
    minimumCacheTTL: 2678400,
  },
  // Single-container deploy (root Dockerfile): the backend API runs beside the site on 127.0.0.1,
  // and is reached through the site at /backend/*. Off everywhere else (BACKEND_INTERNAL_URL unset).
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL;
    return backend ? [{ source: "/backend/:path*", destination: `${backend}/api/:path*` }] : [];
  },
};

export default nextConfig;
