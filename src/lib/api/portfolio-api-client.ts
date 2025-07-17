// lib/api/portfolio-client.ts
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
import { GalleryVisibility } from '@/types/gallery.types';
import { config } from '@/config/environment';

// Gallery management response types
export interface DeleteGalleryPieceResponse {
  message: string;
  pieceId: string;
  remainingCount: number;
}

export interface BatchDeleteGalleryResponse {
  message: string;
  deletedCount: number;
  unauthorizedCount: number;
  deletedPieceIds: string[];
  remainingCount: number;
}

export interface UpdateVisibilityResponse {
  message: string;
  pieceId?: string;
  updatedCount?: number;
  visibility: GalleryVisibility;
}

export interface DeletePortfolioOptions {
  deleteGalleryPieces?: boolean;
}

export interface PortfolioAPI {
  // Portfolio CRUD
  create(data: CreatePortfolioDto): Promise<Portfolio>;
  update(id: string, data: UpdatePortfolioDto): Promise<Portfolio>;
  getById(id: string): Promise<PortfolioWithPieces>;
  getByUserId(userId: string): Promise<PortfolioWithPieces>;
  getByUsername(username: string): Promise<PortfolioWithPieces>;
  delete(id: string, options?: DeletePortfolioOptions): Promise<void>;
  getMyPortfolio(): Promise<Portfolio>;
  
  // Gallery Management (NEW)
  deleteGalleryPiece(pieceId: string): Promise<DeleteGalleryPieceResponse>;
  batchDeleteGalleryPieces(pieceIds: string[]): Promise<BatchDeleteGalleryResponse>;
  updateGalleryPieceVisibility(pieceId: string, visibility: GalleryVisibility): Promise<UpdateVisibilityResponse>;
  batchUpdateGalleryVisibility(pieceIds: string[], visibility: GalleryVisibility): Promise<UpdateVisibilityResponse>;
  
  // Discovery
  discover(filters?: PortfolioFilters, page?: number, limit?: number): Promise<PortfolioListResponse>;
  search(query: string, limit?: number): Promise<Portfolio[]>;
  getFeatured(limit?: number): Promise<Portfolio[]>;
  getTrending(period?: 'day' | 'week' | 'month'): Promise<Portfolio[]>;
  
  // Reviews
  addReview(portfolioId: string, review: CreateReviewDto): Promise<PortfolioReview>;
  getReviews(portfolioId: string, page?: number, limit?: number): Promise<ReviewListResponse>;
  updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<PortfolioReview>;
  respondToReview(reviewId: string, comment: string): Promise<PortfolioReview>;
  deleteReview(reviewId: string): Promise<void>;
  
  // Analytics
  trackView(portfolioId: string, data?: any): Promise<void>;
  getAnalytics(portfolioId: string, period?: string): Promise<PortfolioAnalytics>;
  
  // Sharing
  generateShareLink(portfolioId: string, options?: any): Promise<PortfolioShareLink>;
  getByShareToken(token: string): Promise<PortfolioWithPieces>;
  
  // Images
  uploadImage(file: File, type: 'profile' | 'cover'): Promise<{ url: string }>;
}

export class PortfolioApiClient extends BaseApiClient implements PortfolioAPI {
  async create(data: CreatePortfolioDto): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>('/portfolios/me/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdatePortfolioDto): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>(`/portfolios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getById(id: string): Promise<PortfolioWithPieces> {
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/${id}`);
  }

  async getByUserId(userId: string): Promise<PortfolioWithPieces> {
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/user/${userId}`);
  }

  async getByUsername(username: string): Promise<PortfolioWithPieces> {
    return this.requestWithRetry<PortfolioWithPieces>(`/portfolios/u/${username}`);
  }

  async delete(id: string, options?: DeletePortfolioOptions): Promise<void> {
    return this.requestWithRetry<void>(`/portfolios/${id}`, {
      method: 'DELETE',
      body: options ? JSON.stringify(options) : undefined,
    });
  }

  async getMyPortfolio(): Promise<Portfolio> {
    return this.requestWithRetry<Portfolio>('/portfolios/me');
  }

  // ==================== GALLERY MANAGEMENT METHODS ====================
  
  async deleteGalleryPiece(pieceId: string): Promise<DeleteGalleryPieceResponse> {
    return this.requestWithRetry<DeleteGalleryPieceResponse>(
      `/portfolios/me/gallery/${pieceId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async batchDeleteGalleryPieces(pieceIds: string[]): Promise<BatchDeleteGalleryResponse> {
    return this.requestWithRetry<BatchDeleteGalleryResponse>(
      '/portfolios/me/gallery/batch',
      {
        method: 'DELETE',
        body: JSON.stringify({ pieceIds }),
      }
    );
  }

  async updateGalleryPieceVisibility(
    pieceId: string,
    visibility: GalleryVisibility
  ): Promise<UpdateVisibilityResponse> {
    return this.requestWithRetry<UpdateVisibilityResponse>(
      `/portfolios/me/gallery/${pieceId}/visibility`,
      {
        method: 'PUT',
        body: JSON.stringify({ visibility }),
      }
    );
  }

  async batchUpdateGalleryVisibility(
    pieceIds: string[],
    visibility: GalleryVisibility
  ): Promise<UpdateVisibilityResponse> {
    return this.requestWithRetry<UpdateVisibilityResponse>(
      '/portfolios/me/gallery/batch/visibility',
      {
        method: 'PUT',
        body: JSON.stringify({ pieceIds, visibility }),
      }
    );
  }

  // ==================== DISCOVERY METHODS ====================

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

  // ==================== REVIEW METHODS ====================

  async addReview(portfolioId: string, review: CreateReviewDto): Promise<PortfolioReview> {
    return this.requestWithRetry<PortfolioReview>(`/portfolios/${portfolioId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async getReviews(
    portfolioId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewListResponse> {
    return this.requestWithRetry<ReviewListResponse>(`/portfolios/${portfolioId}/reviews`, {
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

  // ==================== ANALYTICS METHODS ====================

  async trackView(
    portfolioId: string,
    data?: { referrer?: string; duration?: number }
  ): Promise<void> {
    return this.requestWithRetry<void>(`/portfolios/${portfolioId}/views`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getAnalytics(
    portfolioId: string,
    period: string = 'month'
  ): Promise<PortfolioAnalytics> {
    return this.requestWithRetry<PortfolioAnalytics>(`/portfolios/${portfolioId}/analytics`, {
      params: { period },
    });
  }

  // ==================== SHARING METHODS ====================

  async generateShareLink(
    portfolioId: string,
    options?: { expiresIn?: number; maxViews?: number }
  ): Promise<PortfolioShareLink> {
    return this.requestWithRetry<PortfolioShareLink>(`/portfolios/${portfolioId}/share`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  async getByShareToken(token: string): Promise<PortfolioWithPieces> {
    // This endpoint might not require auth, so we'll use a simple fetch
    const url = `${this.baseURL}/portfolios/shared/${token}`;
    const response = await fetch(url, {
      headers: this.defaultHeaders,
    });
    
    if (!response.ok) {
      throw new APIError('Invalid share link', response.status);
    }
    
    const data = await response.json();
    return data;
  }

  // ==================== IMAGE UPLOAD ====================

  async uploadImage(
    file: File,
    type: 'profile' | 'cover'
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const url = `${this.baseURL}/portfolios/upload-image`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
    
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'ngrok-skip-browser-warning': 'true',
        // Don't set Content-Type, let browser set it with boundary
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
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new APIError(
          errorData.message || `Upload failed: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError('Portfolio image upload failed', undefined, 'UPLOAD_ERROR');
    }
  }
}