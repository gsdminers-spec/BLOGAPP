import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
