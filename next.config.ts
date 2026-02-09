import type { NextConfig } from "next";

basePath: '/admin',
  trailingSlash: true,
    output: 'export',
      images: {
  unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'horizons-cdn.hostinger.com' },
    ],
  },
};

export default nextConfig;

