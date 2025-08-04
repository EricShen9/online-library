import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'books.google.com',
        pathname: '/books/**',  // relaxed pattern
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        pathname: '/books/**',  // relaxed pattern
      },
      {
        protocol: 'https',
        hostname: 'books.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
