// config/api-routes.ts - Aligned with your backend
export interface RouteDefinition {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  needsAuth?: boolean;
  params?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  skipInBatchTest?: boolean;
}

export interface RouteCategory {
  name: string;
  routes: RouteDefinition[];
}

export function replaceRouteParams(
  endpoint: string,
  params?: Record<string, string>
): string {
  let url = endpoint;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  return url;
}

export function buildQueryString(params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Generate unique test data helpers
export const generateUniqueUsername = () => `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
export const generateUniqueEmail = () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;

export const API_ROUTES: Record<string, RouteCategory> = {
  health: {
    name: 'Health',
    routes: [
      {
        name: 'Basic Health Check',
        endpoint: '/health',
        method: 'GET',
        description: 'Basic health check'
      },
      {
        name: 'Detailed Health',
        endpoint: '/health/detailed',
        method: 'GET',
        description: 'Detailed system health'
      },
      {
        name: 'Readiness Probe',
        endpoint: '/health/ready',
        method: 'GET',
        description: 'Readiness probe'
      },
      {
        name: 'Liveness Probe',
        endpoint: '/health/live',
        method: 'GET',
        description: 'Liveness probe'
      },
      {
        name: 'API Documentation',
        endpoint: '/api',
        method: 'GET',
        description: 'Get API documentation'
      },
      {
        name: 'Routing Health',
        endpoint: '/api/routing-health',
        method: 'GET',
        description: 'Get routing system health'
      }
    ]
  },
  
  auth: {
    name: 'Authentication',
    routes: [
      {
        name: 'Register',
        endpoint: '/api/auth/register',
        method: 'POST',
        description: 'Register new user',
        body: () => ({
          username: generateUniqueUsername(),
          email: generateUniqueEmail(),
          password: 'password123',
          name: 'Test User'
        }),
        skipInBatchTest: true
      },
      {
        name: 'Login',
        endpoint: '/api/auth/login',
        method: 'POST',
        description: 'User login',
        body: {
          usernameOrEmail: 'admin@admin.com',
          password: 'admin123'
        }
      },
      {
        name: 'Get Current User',
        endpoint: '/api/auth/me',
        method: 'GET',
        description: 'Get current user profile',
        needsAuth: true
      },
      {
        name: 'Update Profile',
        endpoint: '/api/auth/me',
        method: 'PUT',
        description: 'Update user profile',
        needsAuth: true,
        body: {
          name: 'Updated User',
          preferences: {
            theme: 'dark'
          }
        }
      },
      {
        name: 'Verify Token',
        endpoint: '/api/auth/verify',
        method: 'POST',
        description: 'Verify JWT token',
        needsAuth: true
      },
      {
        name: 'Logout',
        endpoint: '/api/auth/logout',
        method: 'POST',
        description: 'Logout user',
        needsAuth: true
      }
    ]
  },
  
  portfolios: {
    name: 'Portfolios',
    routes: [
      // Public endpoints
      {
        name: 'List All Portfolios',
        endpoint: '/api/portfolios',
        method: 'GET',
        description: 'List all portfolios with filtering',
        queryParams: {
          page: '1',
          limit: '10'
        }
      },
      {
        name: 'Discover Portfolios',
        endpoint: '/api/portfolios/discover',
        method: 'GET',
        description: 'Discover portfolios with pagination',
        queryParams: {
          page: '1',
          limit: '10'
        }
      },
      {
        name: 'Get Featured Portfolios',
        endpoint: '/api/portfolios/featured',
        method: 'GET',
        description: 'Get featured portfolios'
      },
      {
        name: 'Search Portfolios',
        endpoint: '/api/portfolios/search',
        method: 'GET',
        description: 'Search portfolios',
        queryParams: {
          q: 'design'
        }
      },
      {
        name: 'Get Portfolio Stats',
        endpoint: '/api/portfolios/stats',
        method: 'GET',
        description: 'Get portfolio statistics'
      },
      {
        name: 'Get Portfolio by Username',
        endpoint: '/api/portfolios/by-username/:username',
        method: 'GET',
        description: 'Get portfolio by username',
        params: {
          username: 'jane_designer'
        }
      },
      {
        name: 'Get Portfolio by ID',
        endpoint: '/api/portfolios/by-id/:id',
        method: 'GET',
        description: 'Get portfolio by ID',
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      
      // Auth required endpoints
      {
        name: 'Get My Portfolio',
        endpoint: '/api/portfolios/me',
        method: 'GET',
        description: 'Get current user\'s portfolio',
        needsAuth: true
      },
      {
        name: 'Create My Portfolio',
        endpoint: '/api/portfolios/me/create',
        method: 'POST',
        description: 'Create portfolio for current user',
        needsAuth: true,
        body: {
          username: generateUniqueUsername(),
          name: 'My Portfolio',
          bio: 'Portfolio description',
          tags: ['design', 'development']
        }
      },
      {
        name: 'Create Portfolio',
        endpoint: '/api/portfolios',
        method: 'POST',
        description: 'Create a portfolio (admin or user)',
        needsAuth: true,
        body: {
          username: generateUniqueUsername(),
          name: 'Test Portfolio',
          bio: 'Test portfolio description',
          tags: ['test', 'portfolio']
        },
        skipInBatchTest: true
      },
      {
        name: 'Update Portfolio by Username',
        endpoint: '/api/portfolios/by-username/:username',
        method: 'PUT',
        description: 'Update portfolio by username',
        needsAuth: true,
        params: {
          username: 'testuser'
        },
        body: {
          name: 'Updated Portfolio',
          bio: 'Updated bio'
        }
      },
      {
        name: 'Delete My Portfolio',
        endpoint: '/api/portfolios/me',
        method: 'DELETE',
        description: 'Delete current user\'s portfolio',
        needsAuth: true
      },
      {
        name: 'Delete Portfolio by ID',
        endpoint: '/api/portfolios/by-id/:id',
        method: 'DELETE',
        description: 'Delete portfolio by ID',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      
      // Gallery management through portfolio
      {
        name: 'Delete Gallery Piece from Portfolio',
        endpoint: '/api/portfolios/me/gallery/:pieceId',
        method: 'DELETE',
        description: 'Delete a gallery piece from portfolio',
        needsAuth: true,
        params: {
          pieceId: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Batch Delete Gallery Pieces',
        endpoint: '/api/portfolios/me/gallery/batch',
        method: 'DELETE',
        description: 'Batch delete gallery pieces',
        needsAuth: true,
        body: {
          pieceIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
        }
      },
      {
        name: 'Update Gallery Piece Visibility',
        endpoint: '/api/portfolios/me/gallery/:pieceId/visibility',
        method: 'PUT',
        description: 'Update gallery piece visibility',
        needsAuth: true,
        params: {
          pieceId: '507f1f77bcf86cd799439011'
        },
        body: {
          visibility: 'public'
        }
      },
      {
        name: 'Batch Update Gallery Visibility',
        endpoint: '/api/portfolios/me/gallery/batch/visibility',
        method: 'PUT',
        description: 'Batch update gallery piece visibility',
        needsAuth: true,
        body: {
          pieceIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
          visibility: 'public'
        }
      }
    ]
  },
  
  gallery: {
    name: 'Gallery',
    routes: [
      // Public endpoints
      {
        name: 'Get Gallery Pieces',
        endpoint: '/api/gallery',
        method: 'GET',
        description: 'Get gallery items with pagination',
        queryParams: {
          limit: '10',
          page: '1',
          visibility: 'public',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      },
      {
        name: 'Get Featured Pieces',
        endpoint: '/api/gallery/featured',
        method: 'GET',
        description: 'Get featured items',
        queryParams: {
          limit: '6'
        }
      },
      {
        name: 'Get Gallery Stats',
        endpoint: '/api/gallery/stats',
        method: 'GET',
        description: 'Get gallery statistics'
      },
      {
        name: 'Get Single Piece',
        endpoint: '/api/gallery/:id',
        method: 'GET',
        description: 'Get specific piece',
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Verify Gallery Setup',
        endpoint: '/api/gallery/verify-setup',
        method: 'GET',
        description: 'Verify upload configuration'
      },
      
      // Auth required endpoints
      {
        name: 'Create Gallery Piece',
        endpoint: '/api/gallery',
        method: 'POST',
        description: 'Create new gallery piece',
        needsAuth: true,
        body: {
          title: `Test Artwork ${Date.now()}`,
          description: 'A test gallery piece',
          artist: 'Test Artist',
          visibility: 'private',
          tags: ['test', 'demo'],
          category: 'digital',
          price: 100,
          currency: 'USD'
        }
      },
      {
        name: 'Upload Gallery Image',
        endpoint: '/api/gallery/upload',
        method: 'POST',
        description: 'Upload image with optional metadata',
        needsAuth: true,
        body: {
          note: 'Requires multipart/form-data with file upload'
        },
        skipInBatchTest: true
      },
      {
        name: 'Update Gallery Piece',
        endpoint: '/api/gallery/:id',
        method: 'PUT',
        description: 'Update gallery piece',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          title: 'Updated Artwork',
          description: 'Updated description',
          visibility: 'public'
        }
      },
      {
        name: 'Delete Gallery Piece',
        endpoint: '/api/gallery/:id',
        method: 'DELETE',
        description: 'Delete gallery piece',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Batch Update Visibility',
        endpoint: '/api/gallery/batch-visibility',
        method: 'POST',
        description: 'Batch update visibility',
        needsAuth: true,
        body: {
          ids: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
          visibility: 'public'
        }
      },
      {
        name: 'Batch Delete Pieces',
        endpoint: '/api/gallery/batch-delete',
        method: 'POST',
        description: 'Batch delete pieces',
        needsAuth: true,
        body: {
          ids: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
        }
      }
    ]
  },
  
  users: {
    name: 'Users',
    routes: [
      {
        name: 'Get All Users',
        endpoint: '/api/users',
        method: 'GET',
        description: 'Get all users',
        needsAuth: true,
        queryParams: {
          page: '1',
          limit: '20'
        }
      },
      {
        name: 'Get User by ID',
        endpoint: '/api/users/:id',
        method: 'GET',
        description: 'Get user by ID',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Update User',
        endpoint: '/api/users/:id',
        method: 'PUT',
        description: 'Update user',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          role: 'user',
          status: 'active'
        }
      },
      {
        name: 'Delete User',
        endpoint: '/api/users/:id',
        method: 'DELETE',
        description: 'Delete user',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Get User Progress',
        endpoint: '/api/users/:id/progress',
        method: 'GET',
        description: 'Get user progress',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      }
    ]
  },
  
  books: {
    name: 'Books',
    routes: [
      {
        name: 'Get All Books',
        endpoint: '/api/books',
        method: 'GET',
        description: 'Get all books with filtering',
        queryParams: {
          page: '1',
          limit: '10'
        }
      },
      {
        name: 'Get Book by ID',
        endpoint: '/api/books/:id',
        method: 'GET',
        description: 'Get single book by ID',
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Get Books by Category',
        endpoint: '/api/books/category/:mainCategory',
        method: 'GET',
        description: 'Get books by category',
        params: {
          mainCategory: 'Mathematics'
        }
      },
      {
        name: 'Create Book',
        endpoint: '/api/books',
        method: 'POST',
        description: 'Create new book',
        needsAuth: true,
        body: () => ({
          title: `Test Book ${Date.now()}`,
          author: 'Test Author',
          description: 'A test book',
          mainCategory: 'Mathematics',
          subCategory: 'Algebra',
          gradeLevel: 'High School',
          difficulty: 'Intermediate',
          isbn: `TEST-${Date.now()}`,
          concepts: []
        })
      },
      {
        name: 'Compose Custom Book',
        endpoint: '/api/books/compose',
        method: 'POST',
        description: 'Create custom book from concepts',
        needsAuth: true,
        body: {
          title: 'Custom Book',
          conceptIds: ['507f1f77bcf86cd799439011']
        }
      },
      {
        name: 'Get Book Suggestions',
        endpoint: '/api/books/:id/suggestions',
        method: 'GET',
        description: 'Get book composition suggestions',
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Analyze Book',
        endpoint: '/api/books/:id/analysis',
        method: 'GET',
        description: 'Analyze book',
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Clone Book',
        endpoint: '/api/books/:id/clone',
        method: 'POST',
        description: 'Clone book',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      }
    ]
  },
  
  concepts: {
    name: 'Concepts',
    routes: [
      {
        name: 'Get All Concepts',
        endpoint: '/api/concepts',
        method: 'GET',
        description: 'Get all concepts with filtering'
      },
      {
        name: 'Search Concepts',
        endpoint: '/api/concepts/search',
        method: 'GET',
        description: 'Search concepts',
        queryParams: {
          q: 'algebra'
        }
      },
      {
        name: 'Get Concept by ID',
        endpoint: '/api/concepts/:id',
        method: 'GET',
        description: 'Get single concept by ID',
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Get Concepts for Book',
        endpoint: '/api/concepts/book/:bookId',
        method: 'GET',
        description: 'Get concepts for a book',
        params: {
          bookId: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Get Concepts by Type',
        endpoint: '/api/concepts/type/:type',
        method: 'GET',
        description: 'Get concepts by type',
        params: {
          type: 'math'
        }
      },
      {
        name: 'Mark Concept Complete',
        endpoint: '/api/concepts/:id/complete',
        method: 'POST',
        description: 'Mark concept as completed',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Create Concept',
        endpoint: '/api/concepts',
        method: 'POST',
        description: 'Create new concept',
        needsAuth: true,
        body: {
          name: 'Test Concept',
          type: 'math',
          description: 'Test concept description'
        }
      },
      {
        name: 'Update Concept',
        endpoint: '/api/concepts/:id',
        method: 'PUT',
        description: 'Update concept',
        needsAuth: true,
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          name: 'Updated Concept',
          description: 'Updated description'
        }
      }
    ]
  },
  
  progress: {
    name: 'Progress',
    routes: [
      {
        name: 'Get Progress Summary',
        endpoint: '/api/progress',
        method: 'GET',
        description: 'Get user progress summary',
        needsAuth: true
      },
      {
        name: 'Get Book Progress',
        endpoint: '/api/progress/book/:bookId',
        method: 'GET',
        description: 'Get progress for specific book',
        needsAuth: true,
        params: {
          bookId: '507f1f77bcf86cd799439011'
        }
      },
      {
        name: 'Update Concept Progress',
        endpoint: '/api/progress/book/:bookId/concept/:conceptId',
        method: 'POST',
        description: 'Update concept progress',
        needsAuth: true,
        params: {
          bookId: '507f1f77bcf86cd799439011',
          conceptId: '507f1f77bcf86cd799439012'
        },
        body: {
          completed: true,
          score: 95
        }
      },
      {
        name: 'Get Progress Stats',
        endpoint: '/api/progress/stats',
        method: 'GET',
        description: 'Get detailed progress statistics',
        needsAuth: true
      },
      {
        name: 'Reset Book Progress',
        endpoint: '/api/progress/book/:bookId',
        method: 'DELETE',
        description: 'Reset book progress',
        needsAuth: true,
        params: {
          bookId: '507f1f77bcf86cd799439011'
        }
      }
    ]
  },
  
  simulations: {
    name: 'Simulations',
    routes: [
      {
        name: 'Get All Simulations',
        endpoint: '/api/simulations',
        method: 'GET',
        description: 'Get all simulations with filtering',
        queryParams: {
          limit: '10',
          page: '1'
        }
      },
      {
        name: 'Register Simulation',
        endpoint: '/api/simulations',
        method: 'POST',
        description: 'Register new simulation',
        body: {
          simulation_id: `sim_${Date.now()}`,
          name: 'Test Simulation',
          type: 'physics',
          config: {
            test: true
          }
        }
      },
      {
        name: 'Get Simulation Stats',
        endpoint: '/api/simulations/stats',
        method: 'GET',
        description: 'Get comprehensive simulation statistics'
      },
      {
        name: 'Upload Simulation Results',
        endpoint: '/api/simulations/results',
        method: 'POST',
        description: 'Upload simulation results (legacy)',
        body: {
          simulation_id: 'sim_test',
          results: {
            score: 85,
            completed: true
          }
        }
      },
      {
        name: 'Get Simulation by ID',
        endpoint: '/api/simulations/:id',
        method: 'GET',
        description: 'Get specific simulation details',
        params: {
          id: 'sim_test'
        }
      },
      {
        name: 'Get Simulation Insights',
        endpoint: '/api/simulations/:id/insights',
        method: 'GET',
        description: 'Get simulation-specific analytics',
        params: {
          id: 'sim_test'
        }
      },
      {
        name: 'Send Simulation Events',
        endpoint: '/api/simulations/:id/events',
        method: 'POST',
        description: 'Receive simulation events',
        params: {
          id: 'sim_test'
        },
        body: {
          events: [{
            type: 'interaction',
            timestamp: new Date().toISOString(),
            data: { action: 'click', target: 'button' }
          }]
        }
      },
      {
        name: 'Get Live Data',
        endpoint: '/api/simulations/:id/live-data',
        method: 'GET',
        description: 'Get live visualization data',
        params: {
          id: 'sim_test'
        }
      },
      {
        name: 'Stream Events (SSE)',
        endpoint: '/api/simulations/:id/stream',
        method: 'GET',
        description: 'Real-time event stream (SSE)',
        params: {
          id: 'sim_test'
        },
        skipInBatchTest: true // SSE doesn't work well in batch tests
      },
      {
        name: 'Disconnect Simulation',
        endpoint: '/api/simulations/:id/disconnect',
        method: 'POST',
        description: 'Handle simulation disconnect',
        params: {
          id: 'sim_test'
        }
      },
      {
        name: 'Delete Simulation',
        endpoint: '/api/simulations/:id',
        method: 'DELETE',
        description: 'Delete simulation data',
        params: {
          id: 'sim_test'
        }
      }
    ]
  }
};