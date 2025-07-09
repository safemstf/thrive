// config/api-routes.ts
export interface RouteDefinition {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  needsAuth?: boolean;
  params?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  skipInBatchTest?: boolean; // Add this to skip certain routes in batch testing
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
  system: {
    name: 'System',
    routes: [
      {
        name: 'Health Check',
        endpoint: '/health',
        method: 'GET',
        description: 'Check if the server is running'
      },
      {
        name: 'Server Stats',
        endpoint: '/stats',
        method: 'GET',
        description: 'Get server statistics'
      },
      {
        name: 'API Info',
        endpoint: '/api',
        method: 'GET',
        description: 'Get API documentation'
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
        description: 'Register a new user',
        body: () => ({
          username: generateUniqueUsername(),
          email: generateUniqueEmail(),
          password: 'password123',
          name: 'Test User'
        }),
        skipInBatchTest: true // Skip in batch tests to avoid conflicts
      },
      {
        name: 'Login',
        endpoint: '/api/auth/login',
        method: 'POST',
        description: 'Login user',
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
          name: 'User',
          preferences: {
            theme: 'dark'
          }
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
        description: 'Get all users (admin only)',
        needsAuth: true
      },
      {
        name: 'Get User by ID',
        endpoint: '/api/users/:id',
        method: 'GET',
        description: 'Get user by ID',
        needsAuth: true,
        params: {
          id: '684b5492bf70237d7f29fc92'
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
        description: 'Get single book',
        params: {
          id: '507f1f77bcf86cd799439011' // Use a valid MongoDB ObjectId format
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
        description: 'Create new book (admin only)',
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
      }
    ]
  },
  gallery: {
    name: 'Gallery',
    routes: [
      {
        name: 'Get Gallery Pieces',
        endpoint: '/api/gallery',
        method: 'GET',
        description: 'Get gallery items with pagination',
        queryParams: {
          limit: '10',
          page: '1'
        }
      },
      {
        name: 'Get Featured Pieces',
        endpoint: '/api/gallery/featured',
        method: 'GET',
        description: 'Get featured gallery items',
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
        description: 'Get a specific gallery piece by ID',
        params: {
          id: '507f1f77bcf86cd799439011' // Use a valid MongoDB ObjectId format
        }
      },
      {
        name: 'Create Gallery Piece',
        endpoint: '/api/gallery',
        method: 'POST',
        description: 'Create a new gallery piece',
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
        },
        skipInBatchTest: true
      }
    ]
  },
  portfolios: {
    name: 'Portfolios',
    routes: [
      {
        name: 'Get All Portfolios',
        endpoint: '/api/portfolios',
        method: 'GET',
        description: 'Get all portfolios with filtering'
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
        endpoint: '/api/portfolios/:username',
        method: 'GET',
        description: 'Get specific portfolio by username',
        params: {
          username: 'jane_designer'
        }
      },
      {
        name: 'Create Portfolio',
        endpoint: '/api/portfolios',
        method: 'POST',
        description: 'Create new portfolio',
        needsAuth: true,
        body: {
          username: generateUniqueUsername(),
          name: 'Test Portfolio',
          bio: 'Test portfolio description',
          tags: ['test', 'portfolio']
        },
        skipInBatchTest: true
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
        description: 'Get all concepts'
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
        name: 'Get Concepts by Type',
        endpoint: '/api/concepts/type/:type',
        method: 'GET',
        description: 'Get concepts by type',
        params: {
          type: 'math'
        }
      }
    ]
  },
  progress: {
    name: 'Progress',
    routes: [
      {
        name: 'Get Progress',
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
          bookId: '507f1f77bcf86cd799439011' // Use a valid MongoDB ObjectId format
        }
      },
      {
        name: 'Get Progress Stats',
        endpoint: '/api/progress/stats',
        method: 'GET',
        description: 'Get detailed progress statistics',
        needsAuth: true
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
          type: 'test',
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
        name: 'Get Simulation by ID',
        endpoint: '/api/simulations/:id',
        method: 'GET',
        description: 'Get specific simulation details',
        params: {
          id: 'sim_test'
        }
      }
    ]
  }
};