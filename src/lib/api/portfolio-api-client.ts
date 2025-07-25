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
import { ConceptProgress } from '@/types/educational.types'
import { config } from '@/config/environment';

export interface PortfolioAPI {
  // Portfolio CRUD
  create(data: CreatePortfolioDto): Promise<Portfolio>;
  update(id: string, data: UpdatePortfolioDto): Promise<Portfolio>;
  getById(id: string): Promise<PortfolioWithPieces>;
  getByUserId(userId: string): Promise<PortfolioWithPieces>;
  getByUsername(username: string): Promise<PortfolioWithPieces>;
  delete(id: string): Promise<void>;
  getMyPortfolio(): Promise<Portfolio | null>;  // Changed to allow null
  
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
  
  // Gallery management methods (CORE PORTFOLIO FUNCTIONALITY)
  // These manage gallery pieces within the portfolio context
  deleteGalleryPiece(pieceId: string): Promise<{ remainingCount: number }>;
  batchDeleteGalleryPieces(pieceIds: string[]): Promise<{ 
    deletedCount: number; 
    remainingCount: number; 
    unauthorizedCount: number 
  }>;
  updateGalleryPieceVisibility(pieceId: string, visibility: GalleryVisibility): Promise<void>;
  batchUpdateGalleryVisibility(pieceIds: string[], visibility: GalleryVisibility): Promise<{ 
    updatedCount: number 
  }>;

    // Concept progress (Educational/Hybrid Portfolios)
  getMyConcepts(): Promise<ConceptProgress[]>;
  addConceptToPortfolio(conceptId: string, data: { status: string; startedAt: string }): Promise<void>;
  updateConceptProgress(conceptId: string, data: { status: string }): Promise<void>;

    
  // TODO: Add these methods when backend implements them
  // getMyGalleryPieces(params?: GalleryQueryParams): Promise<GalleryApiResponse>;
  // createGalleryPiece(file: File, metadata: Record<string, any>): Promise<GalleryPiece>;
  // updateGalleryPiece(pieceId: string, updates: Partial<GalleryPiece>): Promise<GalleryPiece>;
  // uploadGalleryImage(file: File, metadata: Record<string, any>): Promise<{ url: string; thumbnailUrl?: string }>;
}

interface PortfolioMeResponse {
  hasPortfolio?: boolean;
  portfolio?: Portfolio | null;
  // When portfolio exists, the response is the portfolio object directly
  _id?: string;
  id?: string;
  [key: string]: any; // Allow other portfolio fields
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

  async delete(id: string): Promise<void> {
    return this.requestWithRetry<void>(`/portfolios/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyPortfolio(): Promise<Portfolio | null> {
    try {
      const response = await this.requestWithRetry<PortfolioMeResponse>('/portfolios/me');
      
      // If the response indicates no portfolio
      if (response.hasPortfolio === false) {
        return null;
      }
      
      // If the response is the portfolio object itself
      return response as Portfolio;
    } catch (error) {
      // If it's a 404, the user doesn't have a portfolio
      if (error instanceof APIError && error.status === 404) {
        return null;
      }
      throw error;
    }
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

  // Gallery management methods
  async deleteGalleryPiece(pieceId: string): Promise<{ remainingCount: number }> {
    return this.requestWithRetry<{ remainingCount: number }>(
      `/portfolios/me/gallery/${pieceId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async batchDeleteGalleryPieces(pieceIds: string[]): Promise<{ 
    deletedCount: number; 
    remainingCount: number; 
    unauthorizedCount: number 
  }> {
    return this.requestWithRetry<{ 
      deletedCount: number; 
      remainingCount: number; 
      unauthorizedCount: number 
    }>('/portfolios/me/gallery/batch', {
      method: 'DELETE',
      body: JSON.stringify({ pieceIds }),
    });
  }

  async updateGalleryPieceVisibility(
    pieceId: string, 
    visibility: GalleryVisibility
  ): Promise<void> {
    return this.requestWithRetry<void>(
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
  ): Promise<{ updatedCount: number }> {
    return this.requestWithRetry<{ updatedCount: number }>(
      '/portfolios/me/gallery/batch/visibility',
      {
        method: 'PUT',
        body: JSON.stringify({ pieceIds, visibility }),
      }
    );
  }

  async getMyConcepts(): Promise<ConceptProgress[]> {
    return await this.requestWithRetry<ConceptProgress[]>('/portfolios/me/concepts');
  }

  async addConceptToPortfolio(conceptId: string, data: { status: string; startedAt: string }): Promise<void> {
    await this.requestWithRetry<void>(`/portfolios/me/concepts/${conceptId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateConceptProgress(conceptId: string, data: { status: string }): Promise<void> {
    await this.requestWithRetry<void>(`/portfolios/me/concepts/${conceptId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

}