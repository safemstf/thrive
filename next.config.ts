
// next.config.ts (TypeScript)
import type { NextConfig } from 'next';

const nextConfigTS: NextConfig = {
  // Enable styled-components support
  compiler: {
    styledComponents: true,
  },

  images: {
    // Use default optimization in production
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '**.ngrok-free.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.ngrok-free.app',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '60a90cb1d075.ngrok-free.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.learnmorra.com',
        pathname: '/uploads/**',
      },
    ],
  },

  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfigTS;
