// src/config/api-routes/concepts.routes.ts
import { RouteCategory } from '../api-routes';

export const conceptsRoutes: RouteCategory = {
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
        id: 'PLACEHOLDER_CONCEPT_ID'
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
        name: `Test Concept ${Date.now()}`,
        type: 'math',
        description: 'Test concept description',
        category: 'algebra',
        difficulty: 'beginner'
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
        name: 'Updated Concept',
        description: 'Updated description'
      },
      skipInBatchTest: true
    }
  ]
};