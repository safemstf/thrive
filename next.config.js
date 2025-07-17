// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      // For local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      // For ngrok tunnels (allow any subdomain)
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
      // Your specific ngrok URL
      {
        protocol: 'http',
        hostname: '60a90cb1d075.ngrok-free.app',
        pathname: '/uploads/**',
      },
      // For placeholder images
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      // Add your production domain when ready
      {
        protocol: 'https',
        hostname: 'api.learnmorra.com',
        pathname: '/uploads/**',
      },
    ],
    // Don't unoptimize in production
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

module.exports = nextConfig;