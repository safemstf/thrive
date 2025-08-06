// src/hooks/useGalleryApi.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { api, APIError } from '@/lib/api-client';

import {
  GalleryPiece,
  GalleryQueryParams,
  GalleryStats,
  GalleryVisibility,
} from '@/types/gallery.types';

// Updated query keys factory for gallery
export const galleryQueryKeys = {
  all: ['gallery'] as const,
  pieces: {
    all: ['gallery', 'pieces'] as const,
    my: () => [...galleryQueryKeys.pieces.all, 'my'] as const,
    byUsername: (username: string, page?: number, limit?: number) => 
      [...galleryQueryKeys.pieces.all, 'username', username, page, limit] as const,
    detail: (id: string) => [...galleryQueryKeys.pieces.all, 'detail', id] as const,
  },
  stats: ['gallery', 'stats'] as const,
};

// ==================== UPDATED HOOKS ====================

// Get my gallery pieces
export function useMyGalleryPieces(
  options?: UseQueryOptions<GalleryPiece[], APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.pieces.my(),
    queryFn: () => api.portfolio.gallery.get(),
    ...options,
  });
}

// Get gallery pieces by username (public view)
export function useGalleryPiecesByUsername(
  username: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<any, APIError> // Adjust type based on API response
) {
  return useQuery({
    queryKey: galleryQueryKeys.pieces.byUsername(username, page, limit),
    queryFn: () => api.portfolio.gallery.getByUsername(username, page, limit),
    enabled: !!username,
    ...options,
  });
}

// Get gallery stats - Updated to match actual API response
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
    queryKey: galleryQueryKeys.stats,
    queryFn: () => api.portfolio.gallery.getStats(),
    ...options,
  });
}

// ==================== MUTATION HOOKS ====================

// Add gallery piece
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
    onSuccess: (data) => {
      // Invalidate my gallery pieces list
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
      // Update stats
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.stats });
      // Optionally set the new piece in cache
      queryClient.setQueryData(galleryQueryKeys.pieces.detail(data.id), data);
    },
    ...options,
  });
}

// Update gallery piece
export function useUpdateGalleryPiece(
  options?: UseMutationOptions<
    GalleryPiece,
    APIError,
    { pieceId: string; updates: Partial<GalleryPiece> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pieceId, updates }) => api.portfolio.gallery.update(pieceId, updates),
    onSuccess: (data, { pieceId }) => {
      // Update the specific piece in cache
      queryClient.setQueryData(galleryQueryKeys.pieces.detail(pieceId), data);
      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
    },
    ...options,
  });
}

// Delete single gallery piece - Updated return type
export function useDeleteGalleryPiece(
  options?: UseMutationOptions<{ message: string; id: string; }, APIError, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pieceId) => api.portfolio.gallery.delete(pieceId),
    onSuccess: (_data, pieceId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: galleryQueryKeys.pieces.detail(pieceId) });
      // Refresh lists and stats
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.stats });
    },
    ...options,
  });
}

// Batch delete gallery pieces - Updated return type
export function useBatchDeleteGalleryPieces(
  options?: UseMutationOptions<{ message: string; deletedCount: number; }, APIError, string[]>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pieceIds) => api.portfolio.gallery.batchDelete(pieceIds),
    onSuccess: (_data, pieceIds) => {
      // Remove all deleted pieces from cache
      pieceIds.forEach(id => {
        queryClient.removeQueries({ queryKey: galleryQueryKeys.pieces.detail(id) });
      });
      // Refresh lists and stats
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.stats });
    },
    ...options,
  });
}

// Batch update visibility - Updated return type
export function useBatchUpdateGalleryVisibility(
  options?: UseMutationOptions<{ message: string; updatedCount: number; }, APIError, { pieceIds: string[]; visibility: GalleryVisibility }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pieceIds, visibility }) => 
      api.portfolio.gallery.batchUpdateVisibility(pieceIds, visibility),
    onSuccess: (_data, { pieceIds }) => {
      // Invalidate affected pieces and lists
      pieceIds.forEach(id => {
        queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.detail(id) });
      });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
    },
    ...options,
  });
}

// ==================== PREFETCH UTILITIES ====================

export const prefetchMyGalleryPieces = async (queryClient: any) => {
  await queryClient.prefetchQuery({
    queryKey: galleryQueryKeys.pieces.my(),
    queryFn: () => api.portfolio.gallery.get(),
  });
};

export const prefetchGalleryPiecesByUsername = async (
  queryClient: any, 
  username: string, 
  page?: number, 
  limit?: number
) => {
  await queryClient.prefetchQuery({
    queryKey: galleryQueryKeys.pieces.byUsername(username, page, limit),
    queryFn: () => api.portfolio.gallery.getByUsername(username, page, limit),
  });
};

export const prefetchGalleryStats = async (queryClient: any) => {
  await queryClient.prefetchQuery({
    queryKey: galleryQueryKeys.stats,
    queryFn: () => api.portfolio.gallery.getStats(),
  });
};

// ==================== OPTIMISTIC UPDATE UTILITIES ====================

export function useOptimisticGalleryUpdate() {
  const queryClient = useQueryClient();

  return {
    // Optimistically update a piece in the list
    updatePieceOptimistically: (pieceId: string, updates: Partial<GalleryPiece>) => {
      queryClient.setQueryData<GalleryPiece[]>(galleryQueryKeys.pieces.my(), (old) => {
        if (!old) return old;
        return old.map(piece => piece.id === pieceId ? { ...piece, ...updates } : piece);
      });
    },

    // Optimistically add a piece to the list
    addPieceToListOptimistically: (piece: GalleryPiece) => {
      queryClient.setQueryData<GalleryPiece[]>(galleryQueryKeys.pieces.my(), (old) => {
        if (!old) return [piece];
        return [piece, ...old];
      });
    },

    // Optimistically remove a piece from the list
    removePieceFromListOptimistically: (pieceId: string) => {
      queryClient.setQueryData<GalleryPiece[]>(galleryQueryKeys.pieces.my(), (old) => {
        if (!old) return old;
        return old.filter(piece => piece.id !== pieceId);
      });
    },

    // Optimistically remove multiple pieces
    removePiecesFromListOptimistically: (pieceIds: string[]) => {
      queryClient.setQueryData<GalleryPiece[]>(galleryQueryKeys.pieces.my(), (old) => {
        if (!old) return old;
        return old.filter(piece => !pieceIds.includes(piece.id));
      });
    },
  };
}

// ==================== LEGACY HOOKS (DEPRECATED) ====================
// These are marked as deprecated to help with migration

/**
 * @deprecated Use useMyGalleryPieces() instead
 */
export const useGalleryPieces = useMyGalleryPieces;

/**
 * @deprecated Collections are no longer separate entities. Use gallery pieces with category filtering.
 */
export function useGalleryCollections() {
  console.warn('useGalleryCollections is deprecated. Use gallery pieces with category filtering instead.');
  return { data: [], isLoading: false, error: null };
}

/**
 * @deprecated Artists are no longer separate entities. Use portfolio discovery instead.
 */
export function useArtists() {
  console.warn('useArtists is deprecated. Use portfolio discovery instead.');
  return { data: [], isLoading: false, error: null };
}