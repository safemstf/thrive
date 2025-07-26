// lib/api/portfolio-api-client.ts - Fixed to align with backend
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

interface PortfolioMeResponse {
  hasPortfolio?: boolean;
  portfolio?: Portfolio | null;
  _id?: string;
  id?: string;
  [key: string]: any;
}

export class PortfolioApiClient extends BaseApiClient {
  // ==================== CORE PORTFOLIO OPERATIONS ====================
  
  async create(data: CreatePortfolioDto): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>('/portfolios/me/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdatePortfolioDto): Promise<Portfolio> {
    // Handle both ID and username based updates
    const endpoint = id.includes('-') || id.length === 24 
      ? `/portfolios/by-id/${id}` 
      : `/portfolios/by-username/${id}`;
      
    return this.requestWithRetry<Portfolio>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getById(id: string): Promise<PortfolioWithPieces> {
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/by-id/${id}`);
  }

  async getByUserId(userId: string): Promise<PortfolioWithPieces> {
    // Fixed: Now calls the correct backend endpoint
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/user/${userId}`);
  }

  async getByUsername(username: string): Promise<PortfolioWithPieces> {
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/by-username/${username}`);
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
      
      // Handle the backend response format properly
      if (response.hasPortfolio === false || !response) {
        return null;
      }
      
      // If response has portfolio property, return it; otherwise response is the portfolio
      return response.portfolio || (response as Portfolio);
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        return null;
      }
      throw error;
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
    // Fixed: Now calls the correct backend endpoint
    return this.requestWithRetry<Portfolio[]>('/portfolios/trending', {
      params: { period },
    });
  }

  // ==================== GALLERY MANAGEMENT ====================

  async getMyGalleryPieces(): Promise<GalleryPiece[]> {
    try {
      const response = await this.requestWithRetry<{
        pieces: GalleryPiece[];
        pagination?: any;
        portfolio?: any;
      }>('/portfolios/me/gallery');
      
      // Backend returns { pieces: [...], pagination: {...}, portfolio: {...} }
      return response.pieces || [];
    } catch (error) {
      console.error('Failed to get gallery pieces:', error);
      return [];
    }
  }

  async getPortfolioGallery(portfolioId: string): Promise<GalleryPiece[]> {
    try {
      const response = await this.requestWithRetry<{
        pieces: GalleryPiece[];
        pagination?: any;
        portfolio?: any;
      }>(`/portfolios/by-id/${portfolioId}/gallery`);
      
      return response.pieces || [];
    } catch (error) {
      console.error('Failed to get portfolio gallery:', error);
      return [];
    }
  }

  async addGalleryPiece(pieceData: {
    title: string;
    description?: string;
    imageUrl: string;
    category?: string;
    tags?: string[];
    visibility?: GalleryVisibility;
  }): Promise<GalleryPiece> {
    const response = await this.requestWithRetry<{
      piece: GalleryPiece;
      message: string;
      portfolioStats?: any;
    }>('/portfolios/me/gallery', {
      method: 'POST',
      body: JSON.stringify(pieceData),
    });
    
    return response.piece;
  }

  async updateGalleryPiece(pieceId: string, updates: Partial<GalleryPiece>): Promise<GalleryPiece> {
    const response = await this.requestWithRetry<{
      piece: GalleryPiece;
      message: string;
    }>(`/portfolios/me/gallery/${pieceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    return response.piece;
  }

  async deleteGalleryPiece(pieceId: string): Promise<{ remainingCount: number }> {
    return this.requestWithRetry<{ 
      remainingCount: number;
      message: string;
      pieceId: string;
    }>(`/portfolios/me/gallery/${pieceId}`, {
      method: 'DELETE',
    });
  }

  async batchDeleteGalleryPieces(pieceIds: string[]): Promise<{ 
    deletedCount: number; 
    remainingCount: number; 
    unauthorizedCount: number 
  }> {
    return this.requestWithRetry<{ 
      deletedCount: number; 
      remainingCount: number; 
      unauthorizedCount: number;
      message: string;
      deletedPieceIds: string[];
    }>('/portfolios/me/gallery/batch', {
      method: 'DELETE',
      body: JSON.stringify({ pieceIds }),
    });
  }

  async updateGalleryPieceVisibility(
    pieceId: string, 
    visibility: GalleryVisibility
  ): Promise<void> {
    await this.requestWithRetry<{
      message: string;
      pieceId: string;
      visibility: string;
    }>(`/portfolios/me/gallery/${pieceId}/visibility`, {
      method: 'PUT',
      body: JSON.stringify({ visibility }),
    });
  }

  async batchUpdateGalleryVisibility(
    pieceIds: string[], 
    visibility: GalleryVisibility
  ): Promise<{ updatedCount: number }> {
    return this.requestWithRetry<{ 
      updatedCount: number;
      message: string;
      visibility: string;
    }>('/portfolios/me/gallery/batch/visibility', {
      method: 'PUT',
      body: JSON.stringify({ pieceIds, visibility }),
    });
  }

  async getGalleryStats(): Promise<{ totalPieces: number; totalViews: number }> {
    try {
      const response = await this.requestWithRetry<{
        stats: {
          totalPieces: number;
          totalViews: number;
          publicPieces: number;
          privatePieces: number;
          [key: string]: any;
        };
        portfolio: any;
      }>('/portfolios/me/gallery/stats');
      
      return {
        totalPieces: response.stats.totalPieces,
        totalViews: response.stats.totalViews
      };
    } catch (error) {
      console.error('Failed to get gallery stats:', error);
      return { totalPieces: 0, totalViews: 0 };
    }
  }

  // ==================== CONCEPT MANAGEMENT ====================

  async getMyConcepts(): Promise<ConceptProgress[]> {
    return this.requestWithRetry<ConceptProgress[]>('/portfolios/me/concepts');
  }

  async addConceptToPortfolio(conceptId: string, data: { status: string; startedAt: string }): Promise<void> {
    await this.requestWithRetry<{
      message: string;
      conceptProgress: any;
    }>(`/portfolios/me/concepts/${conceptId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateConceptProgress(conceptId: string, data: { status: string }): Promise<void> {
    await this.requestWithRetry<{
      message: string;
      conceptProgress: any;
    }>(`/portfolios/me/concepts/${conceptId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ==================== REVIEWS ====================

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

  // ==================== ANALYTICS ====================

  async trackView(
    portfolioId: string,
    data?: { referrer?: string; duration?: number }
  ): Promise<void> {
    await this.requestWithRetry<{
      message: string;
      totalViews: number;
    }>(`/portfolios/by-id/${portfolioId}/views`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getAnalytics(
    portfolioId: string,
    period: string = 'month'
  ): Promise<PortfolioAnalytics> {
    return this.requestWithRetry<PortfolioAnalytics>(`/portfolios/by-id/${portfolioId}/analytics`, {
      params: { period },
    });
  }

  // ==================== SHARING ====================

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

  // ==================== FILE UPLOADS ====================

  async uploadImage(
    file: File,
    type: 'profile' | 'cover'
  ): Promise<{ url: string }> {
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

  // ==================== ENHANCED BATCH OPERATIONS ====================

  /**
   * Upload multiple gallery images with progress tracking
   * Fixed to use proper portfolio endpoints
   */
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
        // First upload the image to gallery service
        const formData = new FormData();
        formData.append('image', upload.file);
        formData.append('title', upload.title);
        if (upload.description) formData.append('description', upload.description);
        if (upload.category) formData.append('category', upload.category);
        if (upload.visibility) formData.append('visibility', upload.visibility);
        if (upload.tags) formData.append('tags', upload.tags.join(','));

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
        
        // The gallery upload should create the piece and link it to portfolio automatically
        if (uploadData.piece) {
          successful.push(uploadData.piece);
        } else {
          // Fallback: manually add to portfolio if not auto-linked
          const galleryPiece = await this.addGalleryPiece({
            title: upload.title,
            description: upload.description || '',
            imageUrl: uploadData.url,
            category: upload.category,
            tags: upload.tags || [],
            visibility: upload.visibility || 'public'
          });
          successful.push(galleryPiece);
        }
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

  /**
   * Get comprehensive portfolio statistics
   * Coordinates multiple API calls efficiently
   */
  async getPortfolioStats(): Promise<PortfolioStats> {
    try {
      const [portfolio, galleryStats, concepts] = await Promise.allSettled([
        this.getMyPortfolio(),
        this.getGalleryStats(),
        this.getMyConcepts()
      ]);

      const portfolioData = portfolio.status === 'fulfilled' ? portfolio.value : null;
      const gallery = galleryStats.status === 'fulfilled' ? galleryStats.value : { totalPieces: 0, totalViews: 0 };
      const conceptList = concepts.status === 'fulfilled' ? concepts.value : [];

      return {
        views: (portfolioData as any)?.stats?.views || 0,
        rating: (portfolioData as any)?.stats?.averageRating || 0,
        totalRatings: (portfolioData as any)?.stats?.totalRatings || 0,
        galleryCount: gallery.totalPieces,
        projectCount: (portfolioData as any)?.stats?.projectCount || 0,
        conceptCount: conceptList.length,
        completedConcepts: conceptList.filter(c => c.status === 'completed').length
      };
    } catch (error) {
      console.error('Failed to get portfolio stats:', error);
      throw error;
    }
  }

  /**
   * Check if user has a portfolio
   */
  async hasPortfolio(): Promise<boolean> {
    try {
      const portfolio = await this.getMyPortfolio();
      return portfolio !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get portfolio type configuration
   */
  getPortfolioTypeConfig(type: string) {
    const configs = {
      creative: {
        icon: '🎨',
        title: 'Creative Portfolio',
        color: '#8b5cf6',
        features: ['Gallery', 'Artwork Showcase', 'Project Display']
      },
      educational: {
        icon: '🧠',
        title: 'Educational Portfolio',
        color: '#3b82f6',
        features: ['Progress Tracking', 'Concept Mastery', 'Learning Analytics']
      },
      hybrid: {
        icon: '🔄',
        title: 'Hybrid Portfolio',
        color: '#10b981',
        features: ['Creative Showcase', 'Learning Progress', 'Project Portfolio']
      }
    };

    return configs[type as keyof typeof configs] || {
      icon: '📁',
      title: 'Portfolio',
      color: '#6b7280',
      features: ['Basic Portfolio']
    };
  }
}