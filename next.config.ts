import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // Announcement/event image uploads (default 1mb is too small)
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
