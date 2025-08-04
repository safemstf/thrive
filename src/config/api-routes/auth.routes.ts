// src/config/api-routes/auth.routes.ts
import { RouteCategory } from '@/types/api.types';

export const authRoutes: RouteCategory = {
  name: 'Authentication',
  routes: [
    {
      name: 'Register User',
      endpoint: '/api/auth/register',
      method: 'POST',
      description: 'Register a new user account',
      body: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        username: 'testuser'
      }
    },
    {
      name: 'Login',
      endpoint: '/api/auth/login',
      method: 'POST',
      description: 'Login with email/username and password',
      body: {
        usernameOrEmail: 'admin@admin.com', // FIXED: Using correct field name
        password: 'admin123' // FIXED: Using correct admin password
      }
    },
    {
      name: 'Get Current User',
      endpoint: '/api/auth/me',
      method: 'GET',
      description: 'Get current authenticated user profile',
      needsAuth: true
    },
    {
      name: 'Update Profile',
      endpoint: '/api/auth/me',
      method: 'PUT',
      description: 'Update current user profile',
      needsAuth: true,
      body: {
        name: 'Updated Name',
        bio: 'Updated bio'
      }
    },
    {
      name: 'Verify Token',
      endpoint: '/api/auth/verify',
      method: 'POST',
      description: 'Verify JWT token validity',
      needsAuth: true
    },
    {
      name: 'Logout User',
      endpoint: '/api/auth/logout',
      method: 'POST',
      description: 'Logout current user',
      needsAuth: true
    }
  ]
};