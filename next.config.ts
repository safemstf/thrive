// next.config.ts - Optimized TypeScript configuration
import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Compiler optimizations
  compiler: {
    styledComponents: true,
    // Remove console.log in production
    removeConsole: isProduction ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Experimental features for performance
  experimental: {
    // Enable modern bundling optimizations
    optimizePackageImports: [
      'lucide-react',
      '@/components',
      '@/lib',
      '@/hooks'
    ],
    // Reduce bundle size
    serverComponentsExternalPackages: ['styled-components'],
  },

  // Image optimization configuration
  images: {
    // Enable optimization in production, disable in development for faster builds
    unoptimized: isDevelopment,
        
    // Supported formats (WebP, AVIF for better compression)
    formats: ['image/webp', 'image/avif'],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Remote patterns with improved organization
    remotePatterns: [
      // Production domains
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
      {
        protocol: 'https',
        hostname: 'api.learnmorra.com',
        pathname: '/uploads/**',
      },
      
      // Development domains
      ...(isDevelopment ? [
        {
          protocol: 'http' as const,
          hostname: 'localhost',
          port: '5000',
          pathname: '/uploads/**',
        },
        // Ngrok patterns for development tunneling
        {
          protocol: 'http' as const,
          hostname: '**.ngrok-free.app',
          pathname: '/**',
        },
        {
          protocol: 'https' as const,
          hostname: '**.ngrok-free.app',
          pathname: '/**',
        },
        {
          protocol: 'http' as const,
          hostname: '60a90cb1d075.ngrok-free.app',
          pathname: '/uploads/**',
        },
      ] : []),
      
      // External services
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    
    // Loader configuration
    loader: 'default',
    
    // Cache optimization
    minimumCacheTTL: 31536000, // 1 year for static images
  },

  // Performance optimizations
  reactStrictMode: true,
  
  // Output configuration
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Bundle analyzer (enable with ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.plugins.push(
        require('@next/bundle-analyzer')({
          enabled: true,
        })
      );
      return config;
    },
  }),

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/uploads/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for better SEO
  async redirects() {
    return [
      // Example redirects - adjust based on your needs
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // TypeScript configuration
  typescript: {
    // Enable type checking in production builds
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Enable linting during builds
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib', 'hooks', 'app'],
  },

  // Webpack customizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Tree shaking improvements
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    // Bundle optimization
    config.resolve.alias = {
      ...config.resolve.alias,
      // Resolve React to a single version
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    };

    return config;
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: isDevelopment,
    },
  },

  // Development server configuration
  ...(isDevelopment && {
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-right',
    },
  }),
};

export default nextConfig;