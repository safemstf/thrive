// src/config/api-routes/portfolios.routes.ts
import { RouteCategory } from '@/types/api.types';

export const portfoliosRoutes: RouteCategory = {
  name: 'Portfolios',
  routes: [
    // Public Portfolio Discovery
    {
      name: 'List All Portfolios',
      endpoint: '/api/portfolios',
      method: 'GET',
      description: 'Get all portfolios with pagination',
      queryParams: {
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'desc'
      }
    },
    {
      name: 'Discover Portfolios',
      endpoint: '/api/portfolios/discover',
      method: 'GET',
      description: 'Discover portfolios with filters',
      queryParams: {
        page: 1,
        limit: 10
      }
    },
    {
      name: 'Get Featured Portfolios',
      endpoint: '/api/portfolios/featured',
      method: 'GET',
      description: 'Get featured portfolios'
    },
    {
      name: 'Get Trending Portfolios',
      endpoint: '/api/portfolios/trending',
      method: 'GET',
      description: 'Get trending portfolios',
      queryParams: {
        period: 'week'
      }
    },
    {
      name: 'Search Portfolios',
      endpoint: '/api/portfolios/search',
      method: 'GET',
      description: 'Search portfolios by query',
      queryParams: {
        q: 'art'
      }
    },
    {
      name: 'Get Portfolio Stats',
      endpoint: '/api/portfolios/stats',
      method: 'GET',
      description: 'Get overall portfolio statistics'
    },

    // Current User Portfolio Management
    {
      name: 'Get My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'GET',
      description: 'Get current user portfolio',
      needsAuth: true
    },
    {
      name: 'Create My Portfolio',
      endpoint: '/api/portfolios/me/create',
      method: 'POST',
      description: 'Create portfolio for current user',
      needsAuth: true,
      body: {
        username: 'myportfolio',
        displayName: 'My Portfolio',
        bio: 'My creative portfolio',
        profession: 'Artist',
        skills: ['Digital Art', 'Photography'],
        tags: ['creative', 'portfolio']
      }
    },
    {
      name: 'Delete My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'DELETE',
      description: 'Delete current user portfolio',
      needsAuth: true,
      tags: { destructive: true }
    },
    {
      name: 'Get Portfolio Dashboard',
      endpoint: '/api/portfolios/me/dashboard',
      method: 'GET',
      description: 'Get current user portfolio dashboard metrics',
      needsAuth: true
    },
    {
      name: 'Upgrade Portfolio',
      endpoint: '/api/portfolios/me/upgrade',
      method: 'POST',
      description: 'Upgrade current user portfolio to hybrid plan',
      needsAuth: true,
      body: {
        plan: 'hybrid'
      }
    },

    // Gallery Management for Current User
    {
      name: 'Get My Gallery',
      endpoint: '/api/portfolios/me/gallery',
      method: 'GET',
      description: 'Get gallery pieces from my portfolio',
      needsAuth: true
    },
    {
      name: 'Add Gallery Piece',
      endpoint: '/api/portfolios/me/gallery',
      method: 'POST',
      description: 'Add new gallery piece to portfolio',
      needsAuth: true,
      body: {
        title: 'New Artwork',
        description: 'A beautiful piece',
        category: 'digital',
        visibility: 'public',
        tags: ['art', 'digital']
      }
    },
    {
      name: 'Update Gallery Piece',
      endpoint: '/api/portfolios/me/gallery/:pieceId',
      method: 'PUT',
      description: 'Update existing gallery piece',
      needsAuth: true,
      params: {
        pieceId: 'PLACEHOLDER_PIECE_ID'
      },
      body: {
        title: 'Updated Artwork',
        description: 'Updated description'
      }
    },
    {
      name: 'Delete Gallery Piece',
      endpoint: '/api/portfolios/me/gallery/:pieceId',
      method: 'DELETE',
      description: 'Delete gallery piece from portfolio',
      needsAuth: true,
      params: {
        pieceId: 'PLACEHOLDER_PIECE_ID'
      },
      tags: { destructive: true }
    },
    {
      name: 'Batch Delete Gallery',
      endpoint: '/api/portfolios/me/gallery/batch',
      method: 'DELETE',
      description: 'Delete multiple gallery pieces',
      needsAuth: true,
      body: {
        pieceIds: ['PLACEHOLDER_PIECE_ID']
      },
      tags: { destructive: true }
    },
    {
      name: 'Update Piece Visibility',
      endpoint: '/api/portfolios/me/gallery/:pieceId/visibility',
      method: 'PUT',
      description: 'Update gallery piece visibility',
      needsAuth: true,
      params: {
        pieceId: 'PLACEHOLDER_PIECE_ID'
      },
      body: {
        visibility: 'public'
      }
    },
    {
      name: 'Batch Update Visibility',
      endpoint: '/api/portfolios/me/gallery/batch/visibility',
      method: 'PUT',
      description: 'Update visibility for multiple pieces',
      needsAuth: true,
      body: {
        pieceIds: ['PLACEHOLDER_PIECE_ID'],
        visibility: 'public'
      }
    },
    {
      name: 'Get Gallery Stats',
      endpoint: '/api/portfolios/me/gallery/stats',
      method: 'GET',
      description: 'Get gallery statistics',
      needsAuth: true
    },

    // Concept Management (for Educational Portfolios)
    {
      name: 'Get My Concepts',
      endpoint: '/api/portfolios/me/concepts',
      method: 'GET',
      description: 'Get concept progress',
      needsAuth: true
    },
    {
      name: 'Add Concept',
      endpoint: '/api/portfolios/me/concepts/:conceptId',
      method: 'POST',
      description: 'Add concept to portfolio',
      needsAuth: true,
      params: {
        conceptId: 'PLACEHOLDER_CONCEPT_ID'
      }
    },
    {
      name: 'Update Concept Progress',
      endpoint: '/api/portfolios/me/concepts/:conceptId',
      method: 'PATCH',
      description: 'Update concept progress',
      needsAuth: true,
      params: {
        conceptId: 'PLACEHOLDER_CONCEPT_ID'
      },
      body: {
        progress: 75,
        completed: false
      }
    },

    // Portfolio Lookup
    {
      name: 'Get Portfolio by Username',
      endpoint: '/api/portfolios/by-username/:username',
      method: 'GET',
      description: 'Get portfolio by username',
      params: {
        username: 'admin'
      }
    },
    {
      name: 'Get Portfolio by ID',
      endpoint: '/api/portfolios/by-id/:id',
      method: 'GET',
      description: 'Get portfolio by ID',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      }
    },
    {
      name: 'Get Portfolio by User ID',
      endpoint: '/api/portfolios/user/:userId',
      method: 'GET',
      description: 'Get portfolio by user ID',
      params: {
        userId: 'PLACEHOLDER_USER_ID'
      }
    },

    // Portfolio Updates
    {
      name: 'Update Portfolio by Username',
      endpoint: '/api/portfolios/by-username/:username',
      method: 'PUT',
      description: 'Update portfolio details',
      needsAuth: true,
      params: {
        username: 'admin'
      },
      body: {
        bio: 'Updated bio',
        tags: ['updated', 'portfolio']
      }
    },
    {
      name: 'Delete Portfolio by ID',
      endpoint: '/api/portfolios/by-id/:id',
      method: 'DELETE',
      description: 'Delete portfolio by ID',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      tags: { destructive: true, requiresAdmin: true }
    },

    // Gallery for Specific Portfolio
    {
      name: 'Get Portfolio Gallery',
      endpoint: '/api/portfolios/by-id/:id/gallery',
      method: 'GET',
      description: 'Get gallery for specific portfolio',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      }
    },
    {
      name: 'Add to Portfolio Gallery',
      endpoint: '/api/portfolios/by-id/:id/gallery',
      method: 'POST',
      description: 'Add piece to specific portfolio',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      body: {
        title: 'New Gallery Item',
        description: 'Description',
        category: 'photography'
      }
    },

    // Reviews
    {
      name: 'Get Portfolio Reviews',
      endpoint: '/api/portfolios/by-id/:id/reviews',
      method: 'GET',
      description: 'Get reviews for portfolio',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      }
    },
    {
      name: 'Add Portfolio Review',
      endpoint: '/api/portfolios/by-id/:id/reviews',
      method: 'POST',
      description: 'Add review to portfolio',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      body: {
        rating: 5,
        comment: 'Great portfolio!'
      }
    },

    // Analytics and Tracking
    {
      name: 'Track Portfolio View',
      endpoint: '/api/portfolios/by-id/:id/views',
      method: 'POST',
      description: 'Track portfolio view',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      }
    },
    {
      name: 'Get Portfolio Analytics',
      endpoint: '/api/portfolios/by-id/:id/analytics',
      method: 'GET',
      description: 'Get portfolio analytics',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      }
    },
    {
      name: 'Get Portfolio Activity',
      endpoint: '/api/portfolios/me/activity',
      method: 'GET',
      description: 'Get user portfolio activity feed',
      needsAuth: true
    },
    {
      name: 'Get Portfolio Insights',
      endpoint: '/api/portfolios/me/insights',
      method: 'GET',
      description: 'Get portfolio growth insights',
      needsAuth: true
    },
    {
      name: 'Get Portfolio views by ID',
      endpoint: '/api/portfolios/by-id/:id/views',
      method: 'POST',
      description: 'Track portfolio view',
      params:
       {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      }
    },
    {
      name: 'Get Portfolio Analytics',
      endpoint: '/api/portfolios/by-id/:id/analytics',
      method: 'GET',
      description: 'Get portfolio analytics',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      }
    },

    // File Upload
    {
      name: 'Upload Portfolio Image',
      endpoint: '/api/portfolios/upload-image',
      method: 'POST',
      description: 'Upload profile or cover image',
      needsAuth: true,
      tags: { needsFileUpload: true },
      skipInBatchTest: true
    },

    // Sharing
    {
      name: 'Generate Share Link',
      endpoint: '/api/portfolios/by-id/:id/share',
      method: 'POST',
      description: 'Generate portfolio share link',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      body: {
        expiresIn: '7d'
      }
    },
    {
      name: 'Access Shared Portfolio',
      endpoint: '/api/portfolios/shared/:token',
      method: 'GET',
      description: 'Access portfolio via share token',
      params: {
        token: 'PLACEHOLDER_SHARE_TOKEN'
      }
    }
  ]
};