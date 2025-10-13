// src/config/environment.ts

// Environment configuration with validation
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_NGROK_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_DEFAULT_API_URL || '', // fallback empty if none set
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
    // Legacy support
    localUrl: process.env.NEXT_PUBLIC_LOCAL_API || 'http://localhost:5000',
    useTunnel: process.env.NEXT_PUBLIC_USE_TUNNEL === 'true',
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
      enableHealthCheck: process.env.NEXT_PUBLIC_ENABLE_HEALTH_CHECK !== 'false',

  },
} as const ;

// Get the effective API base URL based on environment
export function getEffectiveApiUrl(): string {
  // In development, prefer tunnel if enabled, otherwise use local
  if (config.app.isDevelopment && config.api.useTunnel) {
    return config.api.baseUrl;
  }

  if (config.app.isDevelopment && !config.api.useTunnel) {
    return config.api.localUrl;
  }

  // In production, always use the configured base URL
  return config.api.baseUrl;
}

// Validate required environment variables
export function validateEnvironment() {
  const warnings: string[] = [];

  // Check if we have a valid API URL
  const apiUrl = getEffectiveApiUrl();
  if (!apiUrl || apiUrl === 'undefined') {
    warnings.push('No valid API URL configured');
  }

  // Validate URL format
  try {
    new URL(apiUrl);
  } catch {
    warnings.push(`Invalid API URL format: ${apiUrl}`);
  }

  if (warnings.length > 0) {
    console.warn(
      `⚠️  Configuration warnings:\n${warnings.map(w => `  - ${w}`).join('\n')}\n` +
      `Please check your .env.local file.`
    );
  }

  // Log the current configuration in development
  if (config.app.isDevelopment) {
    console.log('🔧 API Configuration:', {
      effectiveUrl: getEffectiveApiUrl(),
      baseUrl: config.api.baseUrl,
      localUrl: config.api.localUrl,
      useTunnel: config.api.useTunnel,
      version: config.api.version,
      fullApiPath: `${getEffectiveApiUrl()}/api`
    });
  }
}

// Get full API URL for a specific endpoint
export function getApiUrl(endpoint: string): string {
  const baseUrl = getEffectiveApiUrl();

  // Remove leading slash from endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  // Ensure we have /api prefix unless endpoint already includes it
  const apiPrefix = cleanEndpoint.startsWith('api/') ? '' : 'api/';

  // Build full URL
  return `${baseUrl}/${apiPrefix}${cleanEndpoint}`;
}

// Test different API URL configurations
export async function testApiConnections(): Promise<{
  [key: string]: { success: boolean; url: string; error?: string; latency?: number }
}> {
  const tests = {
    configured: getEffectiveApiUrl(),
    ngrok: config.api.baseUrl,
    local: config.api.localUrl,
  };

  const results: any = {};

  for (const [name, url] of Object.entries(tests)) {
    const start = Date.now();
    try {
      const testUrl = `${url}/api/health`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      results[name] = {
        success: response.ok,
        url,
        latency: Date.now() - start,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      results[name] = {
        success: false,
        url,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return results;
}

// Development helper to log all environment variables
export function logEnvironmentVariables() {
  if (!config.app.isDevelopment) return;

  console.group('🌍 Environment Variables');

  const envVars = Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_PUBLIC_'))
    .sort();

  envVars.forEach(key => {
    const value = process.env[key];
    // Mask potential sensitive values
    const displayValue = key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')
      ? '***masked***'
      : value;
    console.log(`${key}: ${displayValue}`);
  });

  console.groupEnd();
}

// Updated example .env.local file content
export const envExample = `
# Copy this to .env.local and fill in your values

# Primary API Configuration (choose one)
NEXT_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
# OR
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# API Settings
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_API_TIMEOUT=30000

# Development Settings
NEXT_PUBLIC_LOCAL_API=http://localhost:5000
NEXT_PUBLIC_USE_TUNNEL=true

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

// Initialize and validate configuration
export function initializeConfig() {
  validateEnvironment();

  if (config.app.isDevelopment) {
    logEnvironmentVariables();

    // Test API connection in development
    testApiConnections().then(results => {
      console.group('🔗 API Connection Tests');
      Object.entries(results).forEach(([name, result]) => {
        const status = result.success ? '✅' : '❌';
        const latency = result.latency ? ` (${result.latency}ms)` : '';
        const error = result.error ? ` - ${result.error}` : '';
        console.log(`${status} ${name}: ${result.url}${latency}${error}`);
      });
      console.groupEnd();
    });
  }
}

// Export the effective API URL for use in API clients
export const API_BASE_URL = getEffectiveApiUrl();