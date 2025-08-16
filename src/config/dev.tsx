// config/dev.ts - Centralized Development Configuration
export const DEV_CONFIG = {
  // 🚨 MAIN DEV TOGGLE 🚨
  // Set this to false to enable full authentication in development
  SKIP_AUTH: process.env.NODE_ENV === 'development' && true,
  
  // Override with environment variable if needed
  // Usage: SKIP_AUTH=false npm run dev
  get ENABLE_AUTH_BYPASS() {
    const envOverride = process.env.SKIP_AUTH;
    if (envOverride !== undefined) {
      return envOverride === 'true';
    }
    return this.SKIP_AUTH;
  },

  // Mock user data for development
  MOCK_USER: {
    id: 'dev-user-123',
    name: 'Dev User',
    email: 'dev@example.com',
    username: 'devuser', // Added missing property
    role: 'admin' as const,
    isActive: true, // Added missing property
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },

  // Mock user headers for middleware
  MOCK_HEADERS: {
    'x-user-id': 'dev-user-123',
    'x-user-role': 'admin'
  },

  // Development logging
  LOG_AUTH_BYPASS: true
};

// Helper function for consistent logging
export const logDevMode = (message: string, component: string) => {
  if (DEV_CONFIG.LOG_AUTH_BYPASS && DEV_CONFIG.ENABLE_AUTH_BYPASS) {
    console.log(`[DEV MODE - ${component}] ${message}`);
  }
};