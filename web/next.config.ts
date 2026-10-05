import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // self-contained server in .next/standalone for the Docker image (Vercel ignores this setting)
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Single-container deploy (root Dockerfile): the backend API runs beside the site on 127.0.0.1,
  // and is reached through the site at /backend/*. Off everywhere else (BACKEND_INTERNAL_URL unset).
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL;
    return backend ? [{ source: "/backend/:path*", destination: `${backend}/api/:path*` }] : [];
  },
};

export default nextConfig;
