// src/config/api-routes/gallery.routes.ts
import { RouteCategory, generateUniqueId } from '../api-routes';

export const galleryRoutes: RouteCategory = {
  name: 'Gallery',
  routes: [
    // Public endpoints
    {
      name: 'Get Gallery Pieces',
      endpoint: '/api/gallery',
      method: 'GET',
      description: 'Get gallery items with pagination',
      queryParams: {
        limit: '10',
        page: '1',
        visibility: 'public',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    },
    {
      name: 'Get Featured Pieces',
      endpoint: '/api/gallery/featured',
      method: 'GET',
      description: 'Get featured items',
      queryParams: {
        limit: '6'
      }
    },
    {
      name: 'Get Gallery Stats',
      endpoint: '/api/gallery/stats',
      method: 'GET',
      description: 'Get gallery statistics'
    },
    {
      name: 'Debug Upload Directory',
      endpoint: '/api/gallery/debug/uploads',
      method: 'GET',
      description: 'Debug upload directory contents'
    },
    {
      name: 'Verify Gallery Setup',
      endpoint: '/api/gallery/verify-setup',
      method: 'GET',
      description: 'Verify upload configuration'
    },
    {
      name: 'Test Image Access',
      endpoint: '/api/gallery/test-image/:filename',
      method: 'GET',
      description: 'Test direct image access',
      params: {
        filename: 'test.jpg'
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Single Piece',
      endpoint: '/api/gallery/:id',
      method: 'GET',
      description: 'Get specific piece',
      params: {
        id: 'PLACEHOLDER_GALLERY_ID'
      },
      skipInBatchTest: true
    },
    
    // Auth required endpoints
    {
      name: 'Create Gallery Piece',
      endpoint: '/api/gallery',
      method: 'POST',
      description: 'Create new gallery piece',
      needsAuth: true,
      body: () => ({
        title: `Test Artwork ${Date.now()}`,
        description: 'A test gallery piece',
        artist: 'Test Artist',
        visibility: 'private',
        tags: ['test', 'demo'],
        category: 'digital',
        price: 100,
        currency: 'USD',
        portfolioId: generateUniqueId() // Temporary ID for testing
      })
    },
    {
      name: 'Upload Gallery Image',
      endpoint: '/api/gallery/upload',
      method: 'POST',
      description: 'Upload image with optional metadata',
      needsAuth: false, // Works with or without auth per backend
      body: {
        note: 'Requires multipart/form-data with file upload'
      },
      skipInBatchTest: true // File uploads don't work in batch tests
    },
    {
      name: 'Debug Upload',
      endpoint: '/api/gallery/debug-upload',
      method: 'POST',
      description: 'Debug multer upload (dev only)',
      body: {
        test: 'debug'
      }
    },
    {
      name: 'Update Gallery Piece',
      endpoint: '/api/gallery/:id',
      method: 'PUT',
      description: 'Update gallery piece',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_GALLERY_ID'
      },
      body: {
        title: 'Updated Artwork',
        description: 'Updated description',
        visibility: 'public'
      },
      skipInBatchTest: true
    },
    {
      name: 'Delete Gallery Piece',
      endpoint: '/api/gallery/:id',
      method: 'DELETE',
      description: 'Delete gallery piece',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_GALLERY_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Batch Update Visibility',
      endpoint: '/api/gallery/batch-visibility',
      method: 'POST',
      description: 'Batch update visibility',
      needsAuth: true,
      body: {
        ids: [],
        visibility: 'public'
      },
      skipInBatchTest: true
    },
    {
      name: 'Batch Delete Pieces',
      endpoint: '/api/gallery/batch-delete',
      method: 'POST',
      description: 'Batch delete pieces',
      needsAuth: true,
      body: {
        ids: []
      },
      skipInBatchTest: true
    }
  ]
};