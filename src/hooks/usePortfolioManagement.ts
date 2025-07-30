// hooks/usePortfolioManagement.ts - Fixed to work with your API structure

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import type { Portfolio, CreatePortfolioDto, UpdatePortfolioDto } from '@/types/portfolio.types';
import type { GalleryPiece } from '@/types/gallery.types';

// Updated to match the PortfolioCreation component
type CreatePortfolioInput = {
  title: string;
  tagline?: string;
  bio?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  specializations?: string[];
  tags?: string[];
  kind?: 'creative' | 'educational' | 'professional' | 'hybrid'; // Removed 'undefined'
};

/**
 * Portfolio management hook that works with your existing API client
 */
export function usePortfolioManagement() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch portfolio on mount
  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const portfolioData = await api.portfolio.getMyPortfolio();
      setPortfolio(portfolioData);
    } catch (err: any) {
      console.error('Failed to fetch portfolio:', err);
      if (err.status === 404) {
        // No portfolio found - this is okay
        setPortfolio(null);
      } else {
        setError(err.message || 'Failed to load portfolio');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const hasPortfolio = !!portfolio;

  const getPortfolioTypeConfig = useCallback((type?: string) => {
    return api.portfolio.getPortfolioTypeConfig(type ?? portfolio?.kind ?? 'creative');
  }, [portfolio?.kind]);

  const createPortfolio = useCallback(async (data: CreatePortfolioInput) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const portfolioData: CreatePortfolioDto = {
        title: data.title,
        tagline: data.tagline,
        bio: data.bio ?? '',
        visibility: data.visibility ?? 'public',
        specializations: data.specializations ?? [],
        tags: data.tags ?? [],
        // Add kind if your API supports it
        ...(data.kind && { kind: data.kind })
      };
      
      const newPortfolio = await api.portfolio.create(portfolioData);
      setPortfolio(newPortfolio);
      return newPortfolio;
    } catch (err: any) {
      console.error('Failed to create portfolio:', err);
      setError(err.message || 'Failed to create portfolio');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updatePortfolio = useCallback(async (updates: Partial<Portfolio>) => {
    if (!portfolio?.id) {
      const errorMsg = 'No portfolio to update - please create a portfolio first';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsUpdating(true);
    setError(null);

    try {
      const updateData: UpdatePortfolioDto = {
        title: updates.title ?? portfolio.title,
        tagline: updates.tagline ?? portfolio.tagline,
        bio: updates.bio ?? portfolio.bio,
        visibility: updates.visibility ?? portfolio.visibility,
        specializations: updates.specializations ?? portfolio.specializations,
        tags: updates.tags ?? portfolio.tags,
        location: updates.location ?? portfolio.location ?? '',
        // Add kind update if supported
        ...(updates.kind && { kind: updates.kind })
      };

      const updatedPortfolio = await api.portfolio.update(portfolio.id, updateData);
      setPortfolio(updatedPortfolio);
      return updatedPortfolio;
    } catch (err: any) {
      console.error('Failed to update portfolio:', err);
      setError(err.message || 'Failed to update portfolio');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [portfolio]);

  const deletePortfolio = useCallback(async (deleteGalleryPieces: boolean = false) => {
    if (!portfolio) {
      throw new Error('No portfolio to delete');
    }

    setIsDeleting(true);
    setError(null);

    try {
      await api.portfolio.deleteMyPortfolio(deleteGalleryPieces);
      setPortfolio(null);
    } catch (err: any) {
      console.error('Failed to delete portfolio:', err);
      setError(err.message || 'Failed to delete portfolio');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [portfolio]);

  const refreshPortfolio = useCallback(() => {
    return fetchPortfolio();
  }, [fetchPortfolio]);

  // Check if portfolio has creative capabilities
  const hasCreativeCapability = portfolio?.kind === 'creative' || portfolio?.kind === 'hybrid';

  // Check if portfolio has educational capabilities  
  const hasEducationalCapability = portfolio?.kind === 'educational' || portfolio?.kind === 'hybrid';

  // Gallery-related state (if needed)
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const fetchGalleryPieces = useCallback(async () => {
    if (!hasCreativeCapability) return;
    
    try {
      setGalleryLoading(true);
      const pieces = await api.portfolio.getMyGalleryPieces();
      setGalleryPieces(pieces);
    } catch (err) {
      console.error('Failed to fetch gallery pieces:', err);
    } finally {
      setGalleryLoading(false);
    }
  }, [hasCreativeCapability]);

  useEffect(() => {
    if (portfolio && hasCreativeCapability) {
      fetchGalleryPieces();
    }
  }, [portfolio, hasCreativeCapability, fetchGalleryPieces]);

  return {
    // Portfolio state
    portfolio,
    loading,
    error,
    hasPortfolio,

    // Portfolio operations
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    refreshPortfolio,

    // Mutation states
    isCreating,
    isUpdating,
    isDeleting,

    // Capabilities
    hasCreativeCapability,
    hasEducationalCapability,

    // Gallery data
    galleryPieces,
    galleryLoading,
    refreshGallery: fetchGalleryPieces,

    // Utilities
    getPortfolioTypeConfig,

    // Direct API access for advanced use cases
    api: api.portfolio,
  };
}

export default usePortfolioManagement;