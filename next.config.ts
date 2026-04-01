import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
