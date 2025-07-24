// src/config/api-routes/portfolios.routes.ts
import { RouteCategory, generateUniqueUsername } from '../api-routes';

export const portfoliosRoutes: RouteCategory = {
  name: 'Portfolios',
  routes: [
    // Public endpoints - no auth needed
    {
      name: 'List All Portfolios',
      endpoint: '/api/portfolios',
      method: 'GET',
      description: 'List all portfolios with filtering',
      queryParams: {
        page: '1',
        limit: '10'
      }
    },
    {
      name: 'Discover Portfolios',
      endpoint: '/api/portfolios/discover',
      method: 'GET',
      description: 'Discover portfolios with pagination',
      queryParams: {
        page: '1',
        limit: '10'
      }
    },
    {
      name: 'Get Featured Portfolios',
      endpoint: '/api/portfolios/featured',
      method: 'GET',
      description: 'Get featured portfolios'
    },
    {
      name: 'Search Portfolios',
      endpoint: '/api/portfolios/search',
      method: 'GET',
      description: 'Search portfolios',
      queryParams: {
        q: 'design'
      }
    },
    {
      name: 'Get Portfolio Stats',
      endpoint: '/api/portfolios/stats',
      method: 'GET',
      description: 'Get portfolio statistics'
    },
    
    // Auth required - Current user portfolio endpoints
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
        tags: ['design', 'development', 'test']
      })
    },
    {
      name: 'Delete My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'DELETE',
      description: 'Delete current user\'s portfolio',
      needsAuth: true,
      skipInBatchTest: true // Don't delete in batch tests
    },
    
    // Gallery management through portfolio context
    {
      name: 'Get My Gallery Pieces',
      endpoint: '/api/portfolios/me/gallery',
      method: 'GET',
      description: 'Get all gallery pieces for current user portfolio',
      needsAuth: true
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
        tags: ['test', 'api']
      }
    },
    {
      name: 'Update Gallery Piece in Portfolio',
      endpoint: '/api/portfolios/me/gallery/:pieceId',
      method: 'PUT',
      description: 'Update gallery piece in portfolio',
      needsAuth: true,
      params: {
        pieceId: 'PLACEHOLDER_PIECE_ID' // Will be replaced with actual ID in tests
      },
      body: {
        title: 'Updated Gallery Piece',
        visibility: 'private'
      },
      skipInBatchTest: true // Needs actual piece ID
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
        pieceIds: [] // Will be populated with actual IDs
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
    
    // Create portfolio (general)
    {
      name: 'Create Portfolio',
      endpoint: '/api/portfolios',
      method: 'POST',
      description: 'Create a portfolio (admin or user)',
      needsAuth: true,
      body: () => ({
        username: generateUniqueUsername(),
        name: 'Test Portfolio',
        bio: 'Test portfolio description',
        tags: ['test', 'portfolio']
      }),
      skipInBatchTest: true
    },
    
    // Dynamic lookups - these work better with existing data
    {
      name: 'Get Portfolio by Username',
      endpoint: '/api/portfolios/by-username/:username',
      method: 'GET',
      description: 'Get portfolio by username',
      params: {
        username: 'admin' // Assuming admin exists
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
      skipInBatchTest: true // Needs actual ID
    },
    {
      name: 'Update Portfolio by Username',
      endpoint: '/api/portfolios/by-username/:username',
      method: 'PUT',
      description: 'Update portfolio by username',
      needsAuth: true,
      params: {
        username: 'PLACEHOLDER_USERNAME'
      },
      body: {
        name: 'Updated Portfolio',
        bio: 'Updated bio'
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
    
    // Gallery for specific portfolio
    {
      name: 'Get Gallery for Portfolio',
      endpoint: '/api/portfolios/by-id/:id/gallery',
      method: 'GET',
      description: 'Get gallery pieces for specific portfolio',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Add Gallery to Portfolio',
      endpoint: '/api/portfolios/by-id/:id/gallery',
      method: 'POST',
      description: 'Add gallery piece to specific portfolio',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      body: {
        title: 'New Gallery Piece',
        visibility: 'public'
      },
      skipInBatchTest: true
    }
  ]
};