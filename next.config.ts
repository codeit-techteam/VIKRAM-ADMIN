import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "recharts",
      "date-fns",
    ],
  },
};

export default nextConfig;
