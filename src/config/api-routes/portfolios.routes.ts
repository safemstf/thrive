// src/config/api-routes/portfolios.routes.ts
import { RouteCategory } from '@/types/api.types';
import { generateUniqueUsername } from '@/types/api.types';

export const portfoliosRoutes: RouteCategory = {
  name: 'Portfolios',
  routes: [
    // ===== Core Public Discovery Endpoints =====
    {
      name: 'List All Portfolios',
      endpoint: '/api/portfolios',
      method: 'GET',
      description: 'List all portfolios with filtering',
      queryParams: {
        page: '1',
        limit: '10',
        type: 'all' // 'creative' | 'educational' | 'hybrid' | 'all'
      }
    },
    {
      name: 'Discover Portfolios',
      endpoint: '/api/portfolios/discover',
      method: 'GET',
      description: 'Discover portfolios with pagination',
      queryParams: {
        page: '1',
        limit: '10',
        type: 'creative'
      }
    },
    {
      name: 'Get Featured Portfolios',
      endpoint: '/api/portfolios/featured',
      method: 'GET',
      description: 'Get featured portfolios',
      queryParams: {
        type: 'all'
      }
    },
    {
      name: 'Get Trending Portfolios',
      endpoint: '/api/portfolios/trending',
      method: 'GET',
      description: 'Get trending portfolios by period',
      queryParams: {
        period: 'week' // 'day' | 'week' | 'month'
      }
    },
    {
      name: 'Search Portfolios',
      endpoint: '/api/portfolios/search',
      method: 'GET',
      description: 'Search portfolios',
      queryParams: {
        q: 'design',
        type: 'creative'
      }
    },
    {
      name: 'Get Portfolio Stats',
      endpoint: '/api/portfolios/stats',
      method: 'GET',
      description: 'Get portfolio statistics'
    },

    // ===== User Portfolio Management (Auth Required) =====
    {
      name: 'Get My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'GET',
      description: 'Get current user\'s portfolio',
      needsAuth: true
    },
    {
      name: 'Create My Portfolio',
      endpoint: '/api/portfolios/me/create',
      method: 'POST',
      description: 'Create portfolio for current user',
      needsAuth: true,
      body: () => ({
        username: generateUniqueUsername(),
        name: 'My Test Portfolio',
        bio: 'This is a test portfolio created via API',
        type: 'creative', // 'creative' | 'educational' | 'hybrid'
        tags: ['design', 'development', 'test'],
        settings: {
          showProgress: false,
          allowComments: true,
          isPublic: true
        }
      })
    },
    {
      name: 'Update My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'PUT',
      description: 'Update current user\'s portfolio',
      needsAuth: true,
      body: {
        name: 'Updated Portfolio Name',
        bio: 'Updated bio',
        type: 'hybrid'
      }
    },
    {
      name: 'Delete My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'DELETE',
      description: 'Delete current user\'s portfolio',
      needsAuth: true,
      skipInBatchTest: true
    },
    {
      name: 'Create Portfolio (Admin/User)',
      endpoint: '/api/portfolios',
      method: 'POST',
      description: 'Create a portfolio (admin or user)',
      needsAuth: true,
      body: () => ({
        username: generateUniqueUsername(),
        name: 'Admin Created Portfolio',
        bio: 'Portfolio created by admin',
        type: 'creative',
        userId: 'PLACEHOLDER_USER_ID'
      }),
      skipInBatchTest: true
    },

    // ===== Dashboard and Upgrade Endpoints =====
    {
      name: 'Get Portfolio Dashboard',
      endpoint: '/api/portfolios/me/dashboard',
      method: 'GET',
      description: 'Get current user\'s portfolio dashboard metrics',
      needsAuth: true
    },
    {
      name: 'Upgrade Portfolio to Hybrid',
      endpoint: '/api/portfolios/me/upgrade',
      method: 'POST',
      description: 'Upgrade current user\'s portfolio to hybrid plan',
      needsAuth: true,
      body: {
        plan: 'hybrid',
        preserveContent: true
      }
    },

    // ===== Gallery Management Through Portfolio Context =====
    {
      name: 'Get My Gallery Pieces',
      endpoint: '/api/portfolios/me/gallery',
      method: 'GET',
      description: 'Get all gallery pieces for current user portfolio',
      needsAuth: true,
      queryParams: {
        visibility: 'all',
        category: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    },
    {
      name: 'Add Gallery Piece to My Portfolio',
      endpoint: '/api/portfolios/me/gallery',
      method: 'POST',
      description: 'Add gallery piece to current user portfolio',
      needsAuth: true,
      body: {
        title: `Test Gallery Piece ${Date.now()}`,
        description: 'A test piece created via API',
        visibility: 'public',
        category: 'digital',
        tags: ['test', 'api'],
        price: 150,
        currency: 'USD'
      }
    },
    {
      name: 'Update Gallery Piece in Portfolio',
      endpoint: '/api/portfolios/me/gallery/:pieceId',
      method: 'PUT',
      description: 'Update gallery piece in portfolio',
      needsAuth: true,
      params: {
        pieceId: 'PLACEHOLDER_PIECE_ID'
      },
      body: {
        title: 'Updated Gallery Piece',
        visibility: 'private'
      },
      skipInBatchTest: true
    },
    {
      name: 'Delete Gallery Piece from Portfolio',
      endpoint: '/api/portfolios/me/gallery/:pieceId',
      method: 'DELETE',
      description: 'Delete a gallery piece from portfolio',
      needsAuth: true,
      params: {
        pieceId: 'PLACEHOLDER_PIECE_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Batch Delete Gallery Pieces',
      endpoint: '/api/portfolios/me/gallery/batch',
      method: 'DELETE',
      description: 'Batch delete gallery pieces',
      needsAuth: true,
      body: {
        pieceIds: []
      },
      skipInBatchTest: true
    },
    {
      name: 'Update Gallery Piece Visibility',
      endpoint: '/api/portfolios/me/gallery/:pieceId/visibility',
      method: 'PUT',
      description: 'Update gallery piece visibility',
      needsAuth: true,
      params: {
        pieceId: 'PLACEHOLDER_PIECE_ID'
      },
      body: {
        visibility: 'public'
      },
      skipInBatchTest: true
    },
    {
      name: 'Batch Update Gallery Visibility',
      endpoint: '/api/portfolios/me/gallery/batch/visibility',
      method: 'PUT',
      description: 'Batch update gallery piece visibility',
      needsAuth: true,
      body: {
        pieceIds: [],
        visibility: 'public'
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Gallery Stats',
      endpoint: '/api/portfolios/me/gallery/stats',
      method: 'GET',
      description: 'Get gallery statistics for current user portfolio',
      needsAuth: true
    },

    // ===== Concept Management (Educational/Hybrid Portfolios) =====
    {
      name: 'Get My Portfolio Concepts',
      endpoint: '/api/portfolios/me/concepts',
      method: 'GET',
      description: 'Get current user\'s concept progress',
      needsAuth: true,
      queryParams: {
        status: 'all', // 'all' | 'completed' | 'in-progress' | 'not-started'
        category: 'all',
        bookId: ''
      }
    },
    {
      name: 'Add Concept to Portfolio',
      endpoint: '/api/portfolios/me/concepts/:conceptId',
      method: 'POST',
      description: 'Add concept to current user\'s portfolio',
      needsAuth: true,
      params: {
        conceptId: 'PLACEHOLDER_CONCEPT_ID'
      },
      body: {
        status: 'in-progress',
        notes: 'Starting to learn this concept'
      },
      skipInBatchTest: true
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
        status: 'completed',
        completedAt: new Date().toISOString(),
        score: 95,
        notes: 'Mastered this concept!'
      },
      skipInBatchTest: true
    },

    // ===== Portfolio Lookup and Access =====
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
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Portfolio by User ID',
      endpoint: '/api/portfolios/user/:userId',
      method: 'GET',
      description: 'Get portfolio by user ID',
      params: {
        userId: 'PLACEHOLDER_USER_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Update Portfolio by Username',
      endpoint: '/api/portfolios/by-username/:username',
      method: 'PUT',
      description: 'Update portfolio by username',
      needsAuth: true,
      params: {
        username: 'admin'
      },
      body: {
        name: 'Updated Portfolio Name',
        bio: 'Updated via username endpoint'
      },
      skipInBatchTest: true
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
      skipInBatchTest: true
    },

    // ===== Gallery for Specific Portfolio =====
    {
      name: 'Get Portfolio Gallery by ID',
      endpoint: '/api/portfolios/by-id/:id/gallery',
      method: 'GET',
      description: 'Get gallery pieces for specific portfolio',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      queryParams: {
        page: '1',
        limit: '20'
      },
      skipInBatchTest: true
    },
    {
      name: 'Add Gallery Piece to Specific Portfolio',
      endpoint: '/api/portfolios/by-id/:id/gallery',
      method: 'POST',
      description: 'Add gallery piece to specific portfolio',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      body: {
        title: 'New Gallery Piece',
        description: 'Added to specific portfolio',
        visibility: 'public'
      },
      skipInBatchTest: true
    },

    // ===== Reviews System =====
    {
      name: 'Get Portfolio Reviews',
      endpoint: '/api/portfolios/by-id/:id/reviews',
      method: 'GET',
      description: 'Get reviews for portfolio',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      queryParams: {
        page: '1',
        limit: '10'
      },
      skipInBatchTest: true
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
        comment: 'Excellent portfolio!',
        reviewerName: 'Test Reviewer'
      },
      skipInBatchTest: true
    },

    // ===== Analytics and Tracking =====
    {
      name: 'Track Portfolio View',
      endpoint: '/api/portfolios/by-id/:id/views',
      method: 'POST',
      description: 'Track portfolio view',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      body: {
        referrer: 'direct',
        duration: 30
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Portfolio Analytics',
      endpoint: '/api/portfolios/by-id/:id/analytics',
      method: 'GET',
      description: 'Get portfolio analytics',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      queryParams: {
        period: 'month'
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Portfolio Activity Feed',
      endpoint: '/api/portfolios/me/activity',
      method: 'GET',
      description: 'Get user portfolio activity feed',
      needsAuth: true,
      queryParams: {
        limit: '20',
        page: '1'
      }
    },
    {
      name: 'Get Portfolio Growth Insights',
      endpoint: '/api/portfolios/me/insights',
      method: 'GET',
      description: 'Get portfolio growth insights',
      needsAuth: true,
      queryParams: {
        period: '30d'
      }
    },

    // ===== File Upload System =====
    {
      name: 'Upload Portfolio Image',
      endpoint: '/api/portfolios/upload-image',
      method: 'POST',
      description: 'Upload portfolio images (profile/cover)',
      needsAuth: true,
      body: {
        note: 'Requires multipart/form-data with file upload'
      },
      skipInBatchTest: true // File uploads don't work in batch tests
    },

    // ===== Sharing and Collaboration =====
    {
      name: 'Generate Portfolio Share Link',
      endpoint: '/api/portfolios/by-id/:id/share',
      method: 'POST',
      description: 'Generate portfolio share link',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      body: {
        expiresIn: 7, // days
        maxViews: 100
      },
      skipInBatchTest: true
    },
    {
      name: 'Access Portfolio via Share Token',
      endpoint: '/api/portfolios/shared/:token',
      method: 'GET',
      description: 'Access portfolio via share token',
      params: {
        token: 'PLACEHOLDER_SHARE_TOKEN'
      },
      skipInBatchTest: true
    }
  ]
};