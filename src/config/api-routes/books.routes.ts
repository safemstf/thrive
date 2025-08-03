// src/config/api-routes/books.routes.ts
import { RouteCategory } from '@/types/api.types';

export const booksRoutes: RouteCategory = {
  name: 'Books',
  routes: [
    {
      name: 'Get All Books',
      endpoint: '/api/books',
      method: 'GET',
      description: 'Get all books with filtering',
      queryParams: {
        page: '1',
        limit: '10',
        category: 'all',
        difficulty: 'all'
      }
    },
    {
      name: 'Get Book by ID',
      endpoint: '/api/books/:id',
      method: 'GET',
      description: 'Get single book by ID',
      params: {
        id: 'PLACEHOLDER_BOOK_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Books by Category',
      endpoint: '/api/books/category/:mainCategory',
      method: 'GET',
      description: 'Get books by category',
      params: {
        mainCategory: 'programming'
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
        description: 'A test book for API testing',
        mainCategory: 'programming',
        subCategory: 'web-development',
        difficulty: 'beginner',
        estimatedHours: 10
      }
    },
    {
      name: 'Compose Custom Book',
      endpoint: '/api/books/compose',
      method: 'POST',
      description: 'Create custom book from concepts',
      needsAuth: true,
      body: {
        title: 'My Custom Book',
        conceptIds: [],
        description: 'A custom learning path'
      }
    },
    {
      name: 'Get Book Suggestions',
      endpoint: '/api/books/:id/suggestions',
      method: 'GET',
      description: 'Get book composition suggestions',
      params: {
        id: 'PLACEHOLDER_BOOK_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Analyze Book',
      endpoint: '/api/books/:id/analysis',
      method: 'GET',
      description: 'Analyze book',
      params: {
        id: 'PLACEHOLDER_BOOK_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Clone Book',
      endpoint: '/api/books/:id/clone',
      method: 'POST',
      description: 'Clone book',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_BOOK_ID'
      },
      skipInBatchTest: true
    }
  ]
};
