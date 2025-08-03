// src/config/api-routes/progress.routes.ts - Fixed
import { RouteCategory } from '@/types/api.types';

export const progressRoutes: RouteCategory = {
  name: 'Progress',
  routes: [
    {
      name: 'Get Progress Summary',
      endpoint: '/api/progress',
      method: 'GET',
      description: 'Get user progress summary',
      needsAuth: true,
      tags: {
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        educational: true,
        analytics: true
      }
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
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['BOOK_ID'],
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        educational: true,
        requiresExistingData: true
      }
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
        status: 'completed',
        score: 90,
        timeSpent: 25,
        completedAt: new Date().toISOString()
      },
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['BOOK_ID', 'CONCEPT_ID'],
        dataCategory: 'user',
        requiresAuth: true,
        modifiesData: true,
        educational: true,
        requiresExistingData: true
      }
    },
    {
      name: 'Get Progress Stats',
      endpoint: '/api/progress/stats',
      method: 'GET',
      description: 'Get detailed progress statistics',
      needsAuth: true,
      queryParams: {
        period: '30d'
      },
      tags: {
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        educational: true,
        analytics: true
      }
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
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['BOOK_ID'],
        dataCategory: 'user',
        requiresAuth: true,
        destructive: true,
        educational: true,
        requiresExistingData: true,
        dangerousOperation: true
      }
    }
  ]
};
