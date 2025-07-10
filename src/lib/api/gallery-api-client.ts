// lib/api/gallery-api-client.ts
import { BaseApiClient, APIError } from './base-api-client';
import {
  GalleryPiece,
  GalleryApiResponse,
  GalleryQueryParams,
  GalleryCollection,
  Artist,
  GalleryStats,
  ArtworkCategory,
  GalleryVisibility,
} from '@/types/gallery.types';

export interface GalleryAPI {
  // Gallery pieces
  getPieces(params?: GalleryQueryParams): Promise<GalleryApiResponse>;
  getPieceById(id: string): Promise<GalleryPiece>;
  create(piece: Omit<GalleryPiece, 'id' | 'createdAt' | 'updatedAt'>): Promise<GalleryPiece>;
  update(id: string, updates: Partial<GalleryPiece>): Promise<GalleryPiece>;
  delete(id: string): Promise<void>;
  
  // Collections
  getCollections(): Promise<GalleryCollection[]>;
  getCollectionById(id: string): Promise<GalleryCollection>;
  
  // Artists
  getArtists(): Promise<Artist[]>;
  getArtistById(id: string): Promise<Artist>;
  getArtistPieces(artistId: string): Promise<GalleryPiece[]>;
  
  // Gallery specific queries
  getFeatured(limit?: number): Promise<GalleryPiece[]>;
  getByCategory(category: ArtworkCategory): Promise<GalleryPiece[]>;
  getStats(): Promise<GalleryStats>;
  
  // Image upload
  uploadImage(file: File, metadata?: Record<string, any>): Promise<{ url: string; thumbnailUrl?: string }>;
  
  // Batch operations
  batchUpdateVisibility(pieceIds: string[], visibility: GalleryVisibility): Promise<void>;
  batchDeletePieces(pieceIds: string[]): Promise<void>;
}

export class GalleryApiClient extends BaseApiClient implements GalleryAPI {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  async getPieces(params?: GalleryQueryParams): Promise<GalleryApiResponse> {
    return this.requestWithRetry<GalleryApiResponse>('/gallery', { params });
  }

  async getPieceById(id: string): Promise<GalleryPiece> {
    return this.requestWithRetry<GalleryPiece>(`/gallery/${id}`);
  }

  async create(piece: Omit<GalleryPiece, 'id' | 'createdAt' | 'updatedAt'>): Promise<GalleryPiece> {
    return this.requestWithRetry<GalleryPiece>('/gallery', {
      method: 'POST',
      body: JSON.stringify(piece),
    });
  }

  async update(id: string, updates: Partial<GalleryPiece>): Promise<GalleryPiece> {
    return this.requestWithRetry<GalleryPiece>(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async delete(id: string): Promise<void> {
    return this.requestWithRetry<void>(`/gallery/${id}`, {
      method: 'DELETE',
    });
  }

  async getCollections(): Promise<GalleryCollection[]> {
    return this.requestWithRetry<GalleryCollection[]>('/gallery/collections');
  }

  async getCollectionById(id: string): Promise<GalleryCollection> {
    return this.requestWithRetry<GalleryCollection>(`/gallery/collections/${id}`);
  }

  async getArtists(): Promise<Artist[]> {
    return this.requestWithRetry<Artist[]>('/gallery/artists');
  }

  async getArtistById(id: string): Promise<Artist> {
    return this.requestWithRetry<Artist>(`/gallery/artists/${id}`);
  }

  async getArtistPieces(artistId: string): Promise<GalleryPiece[]> {
    return this.requestWithRetry<GalleryPiece[]>(`/gallery/artists/${artistId}/pieces`);
  }

  async getFeatured(limit: number = 10): Promise<GalleryPiece[]> {
    const response = await this.requestWithRetry<GalleryApiResponse>('/gallery/featured', {
      params: { limit },
    });
    return response.pieces;
  }

  async getByCategory(category: ArtworkCategory): Promise<GalleryPiece[]> {
    const response = await this.requestWithRetry<GalleryApiResponse>('/gallery', {
      params: { category },
    });
    return response.pieces;
  }

  async getStats(): Promise<GalleryStats> {
    return this.requestWithRetry<GalleryStats>('/gallery/stats');
  }

  async batchUpdateVisibility(pieceIds: string[], visibility: GalleryVisibility): Promise<void> {
    return this.requestWithRetry<void>('/gallery/batch-visibility', {
      method: 'POST',
      body: JSON.stringify({ ids: pieceIds, visibility }),
    });
  }

  async batchDeletePieces(pieceIds: string[]): Promise<void> {
    return this.requestWithRetry<void>('/gallery/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: pieceIds }),
    });
  }

  async uploadImage(file: File, metadata?: Record<string, any>): Promise<{ url: string; thumbnailUrl?: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (metadata) {
      // Add metadata fields individually to FormData
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }

    // Get auth token manually to ensure it's present
    const token = this.getAuthToken();
    if (!token) {
      throw new APIError('Authentication required for file upload', 401, 'NO_AUTH_TOKEN');
    }

    // Build the URL - the BaseApiClient will add /api prefix
    const endpoint = '/gallery/upload';
    
    try {
      console.log(`[Gallery] Starting upload...`);
      console.log(`[Gallery] File details:`, {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      console.log(`[Gallery] Metadata:`, metadata);
      
      // Use the base request method which handles URL construction
      const result = await this.request<{ url: string; thumbnailUrl?: string }>(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
        },
        timeout: 60000, // 60 second timeout for uploads
      });
      
      console.log(`[Gallery] Upload successful:`, result);
      return result;
    } catch (error) {
      console.error(`[Gallery] Upload failed:`, error);
      
      if (error instanceof APIError) {
        // Improve error messages
        if (error.status === 404) {
          throw new APIError(
            'Upload endpoint not found. Please check if the backend has /api/gallery/upload endpoint.',
            404,
            'UPLOAD_ENDPOINT_NOT_FOUND'
          );
        }
        throw error;
      }
      
      throw new APIError('Upload failed with unknown error', undefined, 'UNKNOWN_UPLOAD_ERROR');
    }
  }
}