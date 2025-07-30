// src/services/portfolioService.ts
import { useApiClient } from '@/lib/api-client';
import { useState, useEffect, useCallback } from 'react';
import type { Portfolio } from '@/types/portfolio.types';
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
  kind: 'creative' | 'educational' | 'hybrid';
  createdAt: string;
  updatedAt: string;
}

class PortfolioService {
  private static METADATA_KEY = 'portfolio_metadata';
  
  // Get portfolio metadata from localStorage
  static getMetadata(): PortfolioMetadata | null {
    try {
      const data = localStorage.getItem(this.METADATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  
  // Save portfolio metadata
  static saveMetadata(metadata: PortfolioMetadata): void {
    localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
  }
  
  // Clear portfolio metadata
  static clearMetadata(): void {
    localStorage.removeItem(this.METADATA_KEY);
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
  static getCapabilities(kind: 'creative' | 'educational' | 'hybrid') {
    return {
      gallery: kind === 'creative' || kind === 'hybrid',
      learning: kind === 'educational' || kind === 'hybrid',
      projects: true, // All portfolios can have projects
      tutoring: true  // All portfolios can offer tutoring
    };
  }
  
  // Create portfolio with type
  static async createPortfolioWithType(
    apiClient: any,
    data: any,
    kind: 'creative' | 'educational' | 'hybrid'
  ): Promise<EnhancedPortfolio> {
    // Create the portfolio with kind in the data
    const portfolioData = {
      ...data,
      kind // Include kind in the creation data
    };
    
    const portfolio = await apiClient.portfolio.create(portfolioData);
    
    // Save metadata for backup/sync
    const metadata: PortfolioMetadata = {
      portfolioId: portfolio.id,
      kind,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveMetadata(metadata);
    
    // Return enhanced portfolio
    return this.enhancePortfolio(portfolio)!;
  }
  
  // Update portfolio type
  static async updatePortfolioType(
    apiClient: any,
    portfolioId: string, 
    kind: 'creative' | 'educational' | 'hybrid'
  ): Promise<void> {
    // Update in backend
    await apiClient.portfolio.update(portfolioId, { kind });
    
    // Update local metadata
    const metadata = this.getMetadata();
    if (metadata && metadata.portfolioId === portfolioId) {
      this.saveMetadata({
        ...metadata,
        kind,
        updatedAt: new Date().toISOString()
      });
    }
  }
}

// Custom hook for portfolio management
export function usePortfolioManager() {
  const [portfolio, setPortfolio] = useState<EnhancedPortfolio | null>(null);
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();
  
  // Fetch portfolio and enhance it
  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get base portfolio
      const basePortfolio = await apiClient.portfolio.getMyPortfolio();
      
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
  }, [apiClient]);
  
  // Fetch gallery pieces with proper error handling
  const fetchGalleryPieces = useCallback(async (currentPortfolio: EnhancedPortfolio) => {
    if (!currentPortfolio?.capabilities.gallery) {
      setGalleryPieces([]);
      return;
    }

    try {
      console.log('Fetching gallery pieces for portfolio:', currentPortfolio.id);
      
      // Try the portfolio-specific endpoint first
      const pieces = await apiClient.portfolio.getMyGalleryPieces();
      
      if (Array.isArray(pieces)) {
        console.log(`Successfully fetched ${pieces.length} gallery pieces`);
        setGalleryPieces(pieces);
      } else {
        console.warn('Gallery pieces response is not an array:', pieces);
        setGalleryPieces([]);
      }
      
    } catch (err: any) {
      console.error('Failed to fetch gallery pieces:', err);
      
      // If the portfolio endpoint fails, try the general gallery endpoint
      // with user-specific filtering
      try {
        console.log('Trying fallback gallery endpoint...');
        const fallbackPieces = await apiClient.gallery.getPieces({ 
          artist: currentPortfolio.userId,
          limit: 100
        });
        
        if (Array.isArray(fallbackPieces)) {
          console.log(`Fallback fetch successful: ${fallbackPieces.length} pieces`);
          setGalleryPieces(fallbackPieces);
        } else {
          console.warn('Fallback response is not an array:', fallbackPieces);
          setGalleryPieces([]);
        }
        
      } catch (fallbackErr: any) {
        console.error('Fallback gallery fetch also failed:', fallbackErr);
        setGalleryPieces([]);
        
        // Only set error if it's not a "no data" situation
        if (fallbackErr?.status !== 404) {
          setError('Failed to load gallery pieces');
        }
      }
    }
  }, [apiClient]);
  
  // Create portfolio with type
  const createPortfolio = useCallback(async (
    data: any,
    kind: 'creative' | 'educational' | 'hybrid'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating portfolio:', { kind, title: data.title });
      
      const enhanced = await PortfolioService.createPortfolioWithType(
        apiClient,
        data,
        kind
      );
      
      setPortfolio(enhanced);
      
      // If it's a creative portfolio, initialize empty gallery
      if (enhanced.capabilities.gallery) {
        setGalleryPieces([]);
      }
      
      console.log('Portfolio created successfully:', enhanced.id);
      return enhanced;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create portfolio';
      console.error('Portfolio creation failed:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient]);
  
  // Update portfolio type
  const updatePortfolioType = useCallback(async (kind: 'creative' | 'educational' | 'hybrid') => {
    if (!portfolio) {
      throw new Error('No portfolio to update');
    }
    
    try {
      console.log('Updating portfolio type:', { from: portfolio.kind, to: kind });
      
      await PortfolioService.updatePortfolioType(apiClient, portfolio.id, kind);
      
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
  }, [portfolio, apiClient, fetchGalleryPieces]);
  
  // Delete portfolio and clear metadata
  const deletePortfolio = useCallback(async (deleteGalleryPieces = false) => {
    try {
      setLoading(true);
      console.log('Deleting portfolio:', { deleteGalleryPieces });
      
      await apiClient.portfolio.deleteMyPortfolio(deleteGalleryPieces);
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
  }, [apiClient]);
  
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

// Gallery-specific operations hook
export function useGalleryOperations(portfolio: EnhancedPortfolio | null) {
  const apiClient = useApiClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Upload image to gallery
  const uploadImage = useCallback(async (
    file: File,
    metadata?: {
      title?: string;
      description?: string;
      category?: string;
      tags?: string[];
      visibility?: 'public' | 'private' | 'unlisted';
    }
  ) => {
    if (!portfolio?.capabilities.gallery) {
      throw new Error('Portfolio does not support gallery features');
    }
    
    try {
      setUploading(true);
      setError(null);
      
      console.log('Uploading image:', { fileName: file.name, portfolioId: portfolio.id });
      
      // Create form data for the upload
      const formData = new FormData();
      formData.append('media', file);
      formData.append('title', metadata?.title || file.name);
      
      if (metadata?.description) {
        formData.append('description', metadata.description);
      }
      if (metadata?.category) {
        formData.append('category', metadata.category);
      }
      if (metadata?.tags) {
        formData.append('tags', JSON.stringify(metadata.tags));
      }
      if (metadata?.visibility) {
        formData.append('visibility', metadata.visibility);
      }
      
      // Upload using the correct API method
      const piece = await apiClient.gallery.uploadImage(file);
      
        console.log('Image uploaded successfully:', piece.url); 
      return piece;
      
    } catch (err: any) {
      const message = err?.message || 'Failed to upload image';
      console.error('Image upload failed:', err);
      setError(message);
      throw new Error(message);
    } finally {
      setUploading(false);
    }
  }, [portfolio, apiClient]);
  
  // Batch upload images
  const batchUpload = useCallback(async (
    uploads: Array<{
      file: File;
      title: string;
      description?: string;
      category?: string;
      tags?: string[];
      visibility?: 'public' | 'private' | 'unlisted';
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
  
  return {
    uploadImage,
    batchUpload,
    uploading,
    error
  };
}

export { PortfolioService };