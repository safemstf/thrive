// src/components/apiTest/completeApiMethods.ts - Properly typed and aligned with backend

import { api } from '@/lib/api-client';

// ==================== ENHANCED CATEGORIES ====================
export const CATEGORIES = {
  health: { name: 'Health', icon: 'Heart', color: '#2c2c2c' },
  auth: { name: 'Auth', icon: 'Shield', color: '#666666' },
  portfolio: { name: 'Portfolio', icon: 'Route', color: '#999999' },
  education: { name: 'Education', icon: 'Book', color: '#555555' },
  users: { name: 'Users', icon: 'Users', color: '#777777' },
  me: { name: 'Account', icon: 'User', color: '#444444' },
  progress: { name: 'Progress', icon: 'TrendingUp', color: '#888888' },
  simulations: { name: 'Simulations', icon: 'Zap', color: '#333333' }
};

// ==================== TYPES ====================
interface ApiMethod {
  name: string;
  description: string;
  category: string;
  method: string;
  requiresAuth: boolean;
  testFunction: () => Promise<any>;
  generateTestData?: () => any;
  tags?: {
    needsRealId?: boolean;
    mockResponse?: boolean;
    imageUpload?: boolean;
    adminOnly?: boolean;
    legacy?: boolean;
  };
}

// ==================== API METHODS ====================
export const createCompleteApiMethods = (authToken: string | null): ApiMethod[] => [
  // ==================== HEALTH & SYSTEM ====================
  {
    name: 'Health Check',
    description: 'Basic health check endpoint',
    category: 'health',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.health.check()
  },
  {
    name: 'Test Connection',
    description: 'Test basic connectivity',
    category: 'health',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.health.testConnection()
  },
  {
    name: 'Detailed Health',
    description: 'Detailed system health information',
    category: 'health',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.health.detailed()
  },
  {
    name: 'Ready Check',
    description: 'Kubernetes readiness probe',
    category: 'health',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.health.ready()
  },
  {
    name: 'Live Check',
    description: 'Kubernetes liveness probe',
    category: 'health',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.health.live()
  },

  // ==================== AUTHENTICATION ====================
  {
    name: 'Login',
    description: 'Authenticate with credentials',
    category: 'auth',
    method: 'POST',
    requiresAuth: false,
    testFunction: () => api.auth.login({ 
      email: 'admin@admin.com',
      password: 'Safe123' 
    }),
    generateTestData: () => ({ 
      usernameOrEmail: 'admin@admin.com', 
      password: 'Safe123' 
    })
  },
  {
    name: 'Register',
    description: 'Create new user account',
    category: 'auth',
    method: 'POST',
    requiresAuth: false,
    testFunction: () => api.auth.signup({
      email: `test-${Date.now()}@example.com`,
      password: 'testpass123',
      username: `testuser${Date.now()}`,
      name: 'Test User'
    }),
    generateTestData: () => ({
      email: `test-${Date.now()}@example.com`,
      password: 'testpass123',
      username: `testuser${Date.now()}`,
      name: 'Test User'
    })
  },
  {
    name: 'Get Current User',
    description: 'Get authenticated user information',
    category: 'auth',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.auth.getCurrentUser()
  },
  {
    name: 'Update Profile',
    description: 'Update user profile information',
    category: 'auth',
    method: 'PUT',
    requiresAuth: true,
    testFunction: () => api.auth.updateProfile({}),
    generateTestData: () => ({})
  },
  {
    name: 'Verify Token',
    description: 'Validate authentication token',
    category: 'auth',
    method: 'POST',
    requiresAuth: true,
    testFunction: () => api.auth.verifyToken(authToken || '')
  },
  {
    name: 'Logout',
    description: 'End user session',
    category: 'auth',
    method: 'POST',
    requiresAuth: true,
    testFunction: () => api.auth.logout()
  },

  // ==================== PORTFOLIO CORE ====================
  {
    name: 'Check Portfolio Exists',
    description: 'Check if user has portfolio',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.portfolio.check()
  },
  {
    name: 'Get My Portfolio',
    description: 'Get current user portfolio',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.portfolio.get()
  },
  {
    name: 'Create Portfolio',
    description: 'Create new portfolio',
    category: 'portfolio',
    method: 'POST',
    requiresAuth: true,
    testFunction: () => api.portfolio.create({
      title: 'My Test Portfolio',
      bio: 'This is a test portfolio created by the API test suite',
      kind: 'creative',
      specializations: ['digital-art', 'web-design'],
      tags: ['test', 'api', 'portfolio'],
      visibility: 'public'
    }),
    generateTestData: () => ({
      title: 'My Test Portfolio',
      bio: 'This is a test portfolio created by the API test suite',
      kind: 'creative',
      visibility: 'public',
      specializations: ['digital-art', 'web-design'],
      tags: ['test', 'api', 'portfolio']
    })
  },
  {
    name: 'Update Portfolio',
    description: 'Update portfolio information',
    category: 'portfolio',
    method: 'PUT',
    requiresAuth: true,
    testFunction: () => api.portfolio.update({
      bio: `Updated bio - ${new Date().toISOString()}`,
      title: 'Updated Portfolio Title'
    }),
    generateTestData: () => ({
      bio: `Updated bio - ${new Date().toISOString()}`,
      title: 'Updated Portfolio Title'
    })
  },
  {
    name: 'Upgrade Portfolio',
    description: 'Upgrade portfolio type',
    category: 'portfolio',
    method: 'PUT',
    requiresAuth: true,
    testFunction: () => api.portfolio.upgrade('professional', true)
  },
  {
    name: 'Delete Portfolio',
    description: 'Delete current portfolio',
    category: 'portfolio',
    method: 'DELETE',
    requiresAuth: true,
    testFunction: () => api.portfolio.delete(false)
  },

  // ==================== PORTFOLIO PUBLIC ====================
  {
    name: 'Get Portfolio Stats',
    description: 'Get global portfolio statistics',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.portfolio.getStats()
  },
  {
    name: 'Discover Portfolios',
    description: 'Search and discover public portfolios',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.portfolio.discover({ visibility: 'public' }, 1, 10)
  },
  {
    name: 'Get Portfolio by Username',
    description: 'Get specific portfolio by username',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.portfolio.getByUsername('admin')
  },
  {
    name: 'Get Type Config',
    description: 'Get portfolio type configuration',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.portfolio.getTypeConfig('creative')
  },

  // ==================== PORTFOLIO GALLERY ====================
  {
    name: 'Get My Gallery',
    description: 'Get gallery pieces for current user portfolio',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.portfolio.gallery.get()
  },
  {
    name: 'Get Gallery by Username',
    description: 'Get gallery pieces for specific portfolio',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.portfolio.gallery.getByUsername('admin', 1, 5)
  },
  {
    name: 'Add Gallery Piece',
    description: 'Add gallery piece to current user portfolio',
    category: 'portfolio',
    method: 'POST',
    requiresAuth: true,
    testFunction: () => api.portfolio.gallery.add({
      title: `Test Artwork ${Date.now()}`,
      description: 'Created by API test suite',
      imageUrl: 'https://picsum.photos/800/600',
      category: 'digital',
      medium: 'Digital Art',
      tags: ['test', 'api', 'digital'],
      visibility: 'public',
      year: 2025,
      displayOrder: 1
    }),
    generateTestData: () => ({
      title: `Test Artwork ${Date.now()}`,
      description: 'Created by API test suite',
      imageUrl: 'https://picsum.photos/800/600',
      category: 'digital',
      medium: 'Digital Art',
      tags: ['test', 'api', 'digital'],
      visibility: 'public',
      year: 2025,
      displayOrder: 1
    })
  },
  {
    name: 'Update Gallery Piece',
    description: 'Update gallery piece in portfolio',
    category: 'portfolio',
    method: 'PUT',
    requiresAuth: true,
    testFunction: () => Promise.resolve({ 
      message: 'Mock: Would update gallery piece',
      endpoint: 'PUT /api/portfolios/me/gallery/:pieceId',
      note: 'Requires existing piece ID'
    }),
    tags: { needsRealId: true, mockResponse: true }
  },
  {
    name: 'Delete Gallery Piece',
    description: 'Delete gallery piece from portfolio',
    category: 'portfolio',
    method: 'DELETE',
    requiresAuth: true,
    testFunction: () => Promise.resolve({ 
      message: 'Mock: Would delete gallery piece',
      endpoint: 'DELETE /api/portfolios/me/gallery/:pieceId',
      note: 'Requires existing piece ID'
    }),
    tags: { needsRealId: true, mockResponse: true }
  },
  {
    name: 'Batch Delete Gallery Pieces',
    description: 'Batch delete gallery pieces',
    category: 'portfolio',
    method: 'DELETE',
    requiresAuth: true,
    testFunction: () => api.portfolio.gallery.batchDelete(['test-id-1', 'test-id-2'])
  },
  {
    name: 'Batch Update Gallery Visibility',
    description: 'Batch update gallery piece visibility',
    category: 'portfolio',
    method: 'PUT',
    requiresAuth: true,
    testFunction: () => api.portfolio.gallery.batchUpdateVisibility(['test-id-1', 'test-id-2'], 'public')
  },
  {
    name: 'Get Gallery Stats',
    description: 'Get gallery statistics for current user portfolio',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.portfolio.gallery.getStats()
  },

  // ==================== PORTFOLIO CONCEPTS ====================
  {
    name: 'Get My Concepts',
    description: 'Get current user concept progress',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.portfolio.concepts.get()
  },
  {
    name: 'Add Concept to Portfolio',
    description: 'Add concept to current user portfolio',
    category: 'portfolio',
    method: 'POST',
    requiresAuth: true,
    testFunction: () => api.portfolio.concepts.add('test-concept-id', {
      status: 'started',
      startedAt: new Date().toISOString(),
      notes: 'Test concept tracking'
    }),
    generateTestData: () => ({
      conceptId: 'test-concept-id',
      status: 'started',
      startedAt: new Date().toISOString(),
      notes: 'Test concept tracking'
    })
  },
  {
    name: 'Update Concept Progress',
    description: 'Update concept progress in portfolio',
    category: 'portfolio',
    method: 'PUT',
    requiresAuth: true,
    testFunction: () => api.portfolio.concepts.updateProgress('test-concept-id', {
      status: 'completed',
      score: 85,
      completedAt: new Date().toISOString()
    }),
    generateTestData: () => ({
      conceptId: 'test-concept-id',
      status: 'completed',
      score: 85,
      completedAt: new Date().toISOString()
    })
  },

  // ==================== PORTFOLIO ANALYTICS ====================
  {
    name: 'Get Portfolio Analytics',
    description: 'Get detailed analytics for portfolio',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.portfolio.analytics.get('7d')
  },
  {
    name: 'Get Portfolio Dashboard',
    description: 'Get dashboard metrics for portfolio',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.portfolio.analytics.dashboard()
  },
  {
    name: 'Track Portfolio View',
    description: 'Track portfolio view (public)',
    category: 'portfolio',
    method: 'POST',
    requiresAuth: false,
    testFunction: () => api.portfolio.analytics.trackView('test-portfolio-id', {
      referrer: 'api-test-suite',
      duration: 5000
    }),
    generateTestData: () => ({
      portfolioId: 'test-portfolio-id',
      referrer: 'api-test-suite',
      duration: 5000
    })
  },

  // ==================== PORTFOLIO DEBUG ====================
  {
    name: 'Get Upload Config',
    description: 'System diagnostics for upload configuration',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.portfolio.debug.uploadConfig()
  },
  {
    name: 'Validate File',
    description: 'Validate specific uploaded file',
    category: 'portfolio',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.portfolio.debug.validateFile('test-image.jpg')
  },

  // ==================== EDUCATION - BOOKS ====================
  {
    name: 'Get All Books',
    description: 'Get all books with filtering',
    category: 'education',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.books.getAll({ limit: 10 })
  },
  {
    name: 'Get Book by ID',
    description: 'Get single book by ID',
    category: 'education',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => Promise.resolve({ 
      message: 'Mock: Would get book details',
      endpoint: 'GET /api/books/:id',
      note: 'Requires existing book ID'
    }),
    tags: { needsRealId: true, mockResponse: true }
  },
  {
    name: 'Get Books by Category',
    description: 'Get books by category',
    category: 'education',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => Promise.resolve({ 
      message: 'Mock: Would get books by category',
      endpoint: 'GET /api/books/category/:mainCategory',
      note: 'Requires proper MainCategory enum'
    }),
    tags: { mockResponse: true }
  },

  // ==================== EDUCATION - CONCEPTS ====================
  {
    name: 'Get All Concepts',
    description: 'Get all concepts with filtering',
    category: 'education',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.concepts.getAll({ limit: 10 })
  },
  {
    name: 'Search Concepts',
    description: 'Search concepts',
    category: 'education',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.concepts.search('javascript', { limit: 5 })
  },
  {
    name: 'Get Concept by ID',
    description: 'Get single concept by ID',
    category: 'education',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => Promise.resolve({ 
      message: 'Mock: Would get concept details',
      endpoint: 'GET /api/concepts/:id',
      note: 'Requires existing concept ID'
    }),
    tags: { needsRealId: true, mockResponse: true }
  },
  {
    name: 'Get Concepts by Book',
    description: 'Get concepts for a book',
    category: 'education',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => Promise.resolve({ 
      message: 'Mock: Would get concepts for book',
      endpoint: 'GET /api/concepts/book/:bookId',
      note: 'Requires existing book ID'
    }),
    tags: { needsRealId: true, mockResponse: true }
  },
  {
    name: 'Mark Concept Complete',
    description: 'Mark concept as completed',
    category: 'education',
    method: 'POST',
    requiresAuth: true,
    testFunction: () => Promise.resolve({ 
      message: 'Mock: Would mark concept complete',
      endpoint: 'POST /api/concepts/:id/complete',
      note: 'Requires existing concept ID'
    }),
    tags: { needsRealId: true, mockResponse: true }
  },

  // ==================== PROGRESS TRACKING ====================
  {
    name: 'Get Progress Summary',
    description: 'Get user progress summary',
    category: 'progress',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.progress.get()
  },
  {
    name: 'Get Progress Stats',
    description: 'Get detailed progress statistics',
    category: 'progress',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.progress.getStats()
  },

  // ==================== USER MANAGEMENT ====================
  {
    name: 'Get All Users',
    description: 'Get all users (admin only)',
    category: 'users',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.users.getAll(),
    tags: { adminOnly: true }
  },

  // ==================== ACCOUNT MANAGEMENT (/me) ====================
  {
    name: 'Get My Skills',
    description: 'Get current user skill development summary',
    category: 'me',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.me.getSkills()
  },
  {
    name: 'Get Learning Paths',
    description: 'Get current user learning paths and certifications',
    category: 'me',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.me.getLearningPaths()
  },
  {
    name: 'Get Market Intelligence',
    description: 'Get relevant market intelligence data',
    category: 'me',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.me.getMarketIntelligence()
  },
  {
    name: 'Get Privacy Settings',
    description: 'Get privacy and data sharing preferences',
    category: 'me',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.me.getPrivacySettings()
  },
  {
    name: 'Update Privacy Settings',
    description: 'Update privacy preferences',
    category: 'me',
    method: 'PUT',
    requiresAuth: true,
    testFunction: () => api.me.updatePrivacySettings({
      profileVisibility: 'public',
      showEmail: false,
      allowAnalytics: true
    }),
    generateTestData: () => ({
      profileVisibility: 'public',
      showEmail: false,
      allowAnalytics: true
    })
  },
  {
    name: 'Get Account Info',
    description: 'Get account and subscription info',
    category: 'me',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.me.getAccountInfo()
  },
  {
    name: 'Update Account Info',
    description: 'Update account details',
    category: 'me',
    method: 'PUT',
    requiresAuth: true,
    testFunction: () => api.me.updateAccountInfo({
      timezone: 'UTC',
      language: 'en',
      notifications: true
    }),
    generateTestData: () => ({
      timezone: 'UTC',
      language: 'en',
      notifications: true
    })
  },
  {
    name: 'Get Billing Info',
    description: 'Get billing and subscription info',
    category: 'me',
    method: 'GET',
    requiresAuth: true,
    testFunction: () => api.me.getBilling()
  },
  {
    name: 'Upgrade Billing Plan',
    description: 'Upgrade subscription plan',
    category: 'me',
    method: 'POST',
    requiresAuth: true,
    testFunction: () => api.me.upgradeBilling({
      plan: 'premium',
      billingCycle: 'monthly'
    }),
    generateTestData: () => ({
      plan: 'premium',
      billingCycle: 'monthly'
    })
  },

  // ==================== SIMULATIONS ====================
  {
    name: 'Get All Simulations',
    description: 'Get all simulations with filtering',
    category: 'simulations',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.simulations.getAll({ limit: 10 })
  },
  {
    name: 'Create Simulation',
    description: 'Register new simulation',
    category: 'simulations',
    method: 'POST',
    requiresAuth: false,
    testFunction: () => api.simulations.create({
      name: `Test Simulation ${Date.now()}`,
      type: 'market_analysis',
      parameters: {
        duration: '1h',
        complexity: 'medium'
      }
    }),
    generateTestData: () => ({
      name: `Test Simulation ${Date.now()}`,
      type: 'market_analysis',
      parameters: {
        duration: '1h',
        complexity: 'medium'
      }
    })
  },
  {
    name: 'Get Simulation Stats',
    description: 'Get comprehensive simulation statistics',
    category: 'simulations',
    method: 'GET',
    requiresAuth: false,
    testFunction: () => api.simulations.getStats()
  },
  {
    name: 'Upload Simulation Results',
    description: 'Upload simulation results (legacy)',
    category: 'simulations',
    method: 'POST',
    requiresAuth: false,
    testFunction: () => api.simulations.uploadResults({
      simulationId: 'test-sim-id',
      results: { accuracy: 0.95, iterations: 1000 }
    }),
    generateTestData: () => ({
      simulationId: 'test-sim-id',
      results: { accuracy: 0.95, iterations: 1000 }
    })
  }
];

// ==================== EXPORT HELPERS ====================
export const getMethodsByCategory = (methods: ApiMethod[], category: string): ApiMethod[] => {
  return methods.filter(method => method.category === category);
};

export const getAuthRequiredMethods = (methods: ApiMethod[]): ApiMethod[] => {
  return methods.filter(method => method.requiresAuth);
};

export const getPublicMethods = (methods: ApiMethod[]): ApiMethod[] => {
  return methods.filter(method => !method.requiresAuth);
};

export const getMockMethods = (methods: ApiMethod[]): ApiMethod[] => {
  return methods.filter(method => method.tags?.mockResponse);
};

export const getRealMethods = (methods: ApiMethod[]): ApiMethod[] => {
  return methods.filter(method => !method.tags?.mockResponse);
};

export const getAdminMethods = (methods: ApiMethod[]): ApiMethod[] => {
  return methods.filter(method => method.tags?.adminOnly);
};

export const getMethodsByTag = (methods: ApiMethod[], tag: keyof NonNullable<ApiMethod['tags']>): ApiMethod[] => {
  return methods.filter(method => method.tags?.[tag]);
};