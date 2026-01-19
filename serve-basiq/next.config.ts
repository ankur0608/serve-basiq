import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // Covers lh3, lh4, etc.
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Specific fallback
      },
      // ✅ ADDED: Whitelist ImageKit
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**', // Allow all paths under this domain
      },
      // ✅ NEW: Whitelist Cloudflare R2 (Fixes your logo error)
      {
        protocol: 'https',
        hostname: 'pub-d807c3325590438da8f5daa866be338b.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // reactCompiler: true, // Uncomment if you are using the experimental React Compiler
};

export default nextConfig;