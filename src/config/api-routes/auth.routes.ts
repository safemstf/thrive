// src/config/api-routes/auth.routes.ts
import {
  RouteCategory,
  generateUniqueUsername,
  generateUniqueEmail
} from '@/types/api.types';

export const authRoutes: RouteCategory = {
  name: 'Authentication',
  routes: [
    {
      name: 'Register',
      endpoint: '/api/auth/register',
      method: 'POST',
      description: 'Register new user',
      body: () => ({
        username: generateUniqueUsername(),
        email: generateUniqueEmail(),
        password: 'password123',
        name: 'Test User'
      }),
      skipInBatchTest: true // Skip to avoid creating too many users
    },
    {
      name: 'Login',
      endpoint: '/api/auth/login',
      method: 'POST',
      description: 'User login',
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
        name: 'Updated User',
        preferences: {
          theme: 'dark'
        }
      }
    },
    {
      name: 'Verify Token',
      endpoint: '/api/auth/verify',
      method: 'POST',
      description: 'Verify JWT token',
      needsAuth: true
    },
    {
      name: 'Logout',
      endpoint: '/api/auth/logout',
      method: 'POST',
      description: 'Logout user',
      needsAuth: true
    }
  ]
};