// lib/api/portfolio-api-client.ts - ALIGNED with backend structure
import { BaseApiClient, APIError } from './base-api-client';
import {
  Portfolio,
  PortfolioWithPieces,
  PortfolioListResponse,
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioFilters,
  PortfolioReview,
  CreateReviewDto,
  ReviewListResponse,
  PortfolioAnalytics,
  PortfolioShareLink,
  PortfolioKind
} from '@/types/portfolio.types';
import { GalleryPiece, GalleryVisibility } from '@/types/gallery.types';
import { ConceptProgress } from '@/types/educational.types';
import { config } from '@/config/environment';

// Enhanced interfaces for better type safety
export interface PortfolioStats {
  views: number;
  rating: number;
  totalRatings: number;
  galleryCount: number;
  projectCount: number;
  conceptCount: number;
  completedConcepts: number;
}

export interface BatchUploadResult {
  successful: GalleryPiece[];
  failed: Array<{ error: string; fileName: string }>;
}

export interface BatchOperationResult {
  successCount: number;
  failedCount: number;
  errors?: string[];
}

type PortfolioMeResponse = Portfolio | null;

export class PortfolioApiClient extends BaseApiClient {
  
  // ==================== CORE PORTFOLIO OPERATIONS ====================
  
  async create(data: CreatePortfolioDto): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>('/portfolios/me/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(data: UpdatePortfolioDto): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>('/portfolios/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getMyPortfolio(): Promise<Portfolio | null> {
    try {
      const response = await this.requestWithRetry<PortfolioMeResponse>('/portfolios/me');
      return response;
    } catch (err: any) {
      // Treat 404 as "no portfolio"
      if (err instanceof APIError && err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  async deleteMyPortfolio(deleteGalleryPieces: boolean = false): Promise<void> {
    return this.requestWithRetry<void>('/portfolios/me', {
      method: 'DELETE',
      body: JSON.stringify({ deleteGalleryPieces }),
    });
  }

  async upgrade(kind: PortfolioKind, preserveContent: boolean = true): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>('/portfolios/me/upgrade', {
      method: 'PUT',
      body: JSON.stringify({ kind, preserveContent }),
    });
  }

  async hasPortfolio(): Promise<boolean> {
    try {
      const response = await this.requestWithRetry<{ hasPortfolio: boolean }>('/portfolios/me/check');
      return response.hasPortfolio;
    } catch (error) {
      return false;
    }
  }

  // ==================== PUBLIC PORTFOLIO ACCESS ====================

  async getByUsername(username: string): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>(`/portfolios/by-username/${username}`);
  }

  async discover(
    filters?: PortfolioFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PortfolioListResponse> {
    return this.requestWithRetry<PortfolioListResponse>('/portfolios/discover', {
      params: { ...filters, page, limit },
    });
  }

  async getStats(): Promise<any> {
    return this.requestWithRetry('/portfolios/stats');
  }

  async getTypeConfig(type: string): Promise<any> {
    return this.requestWithRetry(`/portfolios/type-config/${type}`);
  }

  async trackView(
    portfolioId: string,
    data?: { referrer?: string; duration?: number }
  ): Promise<{ message: string; totalViews: number }> {
    return this.requestWithRetry(`/portfolios/by-id/${portfolioId}/views`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // ==================== PORTFOLIO GALLERY MANAGEMENT ====================
  
  async getMyGalleryPieces(): Promise<GalleryPiece[]> {
    try {
      const response = await this.requestWithRetry<any>('/portfolios/me/gallery');
      console.log('Raw gallery response:', response);
      
      // Handle backend response format - could be array or object with pieces property
      if (response && typeof response === 'object') {
        // If it has a pieces property, use that
        if (response.pieces && Array.isArray(response.pieces)) {
          return response.pieces;
        }
        
        // If it's an object with numeric keys, convert to array
        if (!Array.isArray(response)) {
          const keys = Object.keys(response);
          if (keys.every(key => /^\d+$/.test(key))) {
            const pieces = keys
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(key => response[key]);
            console.log('Converted object to array:', pieces);
            return pieces;
          }
        }
        
        // If it's already an array, return as is
        if (Array.isArray(response)) {
          return response;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get gallery pieces:', error);
      return [];
    }
  }

  async getPortfolioGalleryByUsername(username: string, page: number = 1, limit: number = 20): Promise<{
    pieces: GalleryPiece[];
    pagination: any;
    portfolio: any;
  }> {
    return this.requestWithRetry(`/portfolios/by-username/${username}/gallery`, {
      params: { page, limit }
    });
  }

  async addGalleryPiece(pieceData: {
    title: string;
    description?: string;
    imageUrl: string;
    category?: string;
    medium?: string;
    tags?: string[];
    visibility?: GalleryVisibility;
    year?: number;
    displayOrder?: number;
  }): Promise<GalleryPiece> {
    return this.requestWithRetry<GalleryPiece>('/portfolios/me/gallery', {
      method: 'POST',
      body: JSON.stringify(pieceData),
    });
  }

  async updateGalleryPiece(pieceId: string, updates: Partial<GalleryPiece>): Promise<GalleryPiece> {
    return this.requestWithRetry<GalleryPiece>(`/portfolios/me/gallery/${pieceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteGalleryPiece(pieceId: string): Promise<{ message: string; id: string }> {
    return this.requestWithRetry(`/portfolios/me/gallery/${pieceId}`, {
      method: 'DELETE',
    });
  }

  async batchDeleteGalleryPieces(pieceIds: string[]): Promise<{ 
    message: string;
    deletedCount: number;
  }> {
    return this.requestWithRetry('/portfolios/me/gallery/batch', {
      method: 'DELETE',
      body: JSON.stringify({ pieceIds }),
    });
  }

  async batchUpdateGalleryVisibility(
    pieceIds: string[], 
    visibility: GalleryVisibility
  ): Promise<{ message: string; updatedCount: number }> {
    return this.requestWithRetry('/portfolios/me/gallery/batch/visibility', {
      method: 'PUT',
      body: JSON.stringify({ pieceIds, visibility }),
    });
  }

  async getGalleryStats(): Promise<{
    totalPieces: number;
    publicPieces: number;
    privatePieces: number;
    unlistedPieces: number;
    categories: Record<string, number>;
    recentUploads: number;
  }> {
    return this.requestWithRetry('/portfolios/me/gallery/stats');
  }

  // ==================== CONCEPT MANAGEMENT (Educational/Hybrid) ====================

  async getMyConcepts(): Promise<{
    concepts: ConceptProgress[];
    portfolio: {
      id: string;
      kind: PortfolioKind;
      totalConcepts: number;
      completedConcepts: number;
    };
  }> {
    return this.requestWithRetry('/portfolios/me/concepts');
  }

  async addConceptToPortfolio(
    conceptId: string, 
    data: { 
      status?: string; 
      startedAt?: string;
      notes?: string;
      score?: number;
    }
  ): Promise<{ message: string; conceptProgress: ConceptProgress }> {
    return this.requestWithRetry(`/portfolios/me/concepts/${conceptId}`, {
      method: 'POST',
      body: JSON.stringify({
        status: data.status || 'in-progress',
        startedAt: data.startedAt || new Date().toISOString(),
        ...data
      }),
    });
  }

  async updateConceptProgress(
    conceptId: string, 
    data: { 
      status?: string; 
      score?: number;
      notes?: string;
      completedAt?: string;
    }
  ): Promise<{ message: string; conceptProgress: ConceptProgress }> {
    return this.requestWithRetry(`/portfolios/me/concepts/${conceptId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== ANALYTICS & DASHBOARD ====================

  async getAnalytics(period: string = '30d'): Promise<{ analytics: PortfolioAnalytics; period: string }> {
    return this.requestWithRetry('/portfolios/me/analytics', {
      params: { period }
    });
  }

  async getDashboard(): Promise<{
    overview: any;
    analytics: any;
    gallery: any;
    learning?: any;
    portfolio: any;
  }> {
    return this.requestWithRetry('/portfolios/me/dashboard');
  }

  // ==================== IMAGE UPLOADS - FIXED ====================

  async uploadImage(
    file: File,
    type: 'profile' | 'cover'
  ): Promise<{ 
    success: boolean;
    url: string; 
    filename: string;
    type: string; 
    size: number;
    sizeHuman: string;
    originalName: string;
    message: string;
    urls: {
      direct: string;
      relative: string;
      api: string | null;
    };
    meta: any;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

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

      // Fixed: Remove duplicate /api in URL
      const response = await fetch(`${this.baseURL}/portfolios/upload-image`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new APIError(
          errorData.message || `Upload failed: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError('Portfolio image upload failed', undefined, 'UPLOAD_ERROR');
    }
  }

  // Simplified raw upload method
  async uploadImageRaw(formData: FormData): Promise<any> {
    const response = await fetch(`${this.baseURL}/portfolios/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new APIError(
        error.message || `Upload failed with status ${response.status}`,
        response.status,
        error.code
      );
    }
    
    return response.json();
  }

  // ==================== DEBUG & TESTING ENDPOINTS ====================

  async getUploadConfig(): Promise<{
    server: {
      nodeVersion: string;
      platform: string;
      uptime: number;
      memory: any;
      cwd: string;
    };
    paths: {
      backendRoot: string;
      uploadsDir: string;
      __dirname: string;
      resolved: string;
    };
    filesystem: {
      timestamp: string;
      uploadsDir: string;
      checks: {
        uploadsExists: boolean;
        uploadsIsDirectory?: boolean;
        canWrite: boolean;
        contents?: string[];
        galleryExists?: boolean;
        galleryContents?: string[];
        galleryCount?: number;
        portfolioExists?: boolean;
        portfolioContents?: string[];
        portfolioCount?: number;
      };
    };
    request: {
      method: string;
      url: string;
      headers: any;
      query: any;
    };
  }> {
    return this.requestWithRetry('/portfolios/debug/upload-config');
  }

  async validateFile(filename: string): Promise<{
    filename: string;
    filePath: string;
    validation: {
      timestamp: string;
      filePath: string;
      checks: {
        exists: boolean;
        isFile?: boolean;
        size?: number;
        sizeHuman?: string;
        created?: string;
        modified?: string;
        readable: boolean;
        imageInfo?: {
          format: string;
          valid: boolean;
          size: number;
          sizeHuman: string;
          signature?: string;
        };
      };
    };
    timestamp: string;
  }> {
    return this.requestWithRetry(`/portfolios/debug/file-check/${filename}`);
  }

  // ==================== COMPREHENSIVE PORTFOLIO STATS ====================

  async getPortfolioStats(): Promise<PortfolioStats> {
    try {
      const [portfolio, galleryStats, concepts] = await Promise.allSettled([
        this.getMyPortfolio(),
        this.getGalleryStats(),
        this.getMyConcepts()
      ]);

      const portfolioData = portfolio.status === 'fulfilled' ? portfolio.value : null;
      const gallery = galleryStats.status === 'fulfilled' ? galleryStats.value : { totalPieces: 0 };
      const conceptData = concepts.status === 'fulfilled' ? concepts.value : null;

      return {
        views: (portfolioData as any)?.stats?.totalViews || 0,
        rating: (portfolioData as any)?.stats?.averageRating || 0,
        totalRatings: (portfolioData as any)?.stats?.totalReviews || 0,
        galleryCount: gallery.totalPieces || 0,
        projectCount: (portfolioData as any)?.stats?.projectCount || 0,
        conceptCount: conceptData?.concepts?.length || 0,
        completedConcepts: conceptData?.concepts?.filter((c: any) => c.status === 'completed').length || 0
      };
    } catch (error) {
      console.error('Failed to get portfolio stats:', error);
      throw error;
    }
  }

  // ==================== LEGACY/DEPRECATED METHODS ====================
  // Keep for backward compatibility but mark as deprecated

  /** @deprecated Use getByUsername instead */
  async getById(id: string): Promise<PortfolioWithPieces> {
    console.warn('getById is deprecated, use getByUsername instead');
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/by-id/${id}`);
  }

  /** @deprecated Use getByUsername instead */
  async getByUserId(userId: string): Promise<PortfolioWithPieces> {
    console.warn('getByUserId is deprecated, use getByUsername instead');
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/user/${userId}`);
  }

  /** @deprecated Use deleteMyPortfolio instead */
  async delete(id: string): Promise<void> {
    console.warn('delete(id) is deprecated, use deleteMyPortfolio() instead');
    return this.requestWithRetry<void>(`/portfolios/by-id/${id}`, {
      method: 'DELETE',
    });
  }

  /** @deprecated Use uploadImage instead */
  async uploadRaw(formData: FormData): Promise<any> {
    console.warn('uploadRaw is deprecated, use uploadImageRaw instead');
    return this.uploadImageRaw(formData);
  }

  // ==================== SEARCH & DISCOVERY (if implemented) ====================

  async search(query: string, limit: number = 10): Promise<Portfolio[]> {
    return this.requestWithRetry<Portfolio[]>('/portfolios/search', {
      params: { q: query, limit },
    });
  }

  async getFeatured(limit: number = 6): Promise<Portfolio[]> {
    return this.requestWithRetry<Portfolio[]>('/portfolios/featured', {
      params: { limit },
    });
  }

  async getTrending(period: 'day' | 'week' | 'month' = 'week'): Promise<Portfolio[]> {
    return this.requestWithRetry<Portfolio[]>('/portfolios/trending', {
      params: { period },
    });
  }

  // ==================== BATCH OPERATIONS ====================

  async batchUploadGallery(
    uploads: Array<{
      file: File;
      title: string;
      description?: string;
      category?: string;
      tags?: string[];
      visibility?: GalleryVisibility;
    }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<BatchUploadResult> {
    const successful: GalleryPiece[] = [];
    const failed: Array<{ error: string; fileName: string }> = [];

    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      try {
        // First upload the image file using portfolio upload
        const formData = new FormData();
        formData.append('file', upload.file);
        
        const uploadResponse = await this.uploadImageRaw(formData);
        
        // Then add the piece to portfolio gallery
        const galleryPiece = await this.addGalleryPiece({
          title: upload.title,
          description: upload.description || '',
          imageUrl: uploadResponse.url,
          category: upload.category,
          tags: upload.tags || [],
          visibility: upload.visibility || 'public'
        });
        
        successful.push(galleryPiece);
      } catch (error: any) {
        failed.push({
          error: error.message || 'Upload failed',
          fileName: upload.file.name
        });
      }

      onProgress?.(i + 1, uploads.length);
    }

    return { successful, failed };
  }

  // ==================== PLACEHOLDER METHODS (for future implementation) ====================

  // Reviews - if you plan to implement them
  async addReview(portfolioId: string, review: CreateReviewDto): Promise<PortfolioReview> {
    throw new APIError('Reviews not yet implemented', 501, 'NOT_IMPLEMENTED');
  }

  async getReviews(portfolioId: string, page: number = 1, limit: number = 10): Promise<ReviewListResponse> {
    throw new APIError('Reviews not yet implemented', 501, 'NOT_IMPLEMENTED');
  }

  // Sharing - if you plan to implement it
  async generateShareLink(portfolioId: string, options?: any): Promise<PortfolioShareLink> {
    throw new APIError('Share links not yet implemented', 501, 'NOT_IMPLEMENTED');
  }

  async getByShareToken(token: string): Promise<PortfolioWithPieces> {
    throw new APIError('Share links not yet implemented', 501, 'NOT_IMPLEMENTED');
  }

  // Legacy gallery methods - if you have a separate gallery system
  async getPublicGallery(portfolioId: string): Promise<GalleryPiece[]> {
    console.warn('getPublicGallery is deprecated, use getPortfolioGalleryByUsername instead');
    throw new APIError('Legacy gallery methods not supported', 501, 'DEPRECATED');
  }

  async likePiece(pieceId: string): Promise<void> {
    throw new APIError('Gallery likes not yet implemented', 501, 'NOT_IMPLEMENTED');
  }

  async unlikePiece(pieceId: string): Promise<void> {
    throw new APIError('Gallery likes not yet implemented', 501, 'NOT_IMPLEMENTED');
  }

  async getLikedStatus(pieceIds: string[]): Promise<Record<string, boolean>> {
    throw new APIError('Gallery likes not yet implemented', 501, 'NOT_IMPLEMENTED');
  }
}