// src/config/api-routes/users-me.routes.ts - Fixed
import { RouteCategory } from '@/types/api.types';

export const usersMeRoutes: RouteCategory = {
  name: 'Users Me',
  routes: [
    {
      name: 'Get User Skills',
      endpoint: '/api/users/me/skills',
      method: 'GET',
      description: 'Get current user skill development summary',
      needsAuth: true,
      tags: {
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true
      }
    },
    {
      name: 'Get Learning Paths',
      endpoint: '/api/users/me/learning-paths',
      method: 'GET',
      description: 'Get current user learning paths and certifications',
      needsAuth: true,
      tags: {
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        educational: true
      }
    },
    {
      name: 'Get Market Intelligence',
      endpoint: '/api/users/me/market-intelligence',
      method: 'GET',
      description: 'Get relevant market intelligence data',
      needsAuth: true,
      tags: {
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        analytics: true
      }
    },
    {
      name: 'Get Privacy Settings',
      endpoint: '/api/users/me/privacy-settings',
      method: 'GET',
      description: 'Get privacy and data sharing preferences',
      needsAuth: true,
      tags: {
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        settings: true
      }
    },
    {
      name: 'Update Privacy Settings',
      endpoint: '/api/users/me/privacy-settings',
      method: 'PUT',
      description: 'Update privacy preferences',
      needsAuth: true,
      body: {
        shareProgressPublicly: true,
        allowPortfolioDiscovery: true,
        enableAnalyticsTracking: false,
        showLearningActivity: true
      },
      tags: {
        dataCategory: 'user',
        requiresAuth: true,
        settings: true,
        modifiesData: true
      }
    },
    {
      name: 'Get Account Info',
      endpoint: '/api/users/me/account-info',
      method: 'GET',
      description: 'Get account and subscription info',
      needsAuth: true,
      tags: {
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        account: true
      }
    },
    {
      name: 'Update Account Details',
      endpoint: '/api/users/me/account-info',
      method: 'PUT',
      description: 'Update account details',
      needsAuth: true,
      body: {
        name: 'Updated User Name',
        email: 'updated@example.com',
        timezone: 'America/New_York',
        language: 'en'
      },
      tags: {
        dataCategory: 'user',
        requiresAuth: true,
        account: true,
        modifiesData: true
      }
    },
    {
      name: 'Get Billing Info',
      endpoint: '/api/users/me/billing',
      method: 'GET',
      description: 'Get billing and subscription info',
      needsAuth: true,
      tags: {
        dataCategory: 'user',
        readOnly: true,
        requiresAuth: true,
        billing: true
      }
    },
    {
      name: 'Upgrade Subscription',
      endpoint: '/api/users/me/billing/upgrade',
      method: 'POST',
      description: 'Upgrade subscription plan',
      needsAuth: true,
      body: {
        planType: 'premium',
        billingCycle: 'monthly'
      },
      tags: {
        dataCategory: 'user',
        requiresAuth: true,
        billing: true,
        modifiesData: true,
        subscription: true
      }
    },
    {
      name: 'Delete User Account',
      endpoint: '/api/users/me/delete-account',
      method: 'DELETE',
      description: 'Delete user account and data',
      needsAuth: true,
      body: {
        confirmPassword: 'user_password',
        reason: 'testing'
      },
      skipInBatchTest: true,
      tags: {
        dataCategory: 'user',
        requiresAuth: true,
        destructive: true,
        account: true,
        dangerousOperation: true
      }
    }
  ]
};