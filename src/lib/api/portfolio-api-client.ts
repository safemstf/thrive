// lib/api/portfolio-api-client.ts
import { BaseApiClient, APIError } from './base-api-client';
import { config } from '@/config/environment';
import type {
  Portfolio,
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioKind,
  ConceptProgress
} from '@/types/portfolio.types';

import {
  portfolioFromBackend,
  portfolioToBackend
} from '@/types/portfolio.types';
import type {
  GalleryPieceCreateData,
  GalleryPieceResponse,
} from '@/types/gallery.types';

import type { BackendGalleryPiece } from '@/types/base.types'

// ==================== ENHANCED TYPE DEFINITIONS ====================

interface BackendResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: any;
  field?: string;
  validTypes?: string[];
}

interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UploadResponse {
  success: boolean;
  url: string;
  fileId: string;
  filename: string;
  size: number;
  contentType: string;
  message: string;
}

interface BatchOperationResponse {
  success: boolean;
  deletedCount?: number;
  updatedCount?: number;
  failedCount?: number;
  requestedCount?: number;
  skippedCount?: number;
  errors?: Array<{ id: string; error: string }>;
  message: string;
}

interface GalleryStatsResponse {
  success: boolean;
  stats: {
    totalPieces: number;
    publicPieces: number;
    privatePieces: number;
    unlistedPieces: number;
    categories: Record<string, number>;
    recentUploads: number;
    lastUpdated: string;
  };
}

interface PortfolioTypeConfig {
  name: string;
  displayName: string;
  price: string;
  features: string[];
  limits: {
    galleryPieces: number;
    storageGB: number;
    customPages: number;
    portfolios: number;
  };
}

// ==================== CENTRAL RESPONSE HANDLER / NORMALIZER ====================

class ResponseHandler {
  /**
   * Extracts the "useful" data from either the new backend shape { success, data }
   * or legacy shape (response object itself). Throws APIError on unsuccessful result.
   *
   * This is intentionally *shallow* and avoids deep cloning or scanning nested structures,
   * keeping operations O(1) for property extraction and O(n) only when arrays are normalized.
   */
  static extractData(response: any): any {
    if (response === null || response === undefined) {
      throw new APIError('Empty response from server', 500, 'EMPTY_RESPONSE');
    }

    // New style: { success: boolean, data: T, message?, code? }
    if (typeof response === 'object' && Object.prototype.hasOwnProperty.call(response, 'success')) {
      if (!response.success) {
        // prefer explicit backend code/message when present
        throw new APIError(
          response.error || response.message || 'Operation failed',
          response.code === 'PORTFOLIO_NOT_FOUND' ? 404 : (response.status || 400),
          response.code || 'OPERATION_FAILED',
        );
      }
      // If data is explicitly present, return it; otherwise return whole response for legacy
      return response.data !== undefined ? response.data : response;
    }

    // Legacy: response is already the payload we want
    return response;
  }

  /**
   * Generic handler which extracts data and optionally applies a transformer.
   * Transformer should be O(n) where n is the number of items transformed, avoid repeated passes.
   */
  static handleResponse<T = any>(response: any, transformer?: (d: any) => T): T {
    const data = ResponseHandler.extractData(response);
    return transformer ? transformer(data) : data;
  }

  /**
   * Normalize gallery pieces into a plain array.
   * Accepts:
   *  - Array directly
   *  - { pieces: [...] }
   *  - { galleryPieces: [...] }
   *  - { data?: { pieces: [...] } } (already handled via extractData, but kept defensive)
   *
   * Single-pass checks; O(1) checks and a single return of the underlying array (O(n) to iterate if caller maps).
   */
  static normalizePieces(payload: any): BackendGalleryPiece[] {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as BackendGalleryPiece[];
    if (Array.isArray(payload.pieces)) return payload.pieces as BackendGalleryPiece[];
    if (Array.isArray(payload.galleryPieces)) return payload.galleryPieces as BackendGalleryPiece[];
    // If payload has nested `data` that contains pieces (defensive)
    if (payload.data && Array.isArray(payload.data.pieces)) return payload.data.pieces;
    if (payload.data && Array.isArray(payload.data.galleryPieces)) return payload.data.galleryPieces;
    return [];
  }

  /**
   * Normalize pagination info to the PaginationResponse shape.
   * Handles both { pagination: {...} } and { page, limit, total, pages } shapes.
   * Single-pass property reads.
   */
  static normalizePagination(payload: any): PaginationResponse | undefined {
    if (!payload) return undefined;
    const pag = payload.pagination || payload;
    if (!pag) return undefined;
    const { page, limit, total, pages } = pag;
    if (
      Number.isFinite(page) ||
      Number.isFinite(limit) ||
      Number.isFinite(total) ||
      Number.isFinite(pages)
    ) {
      return {
        page: Number.isFinite(page) ? Number(page) : 1,
        limit: Number.isFinite(limit) ? Number(limit) : 20,
        total: Number.isFinite(total) ? Number(total) : 0,
        pages: Number.isFinite(pages) ? Number(pages) : 0
      };
    }
    return undefined;
  }

  /**
   * Error wrapper to normalize unexpected exceptions into APIError.
   */
  static handleApiError(error: any, fallbackMessage: string, fallbackCode: string): never {
    if (error instanceof APIError) throw error;

    console.error('Unexpected API error:', error);
    throw new APIError(fallbackMessage, 500, fallbackCode);
  }

  /**
   * Build pagination params with defaults.
   */
  static buildPaginationParams(options: {
    page?: number;
    limit?: number;
    [key: string]: any;
  }): URLSearchParams {
    const params = new URLSearchParams();

    // defaults
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    params.set('page', String(page));
    params.set('limit', String(limit));

    for (const [k, v] of Object.entries(options)) {
      if (k === 'page' || k === 'limit') continue;
      if (v === undefined || v === null) continue;
      params.set(k, String(v));
    }

    return params;
  }
}

// ==================== ENHANCED API CLIENT ====================

export class PortfolioApiClient extends BaseApiClient {
  // username availability cache
  private usernameCache = new Map<string, { result: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  // ==================== CORE PORTFOLIO OPERATIONS ====================

  async create(data: CreatePortfolioDto): Promise<Portfolio> {
    console.log('Creating portfolio with data:', data);
    try {
      const response = await this.requestWithRetry<BackendResponse<{
        portfolio: any;
        user?: { hasPortfolio?: boolean; portfolioId?: string; portfolioUsername?: string; };
      }>>('/api/portfolios/me/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = ResponseHandler.handleResponse(response);
      // result may be { portfolio: {...}, user: {...} } or legacy shape
      const backendPortfolio = result?.portfolio ?? result;
      return portfolioFromBackend(backendPortfolio);

    } catch (error) {
      if (error instanceof APIError) {
        const errorMappings: Record<string, string> = {
          'PORTFOLIO_EXISTS': 'You already have a portfolio. Use the update function to modify it.',
          'DUPLICATE_USERNAME': 'This username is already taken. Please choose a different one.',
          'INVALID_KIND': 'Invalid portfolio type. Choose from: basic, professional, hybrid, showcase.',
          'VALIDATION_ERROR': 'Please check your input data and try again.',
          'USER_NOT_FOUND': 'User account not found. Please log in again.',
          'TITLE_TOO_LONG': 'Portfolio title must be 100 characters or less.',
          'BIO_TOO_LONG': 'Portfolio bio must be 500 characters or less.',
          'SPECIALIZATIONS_LIMIT': 'Maximum 10 specializations allowed.',
          'TAGS_LIMIT': 'Maximum 20 tags allowed.'
        };

        const mapped = error.code && errorMappings[error.code];
        if (mapped) {
          throw new APIError(mapped, error.status, error.code);
        }
        throw error;
      }

      return ResponseHandler.handleApiError(error, 'Failed to create portfolio', 'CREATE_FAILED');
    }
  }

  async update(data: UpdatePortfolioDto): Promise<Portfolio> {
    console.log('Updating portfolio with data:', data);
    try {
      const response = await this.requestWithRetry<BackendResponse<any>>('/api/portfolios/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return ResponseHandler.handleResponse(response, (d) => portfolioFromBackend(d.portfolio ?? d));
    } catch (error) {
      if (error instanceof APIError) {
        const errorMappings: Record<string, string | ((err: APIError) => string)> = {
          'PORTFOLIO_NOT_FOUND': 'Portfolio not found. Please create a portfolio first.',
          'DUPLICATE_USERNAME': 'This username is already taken. Please choose a different one.',
          'VALIDATION_ERROR': (err: APIError) => this.formatValidationError(err),
          'TITLE_TOO_LONG': 'Portfolio title must be 100 characters or less.',
          'BIO_TOO_LONG': 'Portfolio bio must be 500 characters or less.',
          'SPECIALIZATIONS_LIMIT': 'Maximum 10 specializations allowed.',
          'TAGS_LIMIT': 'Maximum 20 tags allowed.'
        };

        const map = error.code && errorMappings[error.code];
        if (map) {
          const message = typeof map === 'function' ? map(error) : map;
          throw new APIError(message, error.status, error.code);
        }
        throw error;
      }

      return ResponseHandler.handleApiError(error, 'Failed to update portfolio', 'UPDATE_FAILED');
    }
  }

  async getMyPortfolio(): Promise<Portfolio | null> {
    try {
      const response = await this.requestWithRetry<BackendResponse<any>>('/api/portfolios/me');
      // Extract data (throws on failed)
      const data = ResponseHandler.extractData(response);
      if (!data) return null;
      const backendPortfolio = data.portfolio ?? data;
      // Defensive: if still falsy, return null
      if (!backendPortfolio) return null;
      return portfolioFromBackend(backendPortfolio);
    } catch (error) {
      if (error instanceof APIError && error.status === 404) return null;
      throw error;
    }
  }

  async deleteMyPortfolio(deleteGalleryPieces: boolean = false, confirmDelete: boolean = true): Promise<{
    portfolioId: string;
    deletedGalleryPieces: boolean;
    deletedPiecesCount: number;
    orphanedPiecesCount: number;
  }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<{
        portfolioId: string;
        deletedGalleryPieces: boolean;
        deletedPiecesCount: number;
        orphanedPiecesCount: number;
      }>>('/api/portfolios/me', {
        method: 'DELETE',
        body: JSON.stringify({ deleteGalleryPieces, confirmDelete }),
      });

      return ResponseHandler.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        const errorMappings: Record<string, string> = {
          'CONFIRMATION_REQUIRED': 'Please confirm that you want to delete your portfolio.',
          'PORTFOLIO_NOT_FOUND': 'Portfolio not found.'
        };

        const mapped = error.code && errorMappings[error.code];
        if (mapped) throw new APIError(mapped, error.status, error.code);
        throw error;
      }

      return ResponseHandler.handleApiError(error, 'Failed to delete portfolio', 'DELETE_FAILED');
    }
  }

  async upgrade(kind: PortfolioKind, preserveContent: boolean = true): Promise<Portfolio> {
    try {
      const response = await this.requestWithRetry<BackendResponse<any>>('/api/portfolios/me/upgrade', {
        method: 'PUT',
        body: JSON.stringify({ kind, preserveContent }),
      });

      return ResponseHandler.handleResponse(response, (d) => portfolioFromBackend(d.portfolio ?? d));
    } catch (error) {
      if (error instanceof APIError) {
        const errorMappings: Record<string, string> = {
          'PORTFOLIO_NOT_FOUND': 'Portfolio not found. Please create a portfolio first.',
          'INVALID_KIND': 'Invalid portfolio type for upgrade.',
          'INVALID_UPGRADE': 'Portfolio is already at this level or higher.'
        };

        const mapped = error.code && errorMappings[error.code];
        if (mapped) throw new APIError(mapped, error.status, error.code);
        throw error;
      }

      return ResponseHandler.handleApiError(error, 'Failed to upgrade portfolio', 'UPGRADE_FAILED');
    }
  }

  // ==================== PORTFOLIO UTILITIES ====================

  async hasPortfolio(): Promise<{
    hasPortfolio: boolean;
    portfolio?: { id: string; kind: string; title: string; username: string; };
  }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<{
        hasPortfolio: boolean;
        portfolio?: any;
      }>>('/api/portfolios/me/check');

      const result = ResponseHandler.handleResponse(response);
      // normalize portfolio shape if present, but don't run expensive transforms
      const portfolio = result.portfolio
        ? {
          id: result.portfolio.id,
          kind: result.portfolio.kind,
          title: result.portfolio.title,
          username: result.portfolio.username
        }
        : undefined;

      return { hasPortfolio: Boolean(result.hasPortfolio), portfolio };
    } catch (error) {
      // Fallback: ask for portfolio directly (cheap request)
      try {
        const portfolio = await this.getMyPortfolio();
        return {
          hasPortfolio: !!portfolio, portfolio: portfolio ? {
            id: (portfolio as any).id,
            kind: (portfolio as any).kind,
            title: (portfolio as any).title,
            username: (portfolio as any).username
          } : undefined
        };
      } catch {
        return { hasPortfolio: false };
      }
    }
  }

  async getTypeConfig(type: string): Promise<{ type: string; config: PortfolioTypeConfig; }> {
    console.log('[PortfolioAPI] Getting type config for:', type);
    try {
      const response = await this.requestWithRetry<BackendResponse<{ type: string; config: PortfolioTypeConfig }>>(
        `/api/portfolios/type-config/${encodeURIComponent(type)}`
      );
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        throw new APIError(`Portfolio type '${type}' is not supported`, 404, 'TYPE_NOT_FOUND');
      }
      return ResponseHandler.handleApiError(error, 'Failed to get type configuration', 'CONFIG_ERROR');
    }
  }

  // ==================== GALLERY MANAGEMENT ====================

  async getMyGalleryPieces(options: {
    page?: number;
    limit?: number;
    category?: string;
    visibility?: 'public' | 'private' | 'unlisted' | 'all';
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    success: boolean;
    galleryPieces: BackendGalleryPiece[];
    pagination?: PaginationResponse;
    filters?: any;
  }> {
    const params = ResponseHandler.buildPaginationParams(options);

    try {
      const response = await this.requestWithRetry<BackendResponse<any>>(`/api/portfolios/me/gallery?${params}`);
      // Extract and normalize in minimal passes
      const data = ResponseHandler.extractData(response);
      const pieces = ResponseHandler.normalizePieces(data);
      const pagination = ResponseHandler.normalizePagination(data);
      const filters = data?.filters ?? undefined;
      const success = response && typeof response.success === 'boolean' ? response.success : true;

      return { success, galleryPieces: pieces, pagination, filters };
    } catch (error) {
      if (error instanceof APIError && error.code === 'PORTFOLIO_NOT_FOUND') {
        throw new APIError('Portfolio not found. Please create a portfolio first.', 404, 'PORTFOLIO_NOT_FOUND');
      }
      return ResponseHandler.handleApiError(error, 'Failed to fetch gallery pieces', 'GALLERY_FETCH_FAILED');
    }
  }

  async addGalleryPiece(data: GalleryPieceCreateData): Promise<GalleryPieceResponse> {
    console.log('Adding gallery piece with data:', data);
    try {
      const response = await this.requestWithRetry<unknown>('/api/portfolios/me/gallery', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Log the raw response for debugging
      console.log('Raw gallery piece response:', response);

      // Type assertion for the response
      const typedResponse = response as any;

      // Handle different response formats
      if (typedResponse?.success !== undefined) {
        // New format: { success: true, galleryPiece: {...}, portfolioId: "...", message: "..." }
        if (!typedResponse.success) {
          throw new APIError(
            typedResponse.error || typedResponse.message || 'Gallery piece creation failed',
            400,
            typedResponse.code || 'CREATION_FAILED'
          );
        }
        return {
          success: typedResponse.success,
          galleryPiece: typedResponse.galleryPiece,
          portfolioId: typedResponse.portfolioId,
          message: typedResponse.message,
          code: typedResponse.code
        };
      } else {
        // Legacy format - wrap in new format for consistency
        return {
          success: true,
          galleryPiece: typedResponse.galleryPiece || typedResponse,
          message: 'Gallery piece created successfully'
        };
      }

    } catch (error) {
      if (error instanceof APIError) {
        const errorMappings: { [key: string]: string } = {
          'MISSING_TITLE': 'Title is required for gallery pieces.',
          'MISSING_IMAGE_URL': 'Image URL is required for gallery pieces.',
          'PORTFOLIO_NOT_FOUND': 'Portfolio not found. Please create a portfolio first.',
          'VALIDATION_ERROR': 'Please check your input data and try again.',
          'DUPLICATE_ENTRY': 'A gallery piece with this information already exists.'
        };

        const mapped = error.code && errorMappings[error.code];
        if (mapped) {
          throw new APIError(mapped, error.status, error.code);
        }
        throw error;
      }

      console.error('Unexpected error in addGalleryPiece:', error);
      throw new APIError(
        'Failed to add gallery piece. Please try again.',
        500,
        'GALLERY_ADD_FAILED'
      );
    }
  }

  async updateGalleryPiece(pieceId: string, data: Partial<BackendGalleryPiece>): Promise<{ success: boolean; galleryPiece: BackendGalleryPiece; message: string; }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<any>>(`/api/portfolios/me/gallery/${pieceId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return ResponseHandler.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        const errorMappings: Record<string, string> = {
          'INVALID_ID': 'Invalid gallery piece ID.',
          'PIECE_NOT_FOUND': 'Gallery piece not found or you do not have permission to edit it.',
          'EMPTY_TITLE': 'Gallery piece title is required.',
          'TITLE_TOO_LONG': 'Title must be 200 characters or less.',
          'DESCRIPTION_TOO_LONG': 'Description must be 1000 characters or less.',
          'TOO_MANY_TAGS': 'Maximum 20 tags allowed.',
          'INVALID_VISIBILITY': 'Visibility must be public, private, or unlisted.'
        };
        const mapped = error.code && errorMappings[error.code];
        if (mapped) throw new APIError(mapped, error.status, error.code);
        throw error;
      }
      return ResponseHandler.handleApiError(error, 'Failed to update gallery piece', 'GALLERY_UPDATE_FAILED');
    }
  }

  async deleteGalleryPiece(pieceId: string): Promise<{ success: boolean; deletedPieceId: string; message: string; }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<any>>(`/api/portfolios/me/gallery/${pieceId}`, {
        method: 'DELETE',
      });
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        const errorMappings: Record<string, string> = {
          'INVALID_ID': 'Invalid gallery piece ID.',
          'PIECE_NOT_FOUND': 'Gallery piece not found or you do not have permission to delete it.',
          'ALREADY_DELETED': 'This gallery piece has already been deleted.'
        };
        const mapped = error.code && errorMappings[error.code];
        if (mapped) throw new APIError(mapped, error.status, error.code);
        throw error;
      }
      return ResponseHandler.handleApiError(error, 'Failed to delete gallery piece', 'GALLERY_DELETE_FAILED');
    }
  }

  // ==================== BATCH OPERATIONS ====================

  async batchDeleteGalleryPieces(pieceIds: string[], onProgress?: (completed: number, total: number) => void): Promise<BatchOperationResponse> {
    if (!Array.isArray(pieceIds) || pieceIds.length === 0) {
      throw new APIError('No pieces selected for deletion', 400, 'NO_PIECES_SELECTED');
    }

    try {
      onProgress?.(0, pieceIds.length);
      const response = await this.requestWithRetry<BackendResponse<any>>('/api/portfolios/me/gallery/batch', {
        method: 'DELETE',
        body: JSON.stringify({ pieceIds }),
      });

      const result = ResponseHandler.handleResponse(response);
      // one call to onProgress with numeric value (cheap)
      onProgress?.(Number(result.deletedCount ?? 0), pieceIds.length);

      return {
        success: true,
        deletedCount: result.deletedCount,
        requestedCount: result.requestedCount,
        skippedCount: result.skippedCount,
        message: result.message ?? ''
      };
    } catch (error) {
      if (error instanceof APIError) {
        const errorMappings: Record<string, string> = {
          'MISSING_PIECE_IDS': 'Please provide an array of piece IDs to delete.',
          'INVALID_FORMAT': 'Piece IDs must be provided as an array.',
          'EMPTY_ARRAY': 'Please provide at least one piece ID to delete.',
          'TOO_MANY_PIECES': 'Maximum 100 pieces can be deleted at once.',
          'INVALID_IDS': 'Some piece IDs are invalid.',
          'NO_PIECES_FOUND': 'None of the specified pieces were found or you do not have permission to delete them.'
        };
        const mapped = error.code && errorMappings[error.code];
        if (mapped) throw new APIError(mapped, error.status, error.code);
        throw error;
      }
      return ResponseHandler.handleApiError(error, 'Failed to delete gallery pieces', 'BATCH_DELETE_FAILED');
    }
  }

  async batchUpdateGalleryVisibility(pieceIds: string[], visibility: 'public' | 'private' | 'unlisted'): Promise<BatchOperationResponse> {
    if (!Array.isArray(pieceIds) || pieceIds.length === 0) {
      throw new APIError('No pieces selected for update', 400, 'NO_PIECES_SELECTED');
    }

    try {
      const response = await this.requestWithRetry<BackendResponse<any>>('/api/portfolios/me/gallery/batch/visibility', {
        method: 'PUT',
        body: JSON.stringify({ pieceIds, visibility }),
      });

      const result = ResponseHandler.handleResponse(response);
      return {
        success: true,
        updatedCount: result.updatedCount,
        requestedCount: result.requestedCount,
        skippedCount: result.skippedCount,
        message: result.message ?? ''
      };
    } catch (error) {
      if (error instanceof APIError) {
        const errorMappings: Record<string, string> = {
          'MISSING_PIECE_IDS': 'Please provide an array of piece IDs to update.',
          'MISSING_VISIBILITY': 'Please specify the visibility setting.',
          'INVALID_VISIBILITY': 'Visibility must be public, private, or unlisted.',
          'TOO_MANY_PIECES': 'Maximum 100 pieces can be updated at once.'
        };
        const mapped = error.code && errorMappings[error.code];
        if (mapped) throw new APIError(mapped, error.status, error.code);
        throw error;
      }
      return ResponseHandler.handleApiError(error, 'Failed to update gallery visibility', 'BATCH_VISIBILITY_FAILED');
    }
  }

  async getGalleryStats(): Promise<GalleryStatsResponse> {
    console.log('[PortfolioAPI] Getting gallery stats');
    try {
      const response = await this.requestWithRetry<BackendResponse<{ stats: GalleryStatsResponse['stats'] }>>('/api/portfolios/me/gallery/stats');
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        throw new APIError('Portfolio not found', 404, 'PORTFOLIO_NOT_FOUND');
      }
      return ResponseHandler.handleApiError(error, 'Failed to get gallery stats', 'STATS_FETCH_FAILED');
    }
  }

  // ==================== IMAGE UPLOAD ====================

  async uploadImage(file: File, type?: 'profile' | 'cover' | 'gallery', onProgress?: (progress: number) => void): Promise<UploadResponse> {
    // validation (cheap checks)
    this.validateImageFile(file);

    const formData = new FormData();
    formData.append('image', file);
    if (type) formData.append('type', type);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = { 'ngrok-skip-browser-warning': 'true' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.baseURL}/api/portfolios/upload-image`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        const uploadErrorMappings: Record<number, string> = {
          401: 'Please log in to upload images.',
          400: 'Invalid file. Please select a valid image file.',
          413: 'File size too large. Please use an image smaller than 10MB.',
          415: 'Invalid file type. Please use a valid image format (JPEG, PNG, GIF, WebP).',
          429: 'Too many upload requests. Please wait a moment and try again.'
        };

        const errorMessage = uploadErrorMappings[response.status] || errorData.message || `Upload failed: ${response.statusText}`;
        throw new APIError(errorMessage, response.status, errorData.code);
      }

      const result = await response.json();
      return result as UploadResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof APIError) throw error;
      if ((error as any)?.name === 'AbortError') {
        throw new APIError('Upload timeout. Please try again with a smaller file.', 408, 'UPLOAD_TIMEOUT');
      }
      return ResponseHandler.handleApiError(error, 'Image upload failed. Please check your connection and try again.', 'UPLOAD_ERROR');
    }
  }

  // ==================== PUBLIC PORTFOLIO ACCESS ====================

  async getByUsername(username: string): Promise<{ success: boolean; portfolio: Portfolio & { isOwner?: boolean }; }> {
    const response = await this.requestWithRetry<{ success: boolean; portfolio: any }>(`/api/portfolios/by-username/${encodeURIComponent(username)}`);
    const data = ResponseHandler.extractData(response);
    const backendPortfolio = data?.portfolio ?? data;
    return {
      success: response && typeof (response as any).success === 'boolean' ? (response as any).success : true,
      portfolio: {
        ...portfolioFromBackend(backendPortfolio),
        isOwner: backendPortfolio?.isOwner
      }
    };
  }

  async discover(
    filters?: { kind?: string; search?: string; featured?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc' },
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; portfolios: Portfolio[]; pagination: PaginationResponse; filters: any }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(Object.entries(filters || {}).filter(([_, v]) => v !== undefined))
      });

      const response = await this.requestWithRetry<{ success: boolean; portfolios: any[]; pagination: any; filters: any }>(
        `/api/portfolios/discover?${params}`
      );

      const data = ResponseHandler.extractData(response);
      const portfolios = Array.isArray(data?.portfolios) ? data.portfolios.map(portfolioFromBackend) : [];
      const pagination = ResponseHandler.normalizePagination(data?.pagination ?? data);

      return {
        success: (response as any).success ?? true,
        portfolios,
        pagination: pagination ?? { page, limit, total: 0, pages: 0 },
        filters: data?.filters
      };
    } catch (err) {
      // Handle permanent "not implemented" without retry
      if (err instanceof APIError && err.status === 501) {
        console.warn('[Portfolio] Discovery endpoint not implemented. Returning empty result.');
        return {
          success: true,
          portfolios: [],
          pagination: { page, limit, total: 0, pages: 0 },
          filters: {}
        };
      }
      throw err;
    }
  }

  async getStats(): Promise<{ success: boolean; stats: { totalPortfolios: number; publicPortfolios: number; totalGalleryPieces: number; kinds: Record<string, number>; recentPortfolios: number; topPortfolios: Portfolio[]; }; }> {
    const response = await this.requestWithRetry<{ success: boolean; stats: any }>('/api/portfolios/stats');
    const data = ResponseHandler.extractData(response);
    const topPortfolios = Array.isArray(data?.stats?.topPortfolios) ? data.stats.topPortfolios.map(portfolioFromBackend) : [];
    return {
      success: (response as any).success ?? true,
      stats: {
        ...data.stats,
        topPortfolios
      }
    };
  }

  async getPortfolioGalleryByUsername(username: string, page: number = 1, limit: number = 20): Promise<{ success: boolean; pieces: BackendGalleryPiece[]; pagination: PaginationResponse; portfolio: { id: string; username: string; title: string; isOwner?: boolean; }; }> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await this.requestWithRetry<any>(`/api/portfolios/by-username/${encodeURIComponent(username)}/gallery?${params}`);
    const data = ResponseHandler.extractData(response);
    const pieces = ResponseHandler.normalizePieces(data);
    const pagination = ResponseHandler.normalizePagination(data) ?? { page, limit, total: 0, pages: 0 };
    const portfolio = data?.portfolio ? {
      id: data.portfolio.id,
      username: data.portfolio.username,
      title: data.portfolio.title,
      isOwner: data.portfolio.isOwner
    } : { id: '', username, title: '', isOwner: false };

    return { success: (response as any).success ?? true, pieces, pagination, portfolio };
  }

  // ==================== CONCEPTS MANAGEMENT ====================

  async getMyConcepts(): Promise<{ success: boolean; concepts: ConceptProgress[]; stats: { total: number; completed: number; inProgress: number; }; }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<{ concepts: ConceptProgress[]; stats: { total: number; completed: number; inProgress: number; }; }>>('/api/portfolios/me/concepts');
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      return ResponseHandler.handleApiError(error, 'Failed to get concepts', 'CONCEPTS_FETCH_FAILED');
    }
  }

  async addConceptToPortfolio(conceptId: string, data: { status?: 'started' | 'in-progress' | 'completed'; notes?: string; score?: number; startedAt?: string; }): Promise<{ success: boolean; concept: ConceptProgress; message: string; }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<{ concept: ConceptProgress; message: string }>>(`/api/portfolios/me/concepts/${encodeURIComponent(conceptId)}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      return ResponseHandler.handleApiError(error, 'Failed to add concept', 'CONCEPT_ADD_FAILED');
    }
  }

  async updateConceptProgress(conceptId: string, data: { status?: 'started' | 'in-progress' | 'completed'; score?: number; notes?: string; completedAt?: string; }): Promise<{ success: boolean; concept: ConceptProgress; message: string; }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<{ concept: ConceptProgress; message: string }>>(`/api/portfolios/me/concepts/${encodeURIComponent(conceptId)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      return ResponseHandler.handleApiError(error, 'Failed to update concept progress', 'CONCEPT_UPDATE_FAILED');
    }
  }

  // ==================== ANALYTICS & DASHBOARD ====================

  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{ success: boolean; analytics: any; }> {
    try {
      const params = new URLSearchParams({ period });
      const response = await this.requestWithRetry<BackendResponse<{ analytics: any }>>(`/api/portfolios/me/analytics?${params}`);
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      return ResponseHandler.handleApiError(error, 'Failed to get analytics', 'ANALYTICS_FETCH_FAILED');
    }
  }

  async getDashboard(): Promise<{ success: boolean; dashboard: { portfolio: any; gallery: any; recentActivity: any; quickActions: any[]; }; }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<{ dashboard: any }>>('/api/portfolios/me/dashboard');
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      return ResponseHandler.handleApiError(error, 'Failed to get dashboard', 'DASHBOARD_FETCH_FAILED');
    }
  }

  async trackView(portfolioId: string, data?: { referrer?: string; duration?: number; }): Promise<{ success: boolean; message: string; }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<{ message: string }>>(`/api/portfolios/by-id/${encodeURIComponent(portfolioId)}/views`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      });
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      return ResponseHandler.handleApiError(error, 'Failed to track view', 'VIEW_TRACK_FAILED');
    }
  }

  // ==================== IMAGE SERVING ====================

  async serveGalleryImage(pieceId: string): Promise<Response> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = { 'ngrok-skip-browser-warning': 'true' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.baseURL}/api/portfolios/me/gallery/${encodeURIComponent(pieceId)}/image`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new APIError(`Failed to serve image: ${response.statusText}`, response.status, 'IMAGE_SERVE_FAILED');
      }

      return response;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to serve gallery image', 500, 'IMAGE_SERVE_FAILED');
    }
  }

  async servePublicGalleryImage(username: string, pieceId: string): Promise<Response> {
    try {
      const response = await fetch(`${this.baseURL}/api/portfolios/by-username/${encodeURIComponent(username)}/gallery/${encodeURIComponent(pieceId)}/image`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (!response.ok) throw new APIError(`Failed to serve public image: ${response.statusText}`, response.status, 'PUBLIC_IMAGE_SERVE_FAILED');
      return response;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to serve public gallery image', 500, 'PUBLIC_IMAGE_SERVE_FAILED');
    }
  }

  async serveMyImage(type: 'profile' | 'cover'): Promise<Response> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = { 'ngrok-skip-browser-warning': 'true' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.baseURL}/api/portfolios/me/image/${encodeURIComponent(type)}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) throw new APIError(`Failed to serve ${type} image: ${response.statusText}`, response.status, 'PROFILE_IMAGE_SERVE_FAILED');
      return response;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(`Failed to serve ${type} image`, 500, 'PROFILE_IMAGE_SERVE_FAILED');
    }
  }

  async servePublicImage(username: string, type: 'profile' | 'cover'): Promise<Response> {
    try {
      const response = await fetch(`${this.baseURL}/api/portfolios/by-username/${encodeURIComponent(username)}/image/${encodeURIComponent(type)}`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (!response.ok) throw new APIError(`Failed to serve public ${type} image: ${response.statusText}`, response.status, 'PUBLIC_PROFILE_IMAGE_SERVE_FAILED');
      return response;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(`Failed to serve public ${type} image`, 500, 'PUBLIC_PROFILE_IMAGE_SERVE_FAILED');
    }
  }

  // ==================== DEBUG ENDPOINTS ====================

  async getUploadConfig(): Promise<{ success: boolean; data: { maxFileSize: string; maxFileSizeBytes: number; allowedTypes: string[]; uploadPath: string; gridFS: { bucketName: string; connected: boolean; }; timestamp: string; }; }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<any>>('/api/portfolios/debug/upload-config');
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      return ResponseHandler.handleApiError(error, 'Failed to get upload configuration', 'CONFIG_ERROR');
    }
  }

  async validateFile(filename: string): Promise<{ success: boolean; data: { filename: string; exists: boolean; files: Array<{ id: string; filename: string; contentType: string; length: number; uploadDate: string; metadata: any; }>; timestamp: string; }; }> {
    try {
      const response = await this.requestWithRetry<BackendResponse<any>>(`/api/portfolios/debug/file-check/${encodeURIComponent(filename)}`);
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError && error.code === 'MISSING_FILENAME') {
        throw new APIError('Please provide a filename to validate', 400, 'MISSING_FILENAME');
      }
      return ResponseHandler.handleApiError(error, 'Failed to validate file', 'VALIDATION_ERROR');
    }
  }

  // ==================== UTILITY METHODS ====================

  async checkUsernameAvailability(username: string): Promise<{ available: boolean; suggestions?: string[] }> {
    console.log('[PortfolioAPI] Checking username availability:', username);

    // cache check (cheap)
    const cached = this.usernameCache.get(username);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    try {
      const response = await this.requestWithRetry<BackendResponse<{ available: boolean; suggestions?: string[] }>>(`/api/portfolios/check-username/${encodeURIComponent(username)}`);
      const result = ResponseHandler.handleResponse(response);
      this.usernameCache.set(username, { result, timestamp: Date.now() });
      return result;
    } catch (error) {
      return ResponseHandler.handleApiError(error, 'Failed to check username availability', 'USERNAME_CHECK_FAILED');
    }
  }

  async getPortfolioStats(): Promise<{ stats: any; analytics?: any }> {
    console.log('[PortfolioAPI] Getting portfolio stats');
    try {
      const response = await this.requestWithRetry<BackendResponse<{ stats: any; analytics?: any }>>('/api/portfolios/me/stats');
      return ResponseHandler.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        throw new APIError('Portfolio not found', 404, 'PORTFOLIO_NOT_FOUND');
      }
      return ResponseHandler.handleApiError(error, 'Failed to get portfolio stats', 'STATS_FETCH_FAILED');
    }
  }

  // ==================== ENHANCED UTILITY METHODS ====================

  private validateImageFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new APIError('Invalid file type. Please use JPEG, PNG, GIF, or WebP format.', 400, 'INVALID_FILE_TYPE');
    }

    if (file.size > maxSize) {
      throw new APIError('File size too large. Please use an image smaller than 10MB.', 400, 'FILE_TOO_LARGE');
    }

    if (file.size === 0) {
      throw new APIError('File is empty. Please select a valid image file.', 400, 'EMPTY_FILE');
    }
  }

  private formatValidationError(error: APIError): string {
    const details = (error as any).details || [];
    if (Array.isArray(details) && details.length > 0) {
      const fieldErrors = details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
      return `Validation failed: ${fieldErrors}`;
    }
    return 'Validation failed. Please check your input data.';
  }

  // ==================== RAW IMAGE UPLOAD (for compatibility) ====================

  async uploadImageRaw(formData: FormData): Promise<UploadResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = { 'ngrok-skip-browser-warning': 'true' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.baseURL}/api/portfolios/upload-image`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new APIError(errorData.message || `Upload failed: ${response.statusText}`, response.status, errorData.code);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof APIError) throw error;
      throw new APIError('Raw image upload failed', undefined, 'UPLOAD_ERROR');
    }
  }

  // ==================== LEGACY METHODS (for backward compatibility) ====================

  async getById(id: string): Promise<Portfolio> {
    console.warn('getById is deprecated, use getByUsername instead');
    const response = await this.requestWithRetry<any>(`/api/portfolios/by-id/${encodeURIComponent(id)}`);
    const data = ResponseHandler.extractData(response);
    return portfolioFromBackend(data);
  }

  async getByUserId(userId: string): Promise<Portfolio> {
    console.warn('getByUserId is deprecated, use getByUsername instead');
    const response = await this.requestWithRetry<any>(`/api/portfolios/user/${encodeURIComponent(userId)}`);
    const data = ResponseHandler.extractData(response);
    return portfolioFromBackend(data);
  }
}
