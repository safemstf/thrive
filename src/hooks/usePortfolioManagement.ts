// src/hooks/usePortfolioManagement.ts - Fixed to work with your API structure
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import type { Portfolio, CreatePortfolioDto, UpdatePortfolioDto } from '@/types/portfolio.types';
import type { GalleryPiece } from '@/types/gallery.types';

// Simplified create input that matches your API structure
type CreatePortfolioInput = {
  title: string;
  bio?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  kind?: 'creative' | 'educational' | 'professional' | 'hybrid';
  specializations?: string[];
  tags?: string[];
  location?: string;
};

export function usePortfolioManagement() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch portfolio with better error handling for your API structure
  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const portfolioData = await api.portfolio.get();
      setPortfolio(portfolioData);
    } catch (err: any) {
      console.error('Failed to fetch portfolio:', err);
      
      // Handle different error types
      if (err.status === 404 || err.message?.includes('404') || err.message?.includes('not found')) {
        // No portfolio exists - this is normal, not an error
        setPortfolio(null);
        setError(null);
      } else if (err.status === 401 || err.message?.includes('unauthorized')) {
        setError('Please log in to view your portfolio');
      } else if (err.status >= 500) {
        setError('Server error - please try again later');
      } else {
        setError(err.message || 'Failed to load portfolio');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load portfolio on mount
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const hasPortfolio = !!portfolio;

  // Create portfolio with proper validation and error handling
  const createPortfolio = useCallback(async (data: CreatePortfolioInput) => {
    if (!data.title?.trim()) {
      throw new Error('Portfolio title is required');
    }

    setIsCreating(true);
    setError(null);
    
    try {
      // Map your input to the proper DTO format
      const portfolioData: CreatePortfolioDto = {
        title: data.title.trim(),
        bio: data.bio || '',
        visibility: data.visibility || 'public',
        specializations: data.specializations || [],
        tags: data.tags || [],
        kind: data.kind || 'professional'  // Default to professional
      };

      console.log('Creating portfolio with data:', portfolioData);

      const newPortfolio = await api.portfolio.create(portfolioData);
      setPortfolio(newPortfolio);
      return newPortfolio;
    } catch (err: any) {
      console.error('Failed to create portfolio:', err);
      const errorMessage = err.message || 'Failed to create portfolio';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, []);

  // Update portfolio - Fixed to match API signature (only takes data, no ID)
  const updatePortfolio = useCallback(async (updates: Partial<Portfolio>) => {
    if (!portfolio) {
      const errorMsg = 'No portfolio to update - please create a portfolio first';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsUpdating(true);
    setError(null);

    try {
      const updateData: UpdatePortfolioDto = {
        title: updates.title ?? portfolio.title,
        bio: updates.bio ?? portfolio.bio,
        visibility: updates.visibility ?? portfolio.visibility,
        specializations: updates.specializations ?? (portfolio.specializations || []),
        tags: updates.tags ?? (portfolio.tags || []),
        location: updates.location ?? portfolio.location,
        // Add other fields that might be in UpdatePortfolioDto
        tagline: updates.tagline ?? portfolio.tagline,
        profileImage: updates.profileImage ?? portfolio.profileImage,
        coverImage: updates.coverImage ?? portfolio.coverImage,
        socialLinks: updates.socialLinks ?? portfolio.socialLinks,
        contactEmail: updates.contactEmail ?? portfolio.contactEmail,
        showContactInfo: updates.showContactInfo ?? portfolio.showContactInfo,
        customUrl: updates.customUrl ?? portfolio.customUrl,
        featuredPieces: updates.featuredPieces ?? portfolio.featuredPieces,
        kind: updates.kind ?? portfolio.kind
      };

      // Fixed: API only takes data parameter, not ID
      const updatedPortfolio = await api.portfolio.update(updateData);
      setPortfolio(updatedPortfolio);
      return updatedPortfolio;
    } catch (err: any) {
      console.error('Failed to update portfolio:', err);
      const errorMessage = err.message || 'Failed to update portfolio';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [portfolio]);

  // Delete portfolio - Fixed to use correct API method
  const deletePortfolio = useCallback(async (deleteGalleryPieces: boolean = false) => {
    if (!portfolio) {
      throw new Error('No portfolio to delete');
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Fixed: Use the correct API method name
      await api.portfolio.delete(deleteGalleryPieces);
      setPortfolio(null);
    } catch (err: any) {
      console.error('Failed to delete portfolio:', err);
      const errorMessage = err.message || 'Failed to delete portfolio';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [portfolio]);

  // Refresh portfolio
  const refreshPortfolio = useCallback(() => {
    return fetchPortfolio();
  }, [fetchPortfolio]);

  // Gallery-related state
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const fetchGalleryPieces = useCallback(async () => {
    if (!hasPortfolio) return;
    
    try {
      setGalleryLoading(true);
      // Fixed: Use the correct API method name
      const pieces = await api.portfolio.gallery.get();
      setGalleryPieces(pieces);
    } catch (err) {
      console.error('Failed to fetch gallery pieces:', err);
      // Don't set error for gallery pieces failure
    } finally {
      setGalleryLoading(false);
    }
  }, [hasPortfolio]);

  useEffect(() => {
    if (portfolio) {
      fetchGalleryPieces();
    }
  }, [portfolio, fetchGalleryPieces]);

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

    // Gallery data
    galleryPieces,
    galleryLoading,
    refreshGallery: fetchGalleryPieces,

    // Direct API access for advanced use cases
    api: api.portfolio,
  };
}

export default usePortfolioManagement;