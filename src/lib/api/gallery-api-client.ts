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
  // Fix: Accept optional baseURL parameter like other API clients
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
      formData.append('metadata', JSON.stringify(metadata));
    }

    // Get auth token manually to ensure it's present
    const token = this.getAuthToken();
    if (!token) {
      throw new APIError('Authentication required for file upload', 401, 'NO_AUTH_TOKEN');
    }

    const url = `${this.baseURL}/api/gallery/upload`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for uploads
    
    try {
      console.log(`[Gallery] Uploading file to: ${url}`);
      console.log(`[Gallery] File details:`, {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      
      const headers: HeadersInit = {
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
      };
      // Note: Don't set Content-Type for FormData, let browser set it with boundary

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
      });

      clearTimeout(timeoutId);

      console.log(`[Gallery] Upload response status: ${response.status}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        console.error(`[Gallery] Upload failed:`, errorData);
        
        throw new APIError(
          errorData.message || `Upload failed: ${response.statusText}`,
          response.status,
          errorData.code || 'UPLOAD_FAILED',
          errorData.details
        );
      }

      const result = await response.json();
      console.log(`[Gallery] Upload successful:`, result);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Upload timeout - file may be too large', 408, 'UPLOAD_TIMEOUT');
        }
        
        console.error(`[Gallery] Upload error:`, error);
        throw new APIError(error.message, undefined, 'UPLOAD_ERROR');
      }
      
      throw new APIError('Upload failed with unknown error', undefined, 'UNKNOWN_UPLOAD_ERROR');
    }
  }
}

