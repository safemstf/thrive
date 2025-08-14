// src/services/portfolioService.ts - Clean service layer without duplicates
import { api } from '@/lib/api-client';
import type { 
  Portfolio, 
  PortfolioKind, 
  CreatePortfolioDto, 
  UpdatePortfolioDto 
} from '@/types/portfolio.types';
import type { GalleryPiece } from '@/types/gallery.types';

// Normalizer utility
function normalizeApi<T = any>(raw: any): T | null {
  if (raw == null) return null;
  if (typeof raw !== 'object') return raw as T;
  
  if ('data' in raw) return raw.data as T;
  if ('portfolio' in raw) return raw.portfolio as T;
  if ('galleryPieces' in raw) return raw.galleryPieces as T;
  if ('pieces' in raw) return raw.pieces as T;
  
  return raw as T;
}

// Enhanced Portfolio interface (only define once here)
export interface EnhancedPortfolio extends Portfolio {
  capabilities: {
    gallery: boolean;
    learning: boolean;
    projects: boolean;
    tutoring: boolean;
  };
}

// Portfolio metadata for localStorage
interface PortfolioMetadata {
  portfolioId: string;
  kind: PortfolioKind;
  createdAt: string;
  updatedAt: string;
}

export class PortfolioService {
  private static METADATA_KEY = 'portfolio_metadata';

  // ==================== UTILITY METHODS ====================
  
  static getCapabilities(kind: PortfolioKind) {
    return {
      gallery: kind === 'creative' || kind === 'hybrid' || kind === 'professional',
      learning: kind === 'educational' || kind === 'hybrid',
      projects: true,
      tutoring: true
    };
  }

  static enhancePortfolio(portfolio: Portfolio): EnhancedPortfolio | null {
    if (!portfolio) return null;
    
    return {
      ...portfolio,
      capabilities: this.getCapabilities(portfolio.kind)
    };
  }

  // ==================== METADATA MANAGEMENT ====================
  
  static getMetadata(): PortfolioMetadata | null {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(this.METADATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  
  static saveMetadata(metadata: PortfolioMetadata): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to save portfolio metadata:', error);
    }
  }
  
  static clearMetadata(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.METADATA_KEY);
    } catch (error) {
      console.warn('Failed to clear portfolio metadata:', error);
    }
  }

  // ==================== CORE PORTFOLIO OPERATIONS ====================
  
  static async getMyPortfolio(): Promise<EnhancedPortfolio | null> {
    try {
      const raw = await api.portfolio.get();
      const portfolio = normalizeApi<Portfolio>(raw);
      return portfolio ? this.enhancePortfolio(portfolio) : null;
    } catch (error: any) {
      if (error?.status === 404) {
        return null; // No portfolio exists - normal case
      }
      throw error;
    }
  }

  static async getPortfolioByUsername(username: string): Promise<EnhancedPortfolio | null> {
    const raw = await api.portfolio.getByUsername(username);
    const portfolio = normalizeApi<Portfolio>(raw);
    return portfolio ? this.enhancePortfolio(portfolio) : null;
  }

  static async getPortfolioById(id: string): Promise<EnhancedPortfolio | null> {
    const raw = await api.portfolio.getById(id);
    const portfolio = normalizeApi<Portfolio>(raw);
    return portfolio ? this.enhancePortfolio(portfolio) : null;
  }

  static async createPortfolio(data: CreatePortfolioDto): Promise<EnhancedPortfolio> {
    const raw = await api.portfolio.create(data);
    const portfolio = normalizeApi<Portfolio>(raw);
    
    if (!portfolio) {
      throw new Error('Portfolio created but no data returned');
    }

    // Save metadata
    const portfolioId = portfolio.id || portfolio._id;
    if (portfolioId) {
      const metadata: PortfolioMetadata = {
        portfolioId,
        kind: portfolio.kind,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.saveMetadata(metadata);
    }
    
    return this.enhancePortfolio(portfolio)!;
  }

  static async createPortfolioWithType(
    data: any,
    kind: PortfolioKind
  ): Promise<EnhancedPortfolio> {
    const portfolioData: CreatePortfolioDto = {
      ...data,
      kind
    };
    
    return this.createPortfolio(portfolioData);
  }

  static async updatePortfolio(data: UpdatePortfolioDto): Promise<EnhancedPortfolio> {
    const raw = await api.portfolio.update(data);
    const portfolio = normalizeApi<Portfolio>(raw);
    
    if (!portfolio) {
      throw new Error('Portfolio updated but no data returned');
    }

    // Update metadata if kind changed
    if (data.kind) {
      const portfolioId = portfolio.id || portfolio._id;
      const metadata = this.getMetadata();
      if (metadata && portfolioId && metadata.portfolioId === portfolioId) {
        this.saveMetadata({
          ...metadata,
          kind: data.kind,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    return this.enhancePortfolio(portfolio)!;
  }

  static async updatePortfolioType(
    portfolio: Portfolio, 
    kind: PortfolioKind
  ): Promise<void> {
    await this.updatePortfolio({ kind });
  }

  static async deletePortfolio(deleteGalleryPieces = false): Promise<void> {
    await api.portfolio.delete(deleteGalleryPieces);
    this.clearMetadata();
  }

  static async checkPortfolioExists(): Promise<boolean> {
    const raw = await api.portfolio.check();
    const payload = normalizeApi<any>(raw) || raw;
    return payload?.hasPortfolio || raw?.hasPortfolio || false;
  }

  // ==================== DISCOVERY OPERATIONS ====================
  
  static async discoverPortfolios(filters: any = {}, page = 1, limit = 20) {
    const raw = await api.portfolio.discover(filters, page, limit);
    const payload = normalizeApi<{ portfolios?: Portfolio[]; pagination?: any }>(raw) || {};
    
    const portfolios = (payload.portfolios || []).map(p => this.enhancePortfolio(p)).filter(Boolean);
    const pagination = payload.pagination || { page, limit, total: 0, pages: 1 };
    
    return {
      data: portfolios,
      portfolios,
      total: pagination.total || 0,
      page: pagination.page || page,
      pageSize: pagination.limit || limit,
      hasMore: (pagination.page || page) < (pagination.pages || 1),
    };
  }

  static async getPortfolioStats(): Promise<any> {
    const raw = await api.portfolio.getStats();
    return normalizeApi<any>(raw);
  }

  // ==================== GALLERY OPERATIONS ====================
  
  static async getMyGalleryPieces(): Promise<GalleryPiece[]> {
    try {
      const raw = await api.portfolio.gallery.get();
      
      // Handle different response formats
      if (Array.isArray(raw)) {
        return raw as GalleryPiece[];
      }
      
      const pieces = normalizeApi<GalleryPiece[]>(raw);
      if (Array.isArray(pieces)) {
        return pieces;
      }
      
      // Fallback to checking raw response for known properties
      const response = raw as any; // Type assertion to handle different response shapes
      if (response && typeof response === 'object') {
        if ('galleryPieces' in response && Array.isArray(response.galleryPieces)) {
          return response.galleryPieces as GalleryPiece[];
        }
        if ('pieces' in response && Array.isArray(response.pieces)) {
          return response.pieces as GalleryPiece[];
        }
        if ('data' in response && Array.isArray(response.data)) {
          return response.data as GalleryPiece[];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch gallery pieces:', error);
      return [];
    }
  }

  static async getPortfolioGalleryByUsername(
    username: string, 
    page = 1, 
    limit = 20
  ): Promise<{ galleryPieces: GalleryPiece[]; pagination?: any; portfolio?: Portfolio | null }> {
    const raw = await api.portfolio.gallery.getByUsername(username, page, limit);
    const payload = normalizeApi<any>(raw) || raw;
    
    const pieces = (payload?.galleryPieces ?? payload?.pieces ?? []) as GalleryPiece[];
    const pagination = payload?.pagination ?? { page, limit, total: 0, pages: 1 };
    const portfolio = normalizeApi<Portfolio>(payload?.portfolio) ?? null;
    
    return { galleryPieces: pieces, pagination, portfolio };
  }

  static async addGalleryPiece(pieceData: any): Promise<GalleryPiece> {
    const raw = await api.portfolio.gallery.add(pieceData);
    const piece = normalizeApi<GalleryPiece>(raw);
    
    if (!piece) {
      // Try to extract from different response formats
      if (raw && typeof raw === 'object') {
        const response = raw as any; // Type assertion to fix 'never' type issue
        if ('galleryPiece' in response) {
          return response.galleryPiece as GalleryPiece;
        }
        if ('data' in response) {
          return response.data as GalleryPiece;
        }
      }
      throw new Error('Gallery piece created but no data returned');
    }
    
    return piece;
  }

  static async updateGalleryPiece(pieceId: string, updates: any): Promise<GalleryPiece> {
    const raw = await api.portfolio.gallery.update(pieceId, updates);
    const piece = normalizeApi<GalleryPiece>(raw);
    
    if (!piece) {
      const response = raw as any; // Type assertion to fix 'never' type issue
      if (response && typeof response === 'object' && 'galleryPiece' in response) {
        return response.galleryPiece as GalleryPiece;
      }
      throw new Error('Gallery piece updated but no data returned');
    }
    
    return piece;
  }

  static async deleteGalleryPiece(pieceId: string): Promise<void> {
    await api.portfolio.gallery.delete(pieceId);
  }

  static async batchDeleteGalleryPieces(pieceIds: string[]): Promise<{ deletedCount: number; message?: string }> {
    const raw = await api.portfolio.gallery.batchDelete(pieceIds);
    const payload = normalizeApi<any>(raw);
    const response = raw as any; // Type assertion to handle API response types
    
    return { 
      deletedCount: payload?.deletedCount || response?.deletedCount || 0,
      message: payload?.message || response?.message 
    };
  }

  static async batchUpdateGalleryVisibility(
    pieceIds: string[], 
    visibility: 'public' | 'private' | 'unlisted'
  ): Promise<{ updatedCount: number; message?: string }> {
    const raw = await api.portfolio.gallery.batchUpdateVisibility(pieceIds, visibility);
    const payload = normalizeApi<any>(raw);
    const response = raw as any; // Type assertion to handle API response types
    
    return { 
      updatedCount: payload?.updatedCount || response?.updatedCount || 0,
      message: payload?.message || response?.message 
    };
  }

  static async getGalleryStats(): Promise<any> {
    const raw = await api.portfolio.gallery.getStats();
    return normalizeApi<any>(raw);
  }

  // ==================== CONCEPT OPERATIONS ====================
  
  static async getMyConcepts(): Promise<any[]> {
    const raw = await api.portfolio.concepts.get();
    const concepts = normalizeApi<any[]>(raw);
    return Array.isArray(concepts) ? concepts : [];
  }

  static async addConceptToPortfolio(
    conceptId: string, 
    data: any = {}
  ): Promise<any> {
    const raw = await api.portfolio.concepts.add(conceptId, data);
    return normalizeApi<any>(raw);
  }

  static async updateConceptProgress(
    conceptId: string, 
    data: any = {}
  ): Promise<any> {
    const raw = await api.portfolio.concepts.updateProgress(conceptId, data);
    return normalizeApi<any>(raw);
  }

  // ==================== ANALYTICS OPERATIONS ====================
  
  static async getPortfolioAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> {
    const raw = await api.portfolio.analytics.get(period);
    return normalizeApi<any>(raw);
  }

  static async getDashboard(): Promise<any> {
    const raw = await api.portfolio.analytics.dashboard();
    return normalizeApi<any>(raw);
  }

  static async trackView(portfolioId: string, data?: { referrer?: string; duration?: number }): Promise<void> {
    await api.portfolio.analytics.trackView(portfolioId, data);
  }

  // ==================== IMAGE OPERATIONS ====================
  
  static async uploadImage(file: File, type: 'profile' | 'cover' | 'gallery' = 'gallery'): Promise<{ url: string }> {
    return api.portfolio.images.upload(file, type);
  }

  static async uploadImageRaw(formData: FormData): Promise<{ url: string }> {
    return api.portfolio.images.uploadRaw(formData);
  }

  // Image URL helpers
  static getMyGalleryImageUrl(pieceId: string, size?: 'full' | 'thumbnail'): string {
    return api.portfolio.images.getMyGalleryImageUrl(pieceId, size);
  }

  static getPublicGalleryImageUrl(username: string, pieceId: string, size?: 'full' | 'thumbnail'): string {
    return api.portfolio.images.getPublicGalleryImageUrl(username, pieceId, size);
  }

  static getMyProfileImageUrl(type: 'profile' | 'cover'): string {
    return api.portfolio.images.getMyProfileImageUrl(type);
  }

  static getPublicProfileImageUrl(username: string, type: 'profile' | 'cover'): string {
    return api.portfolio.images.getPublicProfileImageUrl(username, type);
  }
}