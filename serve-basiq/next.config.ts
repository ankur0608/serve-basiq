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
    ],
  },
  // reactCompiler: true, // Uncomment if you are using the experimental React Compiler
};

export default nextConfig;