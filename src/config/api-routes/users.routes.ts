// src/config/api-routes/users.routes.ts - Fixed
import { RouteCategory } from '@/types/api.types';

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
      },
      tags: {
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        requiresAdmin: true
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
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['USER_ID'],
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        requiresAdmin: true,
        requiresExistingData: true
      }
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
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['USER_ID'],
        dataCategory: 'user',
        requiresAuth: true,
        requiresAdmin: true,
        modifiesData: true,
        requiresExistingData: true
      }
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
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['USER_ID'],
        dataCategory: 'user',
        requiresAuth: true,
        requiresAdmin: true,
        destructive: true,
        requiresExistingData: true,
        dangerousOperation: true
      }
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
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['USER_ID'],
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        requiresAdmin: true,
        requiresExistingData: true,
        educational: true,
        analytics: true
      }
    },
    {
      name: 'Reset User Password',
      endpoint: '/api/users/:id/reset-password',
      method: 'POST',
      description: 'Reset user password',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_USER_ID'
      },
      body: {
        newPassword: 'NewPassword123!'
      },
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['USER_ID'],
        dataCategory: 'user',
        requiresAuth: true,
        requiresAdmin: true,
        modifiesData: true,
        requiresExistingData: true,
        account: true,
        dangerousOperation: true
      }
    }
  ]
};