// src/config/api-routes/users-me.routes.ts
import { RouteCategory } from '@/types/api.types';

export const usersMeRoutes: RouteCategory = {
  name: 'User Profile',
  routes: [
    {
      name: 'Get My Skills',
      endpoint: '/api/users/me/skills',
      method: 'GET',
      description: 'Get current user skill development summary',
      needsAuth: true
    },
    {
      name: 'Get Learning Paths',
      endpoint: '/api/users/me/learning-paths',
      method: 'GET',
      description: 'Get current user learning paths and certifications',
      needsAuth: true
    },
    {
      name: 'Get Market Intelligence',
      endpoint: '/api/users/me/market-intelligence',
      method: 'GET',
      description: 'Get relevant market intelligence data',
      needsAuth: true
    },
    {
      name: 'Get Privacy Settings',
      endpoint: '/api/users/me/privacy-settings',
      method: 'GET',
      description: 'Get privacy and data sharing preferences',
      needsAuth: true
    },
    {
      name: 'Update Privacy Settings',
      endpoint: '/api/users/me/privacy-settings',
      method: 'PUT',
      description: 'Update privacy preferences',
      needsAuth: true,
      body: {
        shareData: true,
        emailNotifications: true
      }
    },
    {
      name: 'Get Account Info',
      endpoint: '/api/users/me/account-info',
      method: 'GET',
      description: 'Get account and subscription info',
      needsAuth: true
    },
    {
      name: 'Update Account Info',
      endpoint: '/api/users/me/account-info',
      method: 'PUT',
      description: 'Update account details',
      needsAuth: true,
      body: {
        name: 'Updated Name',
        email: 'updated@example.com'
      }
    },
    {
      name: 'Get Billing Info',
      endpoint: '/api/users/me/billing',
      method: 'GET',
      description: 'Get billing and subscription info',
      needsAuth: true
    },
    {
      name: 'Upgrade Plan',
      endpoint: '/api/users/me/billing/upgrade',
      method: 'POST',
      description: 'Upgrade subscription plan',
      needsAuth: true,
      body: {
        plan: 'pro' // 'basic', 'pro', or 'enterprise'
      }
    },
    {
      name: 'Delete Account',
      endpoint: '/api/users/me/delete-account',
      method: 'DELETE',
      description: 'Delete user account and data',
      needsAuth: true,
      tags: { 
        destructive: true,
        dangerousOperation: true
      },
      skipInBatchTest: true
    }
  ]
};