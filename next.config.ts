import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      // Google Cloud Storage bucket (image migration from Cloudinary)
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
    ],
  },
  // Proxy /backend/* → backend server (runs server-side, so localhost works from mobile too)
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
