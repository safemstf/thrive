// src/config/api-routes/portfolios.routes.ts
import { RouteCategory } from '../api-routes';
import { generateUniqueUsername } from '@/types/api.types';

export const portfoliosRoutes: RouteCategory = {
  name: 'Portfolios',
  routes: [
    // ===== Public Portfolio Discovery =====
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
      description: 'Discover portfolios with pagination and type filtering',
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
      description: 'Get featured portfolios by type',
      queryParams: {
        type: 'all'
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
      description: 'Get portfolio statistics by type'
    },

    // ===== Portfolio Management (Auth Required) =====
    {
      name: 'Get My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'GET',
      description: 'Get current user\'s portfolio with full details',
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
      name: 'Set Portfolio Type',
      endpoint: '/api/portfolios/me/type',
      method: 'PUT',
      description: 'Change portfolio type',
      needsAuth: true,
      body: {
        type: 'educational',
        preserveContent: true // Keep existing content when changing type
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

    // ===== Creative Portfolio - Gallery Management =====
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

    // ===== Educational Portfolio - Concepts Management =====
    {
      name: 'Get My Portfolio Concepts',
      endpoint: '/api/portfolios/me/concepts',
      method: 'GET',
      description: 'Get all concepts in my educational portfolio',
      needsAuth: true,
      queryParams: {
        status: 'all', // 'all' | 'completed' | 'in-progress' | 'not-started'
        category: 'all',
        bookId: null
      }
    },
    {
      name: 'Add Concept to Portfolio',
      endpoint: '/api/portfolios/me/concepts/:conceptId',
      method: 'POST',
      description: 'Add concept to educational portfolio',
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
      method: 'PUT',
      description: 'Update concept progress in portfolio',
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
    {
      name: 'Remove Concept from Portfolio',
      endpoint: '/api/portfolios/me/concepts/:conceptId',
      method: 'DELETE',
      description: 'Remove concept from portfolio',
      needsAuth: true,
      params: {
        conceptId: 'PLACEHOLDER_CONCEPT_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Get My Learning Path',
      endpoint: '/api/portfolios/me/learning-path',
      method: 'GET',
      description: 'Get personalized learning path',
      needsAuth: true
    },
    {
      name: 'Get My Certificates',
      endpoint: '/api/portfolios/me/certificates',
      method: 'GET',
      description: 'Get earned certificates',
      needsAuth: true
    },

    // ===== Collections Management (Both Types) =====
    {
      name: 'Get My Collections',
      endpoint: '/api/portfolios/me/collections',
      method: 'GET',
      description: 'Get all collections in portfolio',
      needsAuth: true
    },
    {
      name: 'Create Collection',
      endpoint: '/api/portfolios/me/collections',
      method: 'POST',
      description: 'Create a new collection',
      needsAuth: true,
      body: {
        name: 'My Best Work',
        description: 'A curated collection of my best pieces',
        type: 'artwork', // 'artwork' | 'concept' | 'mixed'
        visibility: 'public'
      }
    },
    {
      name: 'Get Collection Items',
      endpoint: '/api/portfolios/me/collections/:collectionId/items',
      method: 'GET',
      description: 'Get items in a collection',
      needsAuth: true,
      params: {
        collectionId: 'PLACEHOLDER_COLLECTION_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Add Item to Collection',
      endpoint: '/api/portfolios/me/collections/:collectionId/items',
      method: 'POST',
      description: 'Add item to collection',
      needsAuth: true,
      params: {
        collectionId: 'PLACEHOLDER_COLLECTION_ID'
      },
      body: {
        itemType: 'gallery_piece', // 'gallery_piece' | 'concept'
        itemId: 'PLACEHOLDER_ITEM_ID',
        position: 1
      },
      skipInBatchTest: true
    },

    // ===== Batch Operations =====
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
      name: 'Batch Update Concept Status',
      endpoint: '/api/portfolios/me/concepts/batch/status',
      method: 'PUT',
      description: 'Batch update concept completion status',
      needsAuth: true,
      body: {
        conceptIds: [],
        status: 'completed'
      },
      skipInBatchTest: true
    },

    // ===== Portfolio Statistics =====
    {
      name: 'Get Gallery Stats',
      endpoint: '/api/portfolios/me/gallery/stats',
      method: 'GET',
      description: 'Get gallery statistics for current user portfolio',
      needsAuth: true
    },
    {
      name: 'Get Learning Stats',
      endpoint: '/api/portfolios/me/learning/stats',
      method: 'GET',
      description: 'Get learning statistics for educational portfolio',
      needsAuth: true
    },
    {
      name: 'Get Portfolio Analytics',
      endpoint: '/api/portfolios/me/analytics',
      method: 'GET',
      description: 'Get comprehensive portfolio analytics',
      needsAuth: true,
      queryParams: {
        period: '30d' // '7d' | '30d' | '90d' | '1y' | 'all'
      }
    },

    // ===== Public Portfolio Access =====
    {
      name: 'Get Portfolio by Username',
      endpoint: '/api/portfolios/by-username/:username',
      method: 'GET',
      description: 'Get public portfolio by username',
      params: {
        username: 'admin'
      }
    },
    {
      name: 'Get Portfolio Gallery by Username',
      endpoint: '/api/portfolios/by-username/:username/gallery',
      method: 'GET',
      description: 'Get public gallery pieces for a portfolio',
      params: {
        username: 'admin'
      },
      queryParams: {
        page: '1',
        limit: '20'
      }
    },
    {
      name: 'Get Portfolio Concepts by Username',
      endpoint: '/api/portfolios/by-username/:username/concepts',
      method: 'GET',
      description: 'Get public learning progress for a portfolio',
      params: {
        username: 'admin'
      },
      queryParams: {
        status: 'completed'
      }
    },
    {
      name: 'Get Portfolio Collections by Username',
      endpoint: '/api/portfolios/by-username/:username/collections',
      method: 'GET',
      description: 'Get public collections for a portfolio',
      params: {
        username: 'admin'
      }
    }
  ]
};