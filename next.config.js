// next.config.js (JavaScript)
/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    // Use default optimization in production
    unoptimized: false,
    remotePatterns: [
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
      // Placeholder service
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

module.exports = nextConfig;

