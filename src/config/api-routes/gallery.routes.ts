// config/api-routes/gallery.routes.ts
import { RouteCategory } from '../api-routes';

export const galleryRoutes: RouteCategory = {
  name: 'Gallery',
  routes: [
    {
      name: 'Get Gallery Pieces',
      endpoint: '/api/gallery',
      method: 'GET',
      description: 'Get gallery items with pagination and filtering',
      params: {
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
      description: 'Get featured gallery items',
      params: {
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
      name: 'Get Single Piece',
      endpoint: '/api/gallery/:id',
      method: 'GET',
      description: 'Get a specific gallery piece by ID',
      params: {
        id: '123456789'
      },
      needsAuth: false
    },
    {
      name: 'Create Gallery Piece',
      endpoint: '/api/gallery',
      method: 'POST',
      description: 'Create a new gallery piece (without file upload)',
      needsAuth: true,
      body: {
        title: 'Test Artwork',
        description: 'A test gallery piece',
        artist: 'Test Artist',
        visibility: 'private',
        tags: ['test', 'demo'],
        category: 'digital',
        price: 100,
        currency: 'USD'
      }
    },
    {
      name: 'Update Gallery Piece',
      endpoint: '/api/gallery/:id',
      method: 'PUT',
      description: 'Update an existing gallery piece',
      needsAuth: true,
      params: {
        id: '123456789'
      },
      body: {
        title: 'Updated Artwork',
        description: 'Updated description',
        visibility: 'public',
        price: 150
      }
    },
    {
      name: 'Delete Gallery Piece',
      endpoint: '/api/gallery/:id',
      method: 'DELETE',
      description: 'Delete a gallery piece',
      needsAuth: true,
      params: {
        id: '123456789'
      }
    },
    {
      name: 'Batch Update Visibility',
      endpoint: '/api/gallery/batch-visibility',
      method: 'POST',
      description: 'Update visibility for multiple pieces',
      needsAuth: true,
      body: {
        ids: ['123456789', '987654321'],
        visibility: 'public'
      }
    },
    {
      name: 'Batch Delete Pieces',
      endpoint: '/api/gallery/batch-delete',
      method: 'POST',
      description: 'Delete multiple gallery pieces',
      needsAuth: true,
      body: {
        ids: ['123456789', '987654321']
      }
    },
    {
      name: 'Get Collections',
      endpoint: '/api/gallery/collections',
      method: 'GET',
      description: 'Get all gallery collections'
    },
    {
      name: 'Get Artists',
      endpoint: '/api/gallery/artists',
      method: 'GET',
      description: 'Get all artists'
    },
    {
      name: 'Get Artist by ID',
      endpoint: '/api/gallery/artists/:id',
      method: 'GET',
      description: 'Get specific artist details',
      params: {
        id: 'artist-1'
      }
    },
    {
      name: 'Get Artist Pieces',
      endpoint: '/api/gallery/artists/:artistId/pieces',
      method: 'GET',
      description: 'Get all pieces by a specific artist',
      params: {
        artistId: 'artist-1',
        limit: '20',
        page: '1'
      }
    }
  ]
};