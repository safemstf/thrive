// src/services/portfolioService.ts - Fixed to work with current API
import { api } from '@/lib/api-client';
import { useState, useEffect, useCallback } from 'react';
import type { Portfolio, PortfolioKind } from '@/types/portfolio.types';
import { getPortfolioId, getGalleryPieceId } from '@/types/portfolio.types';
import type { GalleryPiece } from '@/types/gallery.types';

// Enhanced Portfolio type with client-side kind tracking
export interface EnhancedPortfolio extends Portfolio {
  capabilities: {
    gallery: boolean;
    learning: boolean;
    projects: boolean;
    tutoring: boolean;
  };
}

// Portfolio metadata stored in localStorage
interface PortfolioMetadata {
  portfolioId: string;
  kind: PortfolioKind;
  createdAt: string;
  updatedAt: string;
}

class PortfolioService {
  private static METADATA_KEY = 'portfolio_metadata';
  
  // Get portfolio metadata from localStorage
  static getMetadata(): PortfolioMetadata | null {
    try {
      if (typeof window === 'undefined') return null; // SSR safety
      const data = localStorage.getItem(this.METADATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  
  // Save portfolio metadata
  static saveMetadata(metadata: PortfolioMetadata): void {
    if (typeof window === 'undefined') return; // SSR safety
    try {
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to save portfolio metadata:', error);
    }
  }
  
  // Clear portfolio metadata
  static clearMetadata(): void {
    if (typeof window === 'undefined') return; // SSR safety
    try {
      localStorage.removeItem(this.METADATA_KEY);
    } catch (error) {
      console.warn('Failed to clear portfolio metadata:', error);
    }
  }
  
  // Enhance portfolio with capabilities based on kind
  static enhancePortfolio(portfolio: Portfolio): EnhancedPortfolio | null {
    if (!portfolio) return null;
    
    // Use the kind from the portfolio object directly
    const kind = portfolio.kind;
    
    return {
      ...portfolio,
      capabilities: this.getCapabilities(kind)
    };
  }
  
  // Get capabilities based on portfolio kind
  static getCapabilities(kind: PortfolioKind) {
    return {
      gallery: kind === 'creative' || kind === 'hybrid' || kind === 'professional',
      learning: kind === 'educational' || kind === 'hybrid',
      projects: true, // All portfolios can have projects
      tutoring: true  // All portfolios can offer tutoring
    };
  }
  
  // Create portfolio with type - Fixed to use current API and utility functions
  static async createPortfolioWithType(
    data: any,
    kind: PortfolioKind
  ): Promise<EnhancedPortfolio> {
    // Create the portfolio with kind in the data
    const portfolioData = {
      ...data,
      kind // Include kind in the creation data
    };
    
    const portfolio = await api.portfolio.create(portfolioData);
    
    // Use utility function to safely get portfolio ID
    const portfolioId = getPortfolioId(portfolio);
    
    if (!portfolioId) {
      throw new Error('Portfolio created but no ID returned');
    }
    
    // Save metadata for backup/sync
    const metadata: PortfolioMetadata = {
      portfolioId,
      kind,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveMetadata(metadata);
    
    // Return enhanced portfolio
    return this.enhancePortfolio(portfolio)!;
  }
  
  // Update portfolio type - Fixed to use current API and utility functions
  static async updatePortfolioType(
    portfolio: Portfolio, 
    kind: PortfolioKind
  ): Promise<void> {
    // Update in backend - Fixed: API only takes data parameter
    await api.portfolio.update({ kind });
    
    // Get portfolio ID safely
    const portfolioId = getPortfolioId(portfolio);
    
    // Update local metadata
    const metadata = this.getMetadata();
    if (metadata && portfolioId && metadata.portfolioId === portfolioId) {
      this.saveMetadata({
        ...metadata,
        kind,
        updatedAt: new Date().toISOString()
      });
    }
  }
}

// Custom hook for portfolio management - Fixed to use current API
export function usePortfolioManager() {
  const [portfolio, setPortfolio] = useState<EnhancedPortfolio | null>(null);
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch portfolio and enhance it - Fixed API calls
  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get base portfolio - Fixed: use api.portfolio.get()
      const basePortfolio = await api.portfolio.get();
      
      if (basePortfolio) {
        // Enhance with capabilities
        const enhanced = PortfolioService.enhancePortfolio(basePortfolio);
        setPortfolio(enhanced);
        
        // If portfolio has gallery capability, fetch gallery pieces
        if (enhanced?.capabilities.gallery) {
          await fetchGalleryPieces(enhanced);
        } else {
          setGalleryPieces([]);
        }
      } else {
        setPortfolio(null);
        setGalleryPieces([]);
      }
    } catch (err: any) {
      if (err?.status !== 404) {
        setError(err?.message || 'Failed to fetch portfolio');
        console.error('Portfolio fetch error:', err);
      }
      // 404 means no portfolio exists - this is normal
      setPortfolio(null);
      setGalleryPieces([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch gallery pieces with proper error handling - Fixed API calls
  const fetchGalleryPieces = useCallback(async (currentPortfolio: EnhancedPortfolio) => {
    if (!currentPortfolio?.capabilities.gallery) {
      setGalleryPieces([]);
      return;
    }
    
    try {
      const portfolioId = getPortfolioId(currentPortfolio);
      console.log('Fetching gallery pieces for portfolio:', portfolioId);
      
      // Fixed: use api.portfolio.gallery.get()
      const pieces = await api.portfolio.gallery.get();
      
      if (Array.isArray(pieces)) {
        console.log(`Successfully fetched ${pieces.length} gallery pieces`);
        setGalleryPieces(pieces);
      } else {
        console.warn('Gallery pieces response is not an array:', pieces);
        setGalleryPieces([]);
      }
      
    } catch (err: any) {
      console.error('Failed to fetch gallery pieces:', err);
      setGalleryPieces([]);
      
      // Only set error if it's not a "no data" situation
      if (err?.status !== 404) {
        setError('Failed to load gallery pieces');
      }
    }
  }, []);
  
  // Create portfolio with type - Fixed to use current API
  const createPortfolio = useCallback(async (
    data: any,
    kind: PortfolioKind
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating portfolio:', { kind, title: data.title });
      
      const enhanced = await PortfolioService.createPortfolioWithType(data, kind);
      
      setPortfolio(enhanced);
      
      // If it's a portfolio with gallery capability, initialize empty gallery
      if (enhanced.capabilities.gallery) {
        setGalleryPieces([]);
      }
      
      console.log('Portfolio created successfully:', getPortfolioId(enhanced));
      return enhanced;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create portfolio';
      console.error('Portfolio creation failed:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update portfolio type - Fixed to use current API and utility functions
  const updatePortfolioType = useCallback(async (kind: PortfolioKind) => {
    if (!portfolio) {
      throw new Error('No portfolio to update');
    }
    
    try {
      console.log('Updating portfolio type:', { from: portfolio.kind, to: kind });
      
      await PortfolioService.updatePortfolioType(portfolio, kind);
      
      // Update local state
      const updatedPortfolio = {
        ...portfolio,
        kind,
        capabilities: PortfolioService.getCapabilities(kind)
      };
      
      setPortfolio(updatedPortfolio);
      
      // Refresh gallery pieces if gaining gallery capability
      if (updatedPortfolio.capabilities.gallery && !portfolio.capabilities.gallery) {
        await fetchGalleryPieces(updatedPortfolio);
      } else if (!updatedPortfolio.capabilities.gallery) {
        setGalleryPieces([]);
      }
      
      console.log('Portfolio type updated successfully');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update portfolio type';
      console.error('Portfolio type update failed:', err);
      setError(errorMessage);
      throw err;
    }
  }, [portfolio, fetchGalleryPieces]);
  
  // Delete portfolio and clear metadata - Fixed to use current API
  const deletePortfolio = useCallback(async (deleteGalleryPieces = false) => {
    try {
      setLoading(true);
      console.log('Deleting portfolio:', { deleteGalleryPieces });
      
      // Fixed: use api.portfolio.delete()
      await api.portfolio.delete(deleteGalleryPieces);
      PortfolioService.clearMetadata();
      setPortfolio(null);
      setGalleryPieces([]);
      
      console.log('Portfolio deleted successfully');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete portfolio';
      console.error('Portfolio deletion failed:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Refresh data
  const refresh = useCallback(async () => {
    console.log('Refreshing portfolio data...');
    await fetchPortfolio();
  }, [fetchPortfolio]);
  
  // Initial fetch
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);
  
  return {
    portfolio,
    galleryPieces,
    loading,
    error,
    createPortfolio,
    updatePortfolioType,
    deletePortfolio,
    refresh,
    hasCreativeCapability: portfolio?.capabilities.gallery || false,
    hasEducationalCapability: portfolio?.capabilities.learning || false
  };
}

// Gallery-specific operations hook - Fixed to use current API
export function useGalleryOperations(portfolio: EnhancedPortfolio | null) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Upload image to gallery - Fixed to use current API
  const uploadImage = useCallback(async (
    file: File,
    metadata?: {
      title?: string;
      description?: string;
      category?: string;
      medium?: string;
      tags?: string[];
      visibility?: 'public' | 'private' | 'unlisted';
      year?: number;
      displayOrder?: number;
    }
  ): Promise<GalleryPiece> => {
    if (!portfolio?.capabilities.gallery) {
      throw new Error('Portfolio does not support gallery features');
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const portfolioId = getPortfolioId(portfolio);
      console.log('Uploading image:', { fileName: file.name, portfolioId });
      
      // First upload the image file to get URL
      const uploadResult = await api.portfolio.images.uploadRaw((() => {
        const formData = new FormData();
        formData.append('file', file);
        return formData;
      })());
      
      // Then add the gallery piece with the uploaded image URL
      const pieceData = {
        title: metadata?.title || file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        description: metadata?.description,
        imageUrl: uploadResult.url,
        category: metadata?.category,
        medium: metadata?.medium,
        tags: metadata?.tags || [],
        visibility: metadata?.visibility || 'private',
        year: metadata?.year,
        displayOrder: metadata?.displayOrder || 0
      };
      
      const piece = await api.portfolio.gallery.add(pieceData);
      
      console.log('Image uploaded successfully:', getGalleryPieceId(piece)); 
      return piece;
      
    } catch (err: any) {
      const message = err?.message || 'Failed to upload image';
      console.error('Image upload failed:', err);
      setError(message);
      throw new Error(message);
    } finally {
      setUploading(false);
    }
  }, [portfolio]);
  
  // Batch upload images - Fixed to use current API
  const batchUpload = useCallback(async (
    uploads: Array<{
      file: File;
      title: string;
      description?: string;
      category?: string;
      medium?: string;
      tags?: string[];
      visibility?: 'public' | 'private' | 'unlisted';
      year?: number;
    }>,
    onProgress?: (completed: number, total: number) => void
  ) => {
    if (!portfolio?.capabilities.gallery) {
      throw new Error('Portfolio does not support gallery features');
    }
    
    try {
      setUploading(true);
      setError(null);
      
      console.log('Starting batch upload:', { count: uploads.length });
      
      const results = [];
      
      for (let i = 0; i < uploads.length; i++) {
        try {
          const result = await uploadImage(uploads[i].file, uploads[i]);
          results.push({ success: true, data: result });
          console.log(`Upload ${i + 1}/${uploads.length} successful`);
        } catch (err) {
          console.error(`Upload ${i + 1}/${uploads.length} failed:`, err);
          results.push({ success: false, error: err });
        }
        
        if (onProgress) {
          onProgress(i + 1, uploads.length);
        }
      }
      
      console.log('Batch upload completed:', { 
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });
      
      return results;
    } finally {
      setUploading(false);
    }
  }, [portfolio, uploadImage]);
  
  // Update gallery piece - New method using current API
  const updateGalleryPiece = useCallback(async (
    pieceId: string,
    updates: Partial<GalleryPiece>
  ): Promise<GalleryPiece> => {
    if (!portfolio?.capabilities.gallery) {
      throw new Error('Portfolio does not support gallery features');
    }
    
    try {
      setError(null);
      
      console.log('Updating gallery piece:', { pieceId, updates });
      
      const updatedPiece = await api.portfolio.gallery.update(pieceId, updates);
      
      console.log('Gallery piece updated successfully');
      return updatedPiece;
      
    } catch (err: any) {
      const message = err?.message || 'Failed to update gallery piece';
      console.error('Gallery piece update failed:', err);
      setError(message);
      throw new Error(message);
    }
  }, [portfolio]);
  
  // Delete gallery piece - New method using current API
  const deleteGalleryPiece = useCallback(async (pieceId: string): Promise<void> => {
    if (!portfolio?.capabilities.gallery) {
      throw new Error('Portfolio does not support gallery features');
    }
    
    try {
      setError(null);
      
      console.log('Deleting gallery piece:', pieceId);
      
      await api.portfolio.gallery.delete(pieceId);
      
      console.log('Gallery piece deleted successfully');
      
    } catch (err: any) {
      const message = err?.message || 'Failed to delete gallery piece';
      console.error('Gallery piece deletion failed:', err);
      setError(message);
      throw new Error(message);
    }
  }, [portfolio]);
  
  // Batch delete gallery pieces - New method using current API
  const batchDeleteGalleryPieces = useCallback(async (pieceIds: string[]): Promise<void> => {
    if (!portfolio?.capabilities.gallery) {
      throw new Error('Portfolio does not support gallery features');
    }
    
    try {
      setError(null);
      
      console.log('Batch deleting gallery pieces:', pieceIds);
      
      await api.portfolio.gallery.batchDelete(pieceIds);
      
      console.log('Gallery pieces deleted successfully');
      
    } catch (err: any) {
      const message = err?.message || 'Failed to delete gallery pieces';
      console.error('Batch gallery deletion failed:', err);
      setError(message);
      throw new Error(message);
    }
  }, [portfolio]);
  
  // Update visibility for multiple pieces - New method using current API
  const batchUpdateVisibility = useCallback(async (
    pieceIds: string[], 
    visibility: 'public' | 'private' | 'unlisted'
  ): Promise<void> => {
    if (!portfolio?.capabilities.gallery) {
      throw new Error('Portfolio does not support gallery features');
    }
    
    try {
      setError(null);
      
      console.log('Batch updating visibility:', { pieceIds, visibility });
      
      await api.portfolio.gallery.batchUpdateVisibility(pieceIds, visibility);
      
      console.log('Gallery pieces visibility updated successfully');
      
    } catch (err: any) {
      const message = err?.message || 'Failed to update gallery pieces visibility';
      console.error('Batch visibility update failed:', err);
      setError(message);
      throw new Error(message);
    }
  }, [portfolio]);
  
  return {
    // Upload operations
    uploadImage,
    batchUpload,
    
    // CRUD operations
    updateGalleryPiece,
    deleteGalleryPiece,
    batchDeleteGalleryPieces,
    batchUpdateVisibility,
    
    // State
    uploading,
    error
  };
}

// Concept operations hook - New hook for educational portfolios
export function useConceptOperations(portfolio: EnhancedPortfolio | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add concept to portfolio
  const addConcept = useCallback(async (
    conceptId: string,
    data?: {
      status?: string;
      startedAt?: string;
      notes?: string;
      score?: number;
    }
  ) => {
    if (!portfolio?.capabilities.learning) {
      throw new Error('Portfolio does not support learning features');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.portfolio.concepts.add(conceptId, data);
      
      console.log('Concept added to portfolio successfully');
      
    } catch (err: any) {
      const message = err?.message || 'Failed to add concept';
      console.error('Add concept failed:', err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [portfolio]);
  
  // Update concept progress
  const updateConceptProgress = useCallback(async (
    conceptId: string,
    data?: {
      status?: string;
      score?: number;
      notes?: string;
      completedAt?: string;
    }
  ) => {
    if (!portfolio?.capabilities.learning) {
      throw new Error('Portfolio does not support learning features');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.portfolio.concepts.updateProgress(conceptId, data);
      
      console.log('Concept progress updated successfully');
      
    } catch (err: any) {
      const message = err?.message || 'Failed to update concept progress';
      console.error('Update concept progress failed:', err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [portfolio]);
  
  return {
    addConcept,
    updateConceptProgress,
    loading,
    error
  };
}

export { PortfolioService };