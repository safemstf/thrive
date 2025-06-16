// lib/api/gallery-client.ts
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
import { config } from '@/config/environment';

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
  
  // Upload with options
  uploadArtwork(file: File, options: {
    visibility: GalleryVisibility;
    generateThumbnail?: boolean;
    optimizeImages?: boolean;
    preserveMetadata?: boolean;
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  }): Promise<GalleryPiece>;
}

export class GalleryApiClient extends BaseApiClient implements GalleryAPI {
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

  async uploadArtwork(file: File, options: {
    visibility: GalleryVisibility;
    generateThumbnail?: boolean;
    optimizeImages?: boolean;
    preserveMetadata?: boolean;
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  }): Promise<GalleryPiece> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', options.visibility);
    
    if (options.generateThumbnail !== undefined) {
      formData.append('generateThumbnail', String(options.generateThumbnail));
    }
    if (options.optimizeImages !== undefined) {
      formData.append('optimizeImages', String(options.optimizeImages));
    }
    if (options.preserveMetadata !== undefined) {
      formData.append('preserveMetadata', String(options.preserveMetadata));
    }
    if (options.quality !== undefined) {
      formData.append('quality', String(options.quality));
    }
    if (options.maxWidth !== undefined) {
      formData.append('maxWidth', String(options.maxWidth));
    }
    if (options.maxHeight !== undefined) {
      formData.append('maxHeight', String(options.maxHeight));
    }

    const url = `${this.baseURL}/gallery/upload`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
    
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'ngrok-skip-browser-warning': 'true',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new APIError(
          errorData.message || `Upload failed: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Upload timeout', 408, 'TIMEOUT');
        }
        throw new APIError(error.message, undefined, 'UPLOAD_ERROR');
      }
      
      throw new APIError('Upload failed', undefined, 'UNKNOWN');
    }
  }

  async uploadImage(file: File, metadata?: Record<string, any>): Promise<{ url: string; thumbnailUrl?: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const url = `${this.baseURL}/gallery/upload`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
    
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'ngrok-skip-browser-warning': 'true',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new APIError(
          errorData.message || `Upload failed: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Upload timeout', 408, 'TIMEOUT');
        }
        throw new APIError(error.message, undefined, 'UPLOAD_ERROR');
      }
      
      throw new APIError('Upload failed', undefined, 'UNKNOWN');
    }
  }
}

// Export singleton instance
export const galleryApi = new GalleryApiClient();