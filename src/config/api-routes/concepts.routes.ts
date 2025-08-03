// src/config/api-routes/concepts.routes.ts
import { RouteCategory } from '@/types/api.types';

export const conceptsRoutes: RouteCategory = {
  name: 'Concepts',
  routes: [
    {
      name: 'Get All Concepts',
      endpoint: '/api/concepts',
      method: 'GET',
      description: 'Get all concepts with filtering',
      queryParams: {
        page: '1',
        limit: '20',
        category: 'all',
        difficulty: 'all',
        type: 'all'
      }
    },
    {
      name: 'Search Concepts',
      endpoint: '/api/concepts/search',
      method: 'GET',
      description: 'Search concepts',
      queryParams: {
        q: 'algebra',
        category: 'math',
        difficulty: 'beginner'
      }
    },
    {
      name: 'Get Concept by ID',
      endpoint: '/api/concepts/:id',
      method: 'GET',
      description: 'Get single concept by ID',
      params: {
        id: 'PLACEHOLDER_CONCEPT_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Concepts for Book',
      endpoint: '/api/concepts/book/:bookId',
      method: 'GET',
      description: 'Get concepts for a book',
      params: {
        bookId: 'PLACEHOLDER_BOOK_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Concepts by Type',
      endpoint: '/api/concepts/type/:type',
      method: 'GET',
      description: 'Get concepts by type',
      params: {
        type: 'lesson' // Changed from 'math' to match backend
      }
    },
    {
      name: 'Mark Concept Complete',
      endpoint: '/api/concepts/:id/complete',
      method: 'POST',
      description: 'Mark concept as completed',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_CONCEPT_ID'
      },
      body: {
        score: 95,
        timeSpent: 30,
        notes: 'Completed successfully'
      },
      skipInBatchTest: true
    },
    {
      name: 'Create Concept',
      endpoint: '/api/concepts',
      method: 'POST',
      description: 'Create new concept',
      needsAuth: true,
      body: () => ({
        title: `Test Concept ${Date.now()}`, // Changed from 'name' to 'title'
        description: 'A test concept for API testing',
        type: 'lesson',
        difficulty: 'beginner',
        estimatedMinutes: 15,
        category: 'programming'
      })
    },
    {
      name: 'Update Concept',
      endpoint: '/api/concepts/:id',
      method: 'PUT',
      description: 'Update concept',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_CONCEPT_ID'
      },
      body: {
        title: 'Updated Concept', // Changed from 'name' to 'title'
        difficulty: 'intermediate'
      },
      skipInBatchTest: true
    }
  ]
};
