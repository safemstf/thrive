// src\hooks\usePortfolioQueries.ts - Fixed to match your API structure
import type { PortfolioStats } from '@/lib/api/portfolio-api-client';
import { ConceptProgress } from '@/types/educational.types';
import type { GalleryPiece, GalleryVisibility } from '@/types/gallery.types';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';
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

// ==================== Query Keys Factory ====================
export const portfolioQueryKeys = {
  all: ['portfolio'] as const,
  portfolios: () => [...portfolioQueryKeys.all, 'portfolios'] as const,
  portfolio: (id: string) => [...portfolioQueryKeys.all, 'portfolio', id] as const,
  portfolioByUser: (userId: string) => [...portfolioQueryKeys.all, 'user', userId] as const,
  portfolioByUsername: (username: string) => [...portfolioQueryKeys.all, 'username', username] as const,
  myPortfolio: () => [...portfolioQueryKeys.all, 'me'] as const,
  discover: (filters: PortfolioFilters) => [...portfolioQueryKeys.all, 'discover', filters] as const,
  search: (query: string) => [...portfolioQueryKeys.all, 'search', query] as const,
  featured: () => [...portfolioQueryKeys.all, 'featured'] as const,
  trending: (period: string) => [...portfolioQueryKeys.all, 'trending', period] as const,
  saved: () => [...portfolioQueryKeys.all, 'saved'] as const,
  reviews: (portfolioId: string) => [...portfolioQueryKeys.all, 'reviews', portfolioId] as const,
  analytics: (portfolioId: string, period: string) =>
    [...portfolioQueryKeys.all, 'analytics', portfolioId, period] as const,
  views: (portfolioId: string) => [...portfolioQueryKeys.all, 'views', portfolioId] as const,
  shareLinks: (portfolioId: string) => [...portfolioQueryKeys.all, 'shares', portfolioId] as const,
};

// ==================== Core Portfolio Queries ====================

// Fixed: Use correct API method name
export function useMyPortfolio(
  options?: UseQueryOptions<Portfolio | null, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.myPortfolio(),
    queryFn: () => api.portfolio.get(), // Fixed: was getMyPortfolio()
    ...options,
  });
}

export function usePortfolioByUsername(
  username: string,
  options?: UseQueryOptions<Portfolio, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.portfolioByUsername(username),
    queryFn: () => api.portfolio.getByUsername(username),
    enabled: !!username,
    ...options,
  });
}

// Legacy methods - these may not work if the API doesn't have them
export function usePortfolio(
  id: string,
  options?: UseQueryOptions<Portfolio, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.portfolio(id),
    queryFn: () => api.portfolio.getById(id), // This might not exist in your API
    enabled: !!id,
    ...options,
  });
}

export function usePortfolioByUserId(
  userId: string,
  options?: UseQueryOptions<Portfolio, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.portfolioByUser(userId),
    queryFn: () => api.portfolio.getByUserId(userId), // This might not exist in your API
    enabled: !!userId,
    ...options,
  });
}

// ==================== Discovery Queries ====================
export function useDiscoverPortfolios(
  filters: PortfolioFilters = {},
  page: number = 1,
  limit: number = 20,
  options?: UseQueryOptions<PortfolioListResponse, APIError>
) {
  return useQuery({
    queryKey: [...portfolioQueryKeys.discover(filters), 'page', page, 'limit', limit], // Fixed: don't put page in filters
    queryFn: () => api.portfolio.discover(filters, page, limit),
    ...options,
  });
}

// ==================== Portfolio Stats ====================
export function usePortfolioStats(
  options?: UseQueryOptions<any, APIError> // Type might need adjustment based on actual API response
) {
  return useQuery({
    queryKey: [...portfolioQueryKeys.all, 'stats'],
    queryFn: () => api.portfolio.getStats(),
    ...options,
  });
}

// ==================== Portfolio CRUD Mutations ====================

export function useCreatePortfolio(
  options?: UseMutationOptions<Portfolio, APIError, CreatePortfolioDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.portfolio.create,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.all });
      queryClient.setQueryData(portfolioQueryKeys.myPortfolio(), data);
    },
    ...options,
  });
}

export function useUpdatePortfolio(
  options?: UseMutationOptions<Portfolio, APIError, UpdatePortfolioDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePortfolioDto) => api.portfolio.update(data), // Fixed: no ID parameter
    onSuccess: (data) => {
      queryClient.setQueryData(portfolioQueryKeys.myPortfolio(), data);
      queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.all });
    },
    ...options,
  });
}

export function useDeletePortfolio(
  options?: UseMutationOptions<void, APIError, boolean>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deleteGalleryPieces: boolean = false) => api.portfolio.delete(deleteGalleryPieces),
    onSuccess: () => {
      queryClient.setQueryData(portfolioQueryKeys.myPortfolio(), null);
      queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.all });
    },
    ...options,
  });
}

// ==================== Gallery Management ====================

export function useMyGalleryPieces(
  options?: UseQueryOptions<GalleryPiece[], APIError>
) {
  return useQuery({
    queryKey: [...portfolioQueryKeys.all, 'myGallery'],
    queryFn: () => api.portfolio.gallery.get(),
    ...options,
  });
}

export function usePortfolioGalleryByUsername(
  username: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<any, APIError> // Type depends on API response format
) {
  return useQuery({
    queryKey: [...portfolioQueryKeys.all, 'gallery', username, page, limit],
    queryFn: () => api.portfolio.gallery.getByUsername(username, page, limit),
    enabled: !!username,
    ...options,
  });
}

export function useGalleryStats(
  options?: UseQueryOptions<{
    totalPieces: number;
    publicPieces: number;
    privatePieces: number;
    unlistedPieces: number;
    categories: Record<string, number>;
    recentUploads: number;
  }, APIError>
) {
  return useQuery({
    queryKey: [...portfolioQueryKeys.all, 'galleryStats'],
    queryFn: () => api.portfolio.gallery.getStats(),
    ...options,
  });
}

// ==================== Gallery Mutations ====================

export function useAddGalleryPiece(
  options?: UseMutationOptions<
    GalleryPiece,
    APIError,
    {
      title: string;
      description?: string;
      imageUrl: string;
      category?: string;
      medium?: string;
      tags?: string[];
      visibility?: GalleryVisibility;
      year?: number;
      displayOrder?: number;
    }
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pieceData) => api.portfolio.gallery.add(pieceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'myGallery'] });
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'galleryStats'] });
    },
    ...options,
  });
}

export function useUpdateGalleryPiece(
  options?: UseMutationOptions<GalleryPiece, APIError, { pieceId: string; updates: Partial<GalleryPiece> }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pieceId, updates }) => api.portfolio.gallery.update(pieceId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'myGallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
    ...options,
  });
}

export function useDeleteGalleryPiece(
  options?: UseMutationOptions<{ message: string; id: string; }, APIError, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pieceId: string) => api.portfolio.gallery.delete(pieceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'myGallery'] });
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'galleryStats'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
    ...options,
  });
}

export function useBatchDeleteGalleryPieces(
  options?: UseMutationOptions<{ message: string; deletedCount: number; }, APIError, string[]>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pieceIds: string[]) => api.portfolio.gallery.batchDelete(pieceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'myGallery'] });
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'galleryStats'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
    ...options,
  });
}

export function useBatchUpdateGalleryVisibility(
  options?: UseMutationOptions<
    { message: string; updatedCount: number; },
    APIError,
    { pieceIds: string[]; visibility: GalleryVisibility }
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pieceIds, visibility }) => 
      api.portfolio.gallery.batchUpdateVisibility(pieceIds, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'myGallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
    ...options,
  });
}

// ==================== Concept Management ====================

export function useMyConcepts(
  options?: UseQueryOptions<{
    concepts: ConceptProgress[];
    portfolio: {
      id: string;
      kind: any; // PortfolioKind type
      totalConcepts: number;
      completedConcepts: number;
    };
  }, APIError>
) {
  return useQuery({
    queryKey: [...portfolioQueryKeys.all, 'concepts'],
    queryFn: () => api.portfolio.concepts.get(),
    ...options,
  });
}

export function useAddConceptToPortfolio(
  options?: UseMutationOptions<
    { message: string; conceptProgress: ConceptProgress; }, 
    APIError, 
    { 
      conceptId: string; 
      data?: { 
        status?: string; 
        startedAt?: string;
        notes?: string;
        score?: number;
      } 
    }
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conceptId, data = {} }) => api.portfolio.concepts.add(conceptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'concepts'] });
    },
    ...options,
  });
}

export function useUpdateConceptProgress(
  options?: UseMutationOptions<
    { message: string; conceptProgress: ConceptProgress; }, 
    APIError, 
    { 
      conceptId: string; 
      data?: { 
        status?: string; 
        score?: number;
        notes?: string;
        completedAt?: string;
      } 
    }
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conceptId, data = {} }) => api.portfolio.concepts.updateProgress(conceptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'concepts'] });
    },
    ...options,
  });
}

// ==================== Analytics ====================

export function usePortfolioAnalytics(
  period?: string,
  options?: UseQueryOptions<any, APIError> // Type depends on actual API response
) {
  return useQuery({
    queryKey: [...portfolioQueryKeys.all, 'analytics', period],
    queryFn: () => api.portfolio.analytics.get(period),
    ...options,
  });
}

export function usePortfolioDashboard(
  options?: UseQueryOptions<any, APIError> // Type depends on actual API response
) {
  return useQuery({
    queryKey: [...portfolioQueryKeys.all, 'dashboard'],
    queryFn: () => api.portfolio.analytics.dashboard(),
    ...options,
  });
}

export function useTrackPortfolioView(
  options?: UseMutationOptions<
    { message: string; totalViews: number; }, 
    APIError, 
    { portfolioId: string; data?: { referrer?: string; duration?: number } }
  >
) {
  return useMutation({
    mutationFn: ({ portfolioId, data }) => api.portfolio.analytics.trackView(portfolioId, data),
    ...options,
  });
}

// ==================== Image Upload ====================

export function useUploadPortfolioImage(
  options?: UseMutationOptions<{ url: string }, APIError, { file: File; type: 'profile' | 'cover' }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, type }) => api.portfolio.images.upload(file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.myPortfolio() });
    },
    ...options,
  });
}

// ==================== Utility Hooks ====================

export function useHasPortfolio() {
  const { data: portfolio, isLoading } = useMyPortfolio();
  
  return {
    hasPortfolio: portfolio !== null && portfolio !== undefined,
    isLoading,
    portfolio
  };
}

export function usePortfolioCheck(
  options?: UseQueryOptions<boolean, APIError>
) {
  return useQuery({
    queryKey: [...portfolioQueryKeys.all, 'check'],
    queryFn: () => api.portfolio.check(),
    ...options,
  });
}

// ==================== DEPRECATED HOOKS ====================
// These hooks may not work with your current API but are kept for backward compatibility

/**
 * @deprecated - These methods may not exist in your streamlined API
 */
export function useSearchPortfolios(
  query: string,
  limit?: number,
  options?: UseQueryOptions<Portfolio[], APIError>
) {
  console.warn('useSearchPortfolios: This hook may not work with the current API structure');
  return useQuery({
    queryKey: portfolioQueryKeys.search(query),
    queryFn: () => {
      // This method might not exist in your API
      throw new Error('Search portfolios method not implemented');
    },
    enabled: false, // Disabled by default
    ...options,
  });
}

/**
 * @deprecated - These methods may not exist in your streamlined API
 */
export function useFeaturedPortfolios(
  limit?: number,
  options?: UseQueryOptions<Portfolio[], APIError>
) {
  console.warn('useFeaturedPortfolios: This hook may not work with the current API structure');
  return useQuery({
    queryKey: portfolioQueryKeys.featured(),
    queryFn: () => {
      // This method might not exist in your API
      throw new Error('Featured portfolios method not implemented');
    },
    enabled: false, // Disabled by default
    ...options,
  });
}

/**
 * @deprecated - These methods may not exist in your streamlined API
 */
export function useTrendingPortfolios(
  period: 'day' | 'week' | 'month' = 'week',
  options?: UseQueryOptions<Portfolio[], APIError>
) {
  console.warn('useTrendingPortfolios: This hook may not work with the current API structure');
  return useQuery({
    queryKey: portfolioQueryKeys.trending(period),
    queryFn: () => {
      // This method might not exist in your API
      throw new Error('Trending portfolios method not implemented');
    },
    enabled: false, // Disabled by default
    ...options,
  });
}

export default {
  // Core queries
  useMyPortfolio,
  usePortfolioByUsername,
  useDiscoverPortfolios,
  usePortfolioStats,
  
  // CRUD mutations
  useCreatePortfolio,
  useUpdatePortfolio,
  useDeletePortfolio,
  
  // Gallery
  useMyGalleryPieces,
  usePortfolioGalleryByUsername,
  useGalleryStats,
  useAddGalleryPiece,
  useUpdateGalleryPiece,
  useDeleteGalleryPiece,
  useBatchDeleteGalleryPieces,
  useBatchUpdateGalleryVisibility,
  
  // Concepts
  useMyConcepts,
  useAddConceptToPortfolio,
  useUpdateConceptProgress,
  
  // Analytics
  usePortfolioAnalytics,
  usePortfolioDashboard,
  useTrackPortfolioView,
  
  // Images
  useUploadPortfolioImage,
  
  // Utility
  useHasPortfolio,
  usePortfolioCheck,
};