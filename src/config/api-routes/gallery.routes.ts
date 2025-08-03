// src/config/api-routes/gallery.routes.ts - Fixed
import { RouteCategory, generateUniqueId } from '@/types/api.types';

export const galleryRoutes: RouteCategory = {
  name: 'Gallery',
  routes: [
    // ===== Public Endpoints =====
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
      },
      tags: {
        dataCategory: 'gallery',
        readOnly: true
      }
    },
    {
      name: 'Get Featured Pieces',
      endpoint: '/api/gallery/featured',
      method: 'GET',
      description: 'Get featured items',
      queryParams: {
        limit: '6'
      },
      tags: {
        dataCategory: 'gallery',
        readOnly: true
      }
    },
    {
      name: 'Get Gallery Stats',
      endpoint: '/api/gallery/stats',
      method: 'GET',
      description: 'Get gallery statistics',
      tags: {
        dataCategory: 'gallery',
        readOnly: true,
        analytics: true
      }
    },
    {
      name: 'Get Gallery Collections',
      endpoint: '/api/gallery/collections',
      method: 'GET',
      description: 'Get all collections',
      tags: {
        dataCategory: 'gallery',
        readOnly: true
      }
    },
    {
      name: 'Get Single Collection',
      endpoint: '/api/gallery/collections/:id',
      method: 'GET',
      description: 'Get specific collection',
      params: {
        id: 'PLACEHOLDER_COLLECTION_ID'
      },
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['COLLECTION_ID'],
        dataCategory: 'gallery',
        readOnly: true,
        requiresExistingData: true
      }
    },
    {
      name: 'Get Gallery Artists',
      endpoint: '/api/gallery/artists',
      method: 'GET',
      description: 'Get all artists',
      tags: {
        dataCategory: 'gallery',
        readOnly: true
      }
    },
    {
      name: 'Get Single Artist',
      endpoint: '/api/gallery/artists/:id',
      method: 'GET',
      description: 'Get specific artist',
      params: {
        id: 'PLACEHOLDER_ARTIST_ID'
      },
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['ARTIST_ID'],
        dataCategory: 'gallery',
        readOnly: true,
        requiresExistingData: true
      }
    },
    {
      name: 'Get Artist Pieces',
      endpoint: '/api/gallery/artists/:id/pieces',
      method: 'GET',
      description: 'Get all pieces by artist',
      params: {
        id: 'PLACEHOLDER_ARTIST_ID'
      },
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['ARTIST_ID'],
        dataCategory: 'gallery',
        readOnly: true,
        requiresExistingData: true
      }
    },
    {
      name: 'Get Single Piece',
      endpoint: '/api/gallery/:id',
      method: 'GET',
      description: 'Get specific piece',
      params: {
        id: 'PLACEHOLDER_GALLERY_ID'
      },
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['GALLERY_ID'],
        dataCategory: 'gallery',
        readOnly: true,
        requiresExistingData: true
      }
    },

    // ===== Debug & Utility Endpoints =====
    {
      name: 'Debug Upload Directory',
      endpoint: '/api/gallery/debug/uploads',
      method: 'GET',
      description: 'Debug upload directory contents',
      tags: {
        dataCategory: 'gallery',
        readOnly: true
      }
    },
    {
      name: 'Verify Gallery Setup',
      endpoint: '/api/gallery/verify-setup',
      method: 'GET',
      description: 'Verify upload configuration',
      tags: {
        dataCategory: 'gallery',
        readOnly: true
      }
    },
    {
      name: 'Test Image Access',
      endpoint: '/api/gallery/test-image/:filename',
      method: 'GET',
      description: 'Test direct image access',
      params: {
        filename: 'test.jpg'
      },
      skipInBatchTest: true,
      tags: {
        dataCategory: 'gallery',
        readOnly: true
      }
    },
    
    // ===== Auth Required Endpoints =====
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
      }),
      tags: {
        dataCategory: 'gallery',
        requiresAuth: true,
        modifiesData: true,
        setupRoute: true
      }
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
      skipInBatchTest: true, // File uploads don't work in batch tests
      tags: {
        dataCategory: 'gallery',
        needsFileUpload: true,
        fileUploadType: 'image'
      }
    },
    {
      name: 'Debug Upload',
      endpoint: '/api/gallery/debug-upload',
      method: 'POST',
      description: 'Debug multer upload (dev only)',
      body: {
        test: 'debug'
      },
      tags: {
        dataCategory: 'gallery',
        needsFileUpload: true
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
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['GALLERY_ID'],
        dataCategory: 'gallery',
        requiresAuth: true,
        modifiesData: true,
        requiresExistingData: true
      }
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
      skipInBatchTest: true,
      tags: {
        needsIdGenerator: true,
        placeholderIds: ['GALLERY_ID'],
        dataCategory: 'gallery',
        requiresAuth: true,
        destructive: true,
        requiresExistingData: true,
        cleanupRoute: true
      }
    },

    // ===== Batch Operations =====
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
      skipInBatchTest: true,
      tags: {
        dataCategory: 'gallery',
        requiresAuth: true,
        modifiesData: true,
        batchOperation: true,
        requiresExistingData: true
      }
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
      skipInBatchTest: true,
      tags: {
        dataCategory: 'gallery',
        requiresAuth: true,
        destructive: true,
        batchOperation: true,
        requiresExistingData: true,
        cleanupRoute: true,
        dangerousOperation: true
      }
    }
  ]
};