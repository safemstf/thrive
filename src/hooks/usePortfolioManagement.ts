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

/** Small normalizer to handle ApiResponse<T> / { portfolio: T } / { data: T } / direct T */
function normalizeApi<T = any>(raw: any): T | null {
  if (raw == null) return null;
  if (typeof raw !== 'object') return (raw as unknown) as T;

  // ApiResponse<T> -> .data
  if ('data' in raw) return raw.data as T;

  // Some endpoints return { portfolio: T } or { galleryPieces: T[] } etc.
  const knownSingleKeys = ['portfolio', 'galleryPiece', 'item', 'result'];
  for (const k of knownSingleKeys) {
    if (k in raw) return (raw as any)[k] as T;
  }

  // Known plural keys (lists)
  const knownListKeys = ['galleryPieces', 'pieces', 'items', 'results', 'portfolios'];
  for (const k of knownListKeys) {
    if (k in raw) return (raw as any)[k] as T;
  }

  // If it looks like { success: boolean, ...payload } try to find the payload property
  if ('success' in raw) {
    const payloadKey = Object.keys(raw).find(k => !['success', 'message', 'error', 'code'].includes(k));
    if (payloadKey) return (raw as any)[payloadKey] as T;
  }

  // Default: assume raw is already the payload
  return raw as T;
}

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

      const raw = await api.portfolio.get();
      const payload = normalizeApi<Portfolio>(raw);
      setPortfolio(payload);
    } catch (err: any) {
      console.error('Failed to fetch portfolio:', err);

      // Handle different error types
      if (err && (err.status === 404 || String(err.message).includes('404') || String(err.message).toLowerCase().includes('not found'))) {
        // No portfolio exists - this is normal, not an error
        setPortfolio(null);
        setError(null);
      } else if (err && (err.status === 401 || String(err.message).toLowerCase().includes('unauthorized'))) {
        setError('Please log in to view your portfolio');
      } else if (err && err.status >= 500) {
        setError('Server error - please try again later');
      } else {
        setError(err?.message || 'Failed to load portfolio');
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
        visibility: (data.visibility as any) || 'public',
        specializations: data.specializations || [],
        tags: data.tags || [],
        kind: (data.kind as any) || 'professional' // Default to professional
      };

      console.log('Creating portfolio with data:', portfolioData);

      const raw = await api.portfolio.create(portfolioData);
      const newPortfolio = normalizeApi<Portfolio>(raw) ?? (raw as any);
      setPortfolio(newPortfolio);
      return newPortfolio;
    } catch (err: any) {
      console.error('Failed to create portfolio:', err);
      const errorMessage = err?.message || 'Failed to create portfolio';
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
        visibility: (updates.visibility ?? portfolio.visibility) as any,
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
        kind: (updates.kind ?? portfolio.kind) as any
      };

      // Fixed: API only takes data parameter, not ID
      const raw = await api.portfolio.update(updateData);
      const updatedPortfolio = normalizeApi<Portfolio>(raw) ?? (raw as any);
      setPortfolio(updatedPortfolio);
      return updatedPortfolio;
    } catch (err: any) {
      console.error('Failed to update portfolio:', err);
      const errorMessage = err?.message || 'Failed to update portfolio';
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
      const errorMessage = err?.message || 'Failed to delete portfolio';
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
      // Use the correct API method name and normalize the response
      const raw = await api.portfolio.gallery.get();
      
  const pieces =
    normalizeApi<GalleryPiece[]>(raw) ??
    (Array.isArray(raw) ? (raw as GalleryPiece[]) : (() => {
      if (raw && typeof raw === 'object') {
        // Prefer the typed property first
        if ('galleryPieces' in raw && Array.isArray((raw as any).galleryPieces)) {
          return (raw as any).galleryPieces as GalleryPiece[];
        }
        // Legacy alias `pieces`
        if ('pieces' in raw && Array.isArray((raw as any).pieces)) {
          return (raw as any).pieces as GalleryPiece[];
        }
        // ApiResponse-like `.data`
        if ('data' in raw && Array.isArray((raw as any).data)) {
          return (raw as any).data as GalleryPiece[];
        }
      }
      return [] as GalleryPiece[];
    })());      setGalleryPieces(pieces as GalleryPiece[]);
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
