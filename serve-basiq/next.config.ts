import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existing Server Actions Config
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  images: {
    remotePatterns: [
      // 👇 NEWLY ADDED DOMAINS
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // 👇 YOUR EXISTING DOMAINS
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-d807c3325590438da8f5daa866be338b.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;