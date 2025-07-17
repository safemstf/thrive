// next.config.ts (TypeScript)
import type { NextConfig } from 'next';

const nextConfigTS: NextConfig = {
  // Enable styled-components support
  compiler: {
    styledComponents: true,
  },

  images: {
    // Enable default optimization in production
    unoptimized: false,
    remotePatterns: [
      // Frontend domain serving uploads directly
      {
        protocol: 'https',
        hostname: 'www.learnmorra.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'learnmorra.com',
        pathname: '/uploads/**',
      },
      // Local backend (if needed)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      // Ngrok tunnels
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
      // Specific ngrok URL
      {
        protocol: 'http',
        hostname: '60a90cb1d075.ngrok-free.app',
        pathname: '/uploads/**',
      },
      // Placeholder service (allow both HTTP/HTTPS)
      {
        protocol: 'http',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      // Production API domain
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
