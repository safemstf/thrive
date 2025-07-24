// src/config/api-routes/progress.routes.ts
import { RouteCategory } from '../api-routes';

export const progressRoutes: RouteCategory = {
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
        bookId: 'PLACEHOLDER_BOOK_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Update Concept Progress',
      endpoint: '/api/progress/book/:bookId/concept/:conceptId',
      method: 'POST',
      description: 'Update concept progress',
      needsAuth: true,
      params: {
        bookId: 'PLACEHOLDER_BOOK_ID',
        conceptId: 'PLACEHOLDER_CONCEPT_ID'
      },
      body: {
        completed: true,
        score: 95
      },
      skipInBatchTest: true
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
        bookId: 'PLACEHOLDER_BOOK_ID'
      },
      skipInBatchTest: true
    }
  ]
};