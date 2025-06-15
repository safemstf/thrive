// src/config/api-routes.ts
export interface RouteDefinition {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  description: string;
  needsAuth?: boolean;
  params?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, any>;
}

export interface RouteCategory {
  name: string;
  icon?: any; // Lucide icon component
  routes: RouteDefinition[];
}

export const API_ROUTES: Record<string, RouteCategory> = {
  system: {
    name: 'System Routes',
    routes: [
      {
        name: 'API Info',
        method: 'GET',
        endpoint: '/',
        description: 'Get API information and available endpoints',
      },
      {
        name: 'Health Check',
        method: 'GET',
        endpoint: '/health',
        description: 'Check server health status',
      },
      {
        name: 'Server Stats',
        method: 'GET',
        endpoint: '/stats',
        description: 'Get server statistics and metrics',
      },
    ],
  },
  auth: {
    name: 'Authentication',
    routes: [
      {
        name: 'Login',
        method: 'POST',
        endpoint: '/api/auth/login',
        description: 'Authenticate user and receive token',
        body: {
          usernameOrEmail: 'test@example.com',
          password: 'test123',
        },
      },
      {
        name: 'Register',
        method: 'POST',
        endpoint: '/api/auth/register',
        description: 'Create new user account',
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'test123',
          firstName: 'Test',
          lastName: 'User',
        },
      },
      {
        name: 'Logout',
        method: 'POST',
        endpoint: '/api/auth/logout',
        description: 'End user session',
        needsAuth: true,
      },
      {
        name: 'Get Current User',
        method: 'GET',
        endpoint: '/api/auth/me',
        description: 'Get authenticated user profile',
        needsAuth: true,
      },
      {
        name: 'Update Profile',
        method: 'PUT',
        endpoint: '/api/auth/me',
        description: 'Update current user profile',
        needsAuth: true,
        body: {
          firstName: 'Updated',
          lastName: 'Name',
        },
      },
    ],
  },
  users: {
    name: 'User Management',
    routes: [
      {
        name: 'List Users',
        method: 'GET',
        endpoint: '/api/users',
        description: 'Get paginated list of users',
        needsAuth: true,
        queryParams: {
          page: 1,
          limit: 10,
        },
      },
      {
        name: 'Get User by ID',
        method: 'GET',
        endpoint: '/api/users/:id',
        description: 'Get specific user details',
        needsAuth: true,
        params: {
          id: '1',
        },
      },
      {
        name: 'Update User',
        method: 'PUT',
        endpoint: '/api/users/:id',
        description: 'Update user information',
        needsAuth: true,
        params: {
          id: '1',
        },
        body: {
          firstName: 'Updated',
          lastName: 'User',
        },
      },
      {
        name: 'Delete User',
        method: 'DELETE',
        endpoint: '/api/users/:id',
        description: 'Delete user account',
        needsAuth: true,
        params: {
          id: '1',
        },
      },
    ],
  },
  books: {
    name: 'Books & Educational Content',
    routes: [
      {
        name: 'List Books',
        method: 'GET',
        endpoint: '/api/books',
        description: 'Get all books with optional filters',
        queryParams: {
          category: 'MATHEMATICS',
          difficulty: 'INTERMEDIATE',
          page: 1,
          limit: 10,
        },
      },
      {
        name: 'Get Book by ID',
        method: 'GET',
        endpoint: '/api/books/:id',
        description: 'Get detailed book information',
        params: {
          id: '1',
        },
      },
      {
        name: 'Create Book',
        method: 'POST',
        endpoint: '/api/books',
        description: 'Add new book to library',
        needsAuth: true,
        body: {
          title: 'Test Book',
          author: 'Test Author',
          description: 'A test book description',
          category: 'MATHEMATICS',
          subCategory: 'ALGEBRA',
          difficulty: 'INTERMEDIATE',
          isbn: '978-1234567890',
        },
      },
      {
        name: 'Update Book',
        method: 'PUT',
        endpoint: '/api/books/:id',
        description: 'Update book information',
        needsAuth: true,
        params: {
          id: '1',
        },
        body: {
          title: 'Updated Book Title',
          description: 'Updated description',
        },
      },
      {
        name: 'Delete Book',
        method: 'DELETE',
        endpoint: '/api/books/:id',
        description: 'Remove book from library',
        needsAuth: true,
        params: {
          id: '1',
        },
      },
      {
        name: 'Get Math Concepts',
        method: 'GET',
        endpoint: '/api/books/:id/math-concepts',
        description: 'Get mathematical concepts covered in book',
        params: {
          id: '1',
        },
      },
      {
        name: 'Get Science Concepts',
        method: 'GET',
        endpoint: '/api/books/:id/science-concepts',
        description: 'Get scientific concepts covered in book',
        params: {
          id: '1',
        },
        queryParams: {
          discipline: 'PHYSICS',
        },
      },
      {
        name: 'Get Grammar Rules',
        method: 'GET',
        endpoint: '/api/books/:id/grammar-rules',
        description: 'Get grammar rules covered in book',
        params: {
          id: '1',
        },
      },
      {
        name: 'Get Books by Category',
        method: 'GET',
        endpoint: '/api/categories/:category/books',
        description: 'Get all books in a specific category',
        params: {
          category: 'SCIENCE',
        },
        queryParams: {
          subCategory: 'PHYSICS',
        },
      },
    ],
  },
  gallery: {
    name: 'Gallery Management',
    routes: [
      {
        name: 'List Gallery Pieces',
        method: 'GET',
        endpoint: '/api/gallery',
        description: 'Get paginated gallery pieces',
        queryParams: {
          page: 1,
          limit: 20,
          category: 'painting',
          status: 'available',
        },
      },
      {
        name: 'Get Gallery Piece',
        method: 'GET',
        endpoint: '/api/gallery/:id',
        description: 'Get specific gallery piece details',
        params: {
          id: '1',
        },
      },
      {
        name: 'Create Gallery Piece',
        method: 'POST',
        endpoint: '/api/gallery',
        description: 'Add new artwork to gallery',
        needsAuth: true,
        body: {
          title: 'Test Artwork',
          artist: 'Test Artist',
          description: 'A beautiful test piece',
          category: 'painting',
          medium: 'Oil on canvas',
          dimensions: '24x36 inches',
          year: 2024,
          price: 5000,
          status: 'available',
        },
      },
      {
        name: 'Update Gallery Piece',
        method: 'PUT',
        endpoint: '/api/gallery/:id',
        description: 'Update artwork information',
        needsAuth: true,
        params: {
          id: '1',
        },
        body: {
          title: 'Updated Artwork Title',
          price: 6000,
          status: 'sold',
        },
      },
      {
        name: 'Delete Gallery Piece',
        method: 'DELETE',
        endpoint: '/api/gallery/:id',
        description: 'Remove artwork from gallery',
        needsAuth: true,
        params: {
          id: '1',
        },
      },
      {
        name: 'Get Featured Pieces',
        method: 'GET',
        endpoint: '/api/gallery/featured',
        description: 'Get featured artworks',
        queryParams: {
          limit: 10,
        },
      },
      {
        name: 'Get Collections',
        method: 'GET',
        endpoint: '/api/gallery/collections',
        description: 'Get all gallery collections',
      },
      {
        name: 'Get Collection by ID',
        method: 'GET',
        endpoint: '/api/gallery/collections/:id',
        description: 'Get specific collection details',
        params: {
          id: '1',
        },
      },
      {
        name: 'Get Artists',
        method: 'GET',
        endpoint: '/api/gallery/artists',
        description: 'Get all artists in gallery',
      },
      {
        name: 'Get Artist by ID',
        method: 'GET',
        endpoint: '/api/gallery/artists/:id',
        description: 'Get specific artist details',
        params: {
          id: '1',
        },
      },
      {
        name: 'Get Artist Pieces',
        method: 'GET',
        endpoint: '/api/gallery/artists/:id/pieces',
        description: 'Get all artworks by specific artist',
        params: {
          id: '1',
        },
      },
      {
        name: 'Get Gallery Stats',
        method: 'GET',
        endpoint: '/api/gallery/stats',
        description: 'Get gallery statistics and metrics',
      },
      {
        name: 'Upload Gallery Image',
        method: 'POST',
        endpoint: '/api/gallery/upload',
        description: 'Upload artwork image',
        needsAuth: true,
        body: 'FormData with image file',
      },
    ],
  },
  search: {
    name: 'Search & Analytics',
    routes: [
      {
        name: 'Search Content',
        method: 'POST',
        endpoint: '/api/search',
        description: 'Search across all content types',
        body: {
          query: 'mathematics',
          filters: {
            contentTypes: ['book', 'gallery'],
            categories: ['MATHEMATICS', 'SCIENCE'],
          },
        },
      },
      {
        name: 'Get Popular Books',
        method: 'GET',
        endpoint: '/api/analytics/popular-books',
        description: 'Get most viewed/popular books',
        queryParams: {
          limit: 10,
        },
      },
      {
        name: 'Track Content View',
        method: 'POST',
        endpoint: '/api/analytics/track',
        description: 'Track user content interaction',
        body: {
          userId: '1',
          contentId: '1',
          contentType: 'book',
          action: 'view',
        },
      },
      {
        name: 'Get User Progress',
        method: 'GET',
        endpoint: '/api/users/:userId/progress',
        description: 'Get user learning progress',
        needsAuth: true,
        params: {
          userId: '1',
        },
        queryParams: {
          bookId: '1',
        },
      },
    ],
  },
};

// Helper function to get all routes flat
export function getAllRoutes(): RouteDefinition[] {
  return Object.values(API_ROUTES).flatMap(category => category.routes);
}

// Helper function to get routes by category
export function getRoutesByCategory(categoryKey: string): RouteDefinition[] {
  return API_ROUTES[categoryKey]?.routes || [];
}

// Helper function to get authenticated routes only
export function getAuthenticatedRoutes(): RouteDefinition[] {
  return getAllRoutes().filter(route => route.needsAuth);
}

// Helper function to get public routes only
export function getPublicRoutes(): RouteDefinition[] {
  return getAllRoutes().filter(route => !route.needsAuth);
}

// Helper to replace URL parameters
export function replaceRouteParams(endpoint: string, params?: Record<string, string>): string {
  if (!params) return endpoint;
  
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  return url;
}

// Helper to build query string
export function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}