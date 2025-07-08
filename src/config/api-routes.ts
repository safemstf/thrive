// config/api-routes.ts
export interface RouteDefinition {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  needsAuth?: boolean;
  params?: Record<string, string>;
  body?: any;
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
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
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
          name: 'Updated Name',
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
          id: '123'
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
        description: 'Get all books with filtering'
      },
      {
        name: 'Get Book by ID',
        endpoint: '/api/books/:id',
        method: 'GET',
        description: 'Get single book',
        params: {
          id: '123'
        }
      },
      {
        name: 'Create Book',
        endpoint: '/api/books',
        method: 'POST',
        description: 'Create new book',
        needsAuth: true,
        body: {
          title: 'Test Book',
          author: 'Test Author',
          description: 'A test book',
          gradeLevel: 'high school',
          subject: 'Mathematics',
          difficulty: 'intermediate'
        }
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
        description: 'Get gallery items with pagination and filtering',
        params: {
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
        description: 'Get featured gallery items',
        params: {
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
          id: '123456789'
        },
        needsAuth: false
      },
      {
        name: 'Create Gallery Piece',
        endpoint: '/api/gallery',
        method: 'POST',
        description: 'Create a new gallery piece (without file upload)',
        needsAuth: true,
        body: {
          title: 'Test Artwork',
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
        name: 'Update Gallery Piece',
        endpoint: '/api/gallery/:id',
        method: 'PUT',
        description: 'Update an existing gallery piece',
        needsAuth: true,
        params: {
          id: '123456789'
        },
        body: {
          title: 'Updated Artwork',
          description: 'Updated description',
          visibility: 'public',
          price: 150
        }
      },
      {
        name: 'Delete Gallery Piece',
        endpoint: '/api/gallery/:id',
        method: 'DELETE',
        description: 'Delete a gallery piece',
        needsAuth: true,
        params: {
          id: '123456789'
        }
      },
      {
        name: 'Batch Update Visibility',
        endpoint: '/api/gallery/batch-visibility',
        method: 'POST',
        description: 'Update visibility for multiple pieces',
        needsAuth: true,
        body: {
          ids: ['123456789', '987654321'],
          visibility: 'public'
        }
      },
      {
        name: 'Batch Delete Pieces',
        endpoint: '/api/gallery/batch-delete',
        method: 'POST',
        description: 'Delete multiple gallery pieces',
        needsAuth: true,
        body: {
          ids: ['123456789', '987654321']
        }
      },
      {
        name: 'Get Collections',
        endpoint: '/api/gallery/collections',
        method: 'GET',
        description: 'Get all gallery collections'
      },
      {
        name: 'Get Artists',
        endpoint: '/api/gallery/artists',
        method: 'GET',
        description: 'Get all artists'
      },
      {
        name: 'Get Artist by ID',
        endpoint: '/api/gallery/artists/:id',
        method: 'GET',
        description: 'Get specific artist details',
        params: {
          id: 'artist-1'
        }
      },
      {
        name: 'Get Artist Pieces',
        endpoint: '/api/gallery/artists/:artistId/pieces',
        method: 'GET',
        description: 'Get all pieces by a specific artist',
        params: {
          artistId: 'artist-1',
          limit: '20',
          page: '1'
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
        description: 'Get all concepts'
      },
      {
        name: 'Search Concepts',
        endpoint: '/api/concepts/search',
        method: 'GET',
        description: 'Search concepts',
        params: {
          q: 'algebra'
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
          bookId: '123'
        }
      }
    ]
  }
};