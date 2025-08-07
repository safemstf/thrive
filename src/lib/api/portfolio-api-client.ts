// lib/api/portfolio-api-client.ts - Fixed to align with backend structure
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
    // Updated to match backend: /portfolios/me for current user updates
    return this.requestWithRetry<Portfolio>('/portfolios/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getById(id: string): Promise<PortfolioWithPieces> {
    // Note: This is deprecated in favor of getByUsername
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/by-id/${id}`);
  }

  async getByUserId(userId: string): Promise<PortfolioWithPieces> {
    // Note: This is deprecated, use getByUsername instead
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/user/${userId}`);
  }

  async getByUsername(username: string): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>(`/portfolios/by-username/${username}`);
  }

  async delete(id: string): Promise<void> {
    return this.requestWithRetry<void>(`/portfolios/by-id/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteMyPortfolio(deleteGalleryPieces: boolean = false): Promise<void> {
    return this.requestWithRetry<void>('/portfolios/me', {
      method: 'DELETE',
      body: JSON.stringify({ deleteGalleryPieces }),
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

  // ==================== DISCOVERY & SEARCH ====================

  async discover(
    filters?: PortfolioFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PortfolioListResponse> {
    return this.requestWithRetry<PortfolioListResponse>('/portfolios/discover', {
      params: { ...filters, page, limit },
    });
  }

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

  // ==================== PORTFOLIO UTILITY METHODS ====================

  async upgrade(kind: PortfolioKind, preserveContent: boolean = true): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>('/portfolios/me/upgrade', {
      method: 'PUT',
      body: JSON.stringify({ kind, preserveContent }),
    });
  }

  async getStats(): Promise<any> {
    return this.requestWithRetry('/portfolios/stats');
  }

  async getTypeConfig(type: string): Promise<any> {
    return this.requestWithRetry(`/portfolios/type-config/${type}`);
  }

  async hasPortfolio(): Promise<boolean> {
    try {
      const response = await this.requestWithRetry<{ hasPortfolio: boolean }>('/portfolios/me/check');
      return response.hasPortfolio;
    } catch (error) {
      return false;
    }
  }

  // ==================== GALLERY MANAGEMENT (Portfolio-Owned) ====================

  async getMyGalleryPieces(): Promise<GalleryPiece[]> {
    try {
      // Backend returns array directly, not wrapped
      return await this.requestWithRetry<GalleryPiece[]>('/portfolios/me/gallery');
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
    // Backend returns the gallery piece directly
    return this.requestWithRetry<GalleryPiece>('/portfolios/me/gallery', {
      method: 'POST',
      body: JSON.stringify(pieceData),
    });
  }

  async updateGalleryPiece(pieceId: string, updates: Partial<GalleryPiece>): Promise<GalleryPiece> {
    // Backend returns the updated piece directly
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

  async trackView(
    portfolioId: string,
    data?: { referrer?: string; duration?: number }
  ): Promise<{ message: string; totalViews: number }> {
    return this.requestWithRetry(`/portfolios/by-id/${portfolioId}/views`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // ==================== IMAGE UPLOADS ====================

  async uploadImage(
    file: File,
    type: 'profile' | 'cover'
  ): Promise<{ url: string; type: string; message: string }> {
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
          response.status
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

  async uploadRaw(formData: FormData): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/portfolios/upload-image`, {
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
        response.status
      );
    }
    
    return response.json();
  }
  
  async uploadImageRaw(formData: FormData): Promise<any> {
  const response = await fetch(`${this.baseURL}/api/portfolios/upload-image`, {
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
      response.status
    );
  }
  
  return response.json();
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
        // First upload the image file (you'll need a separate upload endpoint)
        const formData = new FormData();
        formData.append('image', upload.file);
        
        const uploadResponse = await fetch(`${this.baseURL}/gallery/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        const uploadData = await uploadResponse.json();
        
        // Then add the piece to portfolio
        const galleryPiece = await this.addGalleryPiece({
          title: upload.title,
          description: upload.description || '',
          imageUrl: uploadData.url,
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

  // ==================== COMPREHENSIVE PORTFOLIO STATS ====================

  async getPortfolioStats(): Promise<PortfolioStats> {
    try {
      const [portfolio, galleryStats, concepts] = await Promise.allSettled([
        this.getMyPortfolio(),
        this.getGalleryStats(),
        this.getMyConcepts()
      ]);

      const portfolioData = portfolio.status === 'fulfilled' ? portfolio.value : null;
      const gallery = galleryStats.status === 'fulfilled' ? galleryStats.value : { totalPieces: 0, totalViews: 0 };
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

  // ==================== REVIEWS (if implemented) ====================

  async addReview(portfolioId: string, review: CreateReviewDto): Promise<PortfolioReview> {
    const response = await this.requestWithRetry<{
      review: PortfolioReview;
      message: string;
    }>(`/portfolios/by-id/${portfolioId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
    
    return response.review;
  }

  async getReviews(
    portfolioId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewListResponse> {
    return this.requestWithRetry<ReviewListResponse>(`/portfolios/by-id/${portfolioId}/reviews`, {
      params: { page, limit },
    });
  }

  async updateReviewStatus(
    reviewId: string,
    status: 'approved' | 'rejected'
  ): Promise<PortfolioReview> {
    return this.requestWithRetry<PortfolioReview>(`/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async respondToReview(reviewId: string, comment: string): Promise<PortfolioReview> {
    return this.requestWithRetry<PortfolioReview>(`/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async deleteReview(reviewId: string): Promise<void> {
    return this.requestWithRetry<void>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // ==================== SHARING (if implemented) ====================

  async generateShareLink(
    portfolioId: string,
    options?: { expiresIn?: number; maxViews?: number }
  ): Promise<PortfolioShareLink> {
    const response = await this.requestWithRetry<{
      shareLink: PortfolioShareLink;
    }>(`/portfolios/by-id/${portfolioId}/share`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
    
    return response.shareLink;
  }

  async getByShareToken(token: string): Promise<PortfolioWithPieces> {
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/shared/${token}`);
  }

  // ==================== LEGACY GALLERY METHODS (for backward compatibility) ====================
  // These should be migrated to portfolio-centric approach

  async getPublicGallery(portfolioId: string): Promise<GalleryPiece[]> {
    console.warn('getPublicGallery is deprecated, use getPortfolioGalleryByUsername instead');
    return this.requestWithRetry<GalleryPiece[]>(`/gallery/public/${portfolioId}`);
  }

  async likePiece(pieceId: string): Promise<void> {
    return this.requestWithRetry(`/gallery/${pieceId}/like`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async unlikePiece(pieceId: string): Promise<void> {
    return this.requestWithRetry(`/gallery/${pieceId}/unlike`, {
      method: 'DELETE',
    });
  }

  async getLikedStatus(pieceIds: string[]): Promise<Record<string, boolean>> {
    return this.requestWithRetry(`/gallery/liked-status`, {
      method: 'POST',
      body: JSON.stringify({ pieceIds }),
    });
  }
}