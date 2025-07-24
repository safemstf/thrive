// src/config/api-routes/users.routes.ts
import { RouteCategory } from '../api-routes';

export const usersRoutes: RouteCategory = {
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
        id: 'PLACEHOLDER_USER_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Update User',
      endpoint: '/api/users/:id',
      method: 'PUT',
      description: 'Update user',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_USER_ID'
      },
      body: {
        role: 'user',
        status: 'active'
      },
      skipInBatchTest: true
    },
    {
      name: 'Delete User',
      endpoint: '/api/users/:id',
      method: 'DELETE',
      description: 'Delete user',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_USER_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Get User Progress',
      endpoint: '/api/users/:id/progress',
      method: 'GET',
      description: 'Get user progress',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_USER_ID'
      },
      skipInBatchTest: true
    }
  ]
};