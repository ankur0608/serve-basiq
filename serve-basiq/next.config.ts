import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 ADD THIS BLOCK TO FIX THE ERROR
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increases the limit for uploads
    },
  },

  images: {
    remotePatterns: [
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