// src/config/environment.ts

// Environment configuration with validation
export const config = {
  // API Configuration
   api: {
    baseUrl: process.env.NEXT_PUBLIC_NGROK_URL || 'https://f61a-47-189-145-241.ngrok-free.app',
    version: 'v1',
    timeout: 30000,
  },
  
  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Educational Platform',
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
  
  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    search: process.env.NEXT_PUBLIC_ENABLE_SEARCH !== 'false', // Default true
    userProgress: process.env.NEXT_PUBLIC_ENABLE_USER_PROGRESS === 'true',
  },
  
  // Client Configuration
  client: {
    maxRetries: parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.NEXT_PUBLIC_RETRY_DELAY || '1000', 10),
  },
} as const;

// Validate required environment variables
export function validateEnvironment() {
  const required: any[] = [];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missing.join(', ')}\n` +
      `Please add them to your .env.local file or Vercel environment settings.`
    );
  }
  
  // Log the current configuration in development
  if (process.env.NODE_ENV === 'development') {
    console.log('API Configuration:', {
      baseUrl: config.api.baseUrl,
      version: config.api.version,
      fullUrl: `${config.api.baseUrl}/api/${config.api.version}`
    });
  }
}

// Get full API URL
export function getApiUrl(endpoint: string): string {
  const baseUrl = config.api.baseUrl;
  const version = config.api.version;
  
  // Remove leading slash from endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Build full URL
  return `${baseUrl}/api/${version}/${cleanEndpoint}`;
}

// Example .env.local file content for reference
export const envExample = `
# Copy this to .env.local and fill in your values

# API Configuration
NEXT_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_API_TIMEOUT=30000

# App Configuration
NEXT_PUBLIC_APP_NAME=Educational Platform

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SEARCH=true
NEXT_PUBLIC_ENABLE_USER_PROGRESS=true

# Client Configuration
NEXT_PUBLIC_MAX_RETRIES=3
NEXT_PUBLIC_RETRY_DELAY=1000
`;