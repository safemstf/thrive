// src/hooks/useGalleryApi.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { api, APIError } from '@/lib/api-client';

import {
  GalleryPiece,
  GalleryApiResponse,
  GalleryQueryParams,
  GalleryCollection,
  Artist,
  GalleryStats,
  ArtworkCategory,
  ArtworkStatus,
} from '@/types/gallery.types';

// Query keys factory for gallery
export const galleryQueryKeys = {
  all: ['gallery'] as const,
  pieces: {
    all: ['gallery', 'pieces'] as const,
    lists: () => [...galleryQueryKeys.pieces.all, 'list'] as const,
    list: (params?: GalleryQueryParams) => [...galleryQueryKeys.pieces.lists(), params] as const,
    details: () => [...galleryQueryKeys.pieces.all, 'detail'] as const,
    detail: (id: string) => [...galleryQueryKeys.pieces.details(), id] as const,
    byCategory: (category: ArtworkCategory) => [...galleryQueryKeys.pieces.all, 'category', category] as const,
    featured: (limit?: number) => [...galleryQueryKeys.pieces.all, 'featured', limit] as const,
  },
  collections: {
    all: ['gallery', 'collections'] as const,
    lists: () => [...galleryQueryKeys.collections.all, 'list'] as const,
    detail: (id: string) => [...galleryQueryKeys.collections.all, id] as const,
  },
  artists: {
    all: ['gallery', 'artists'] as const,
    lists: () => [...galleryQueryKeys.artists.all, 'list'] as const,
    detail: (id: string) => [...galleryQueryKeys.artists.all, id] as const,
    pieces: (artistId: string) => [...galleryQueryKeys.artists.all, artistId, 'pieces'] as const,
  },
  stats: ['gallery', 'stats'] as const,
};

// Gallery pieces hooks
export function useGalleryPieces(
  params?: GalleryQueryParams,
  options?: UseQueryOptions<GalleryApiResponse, APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.pieces.list(params),
    queryFn: () => api.gallery.getPieces(params),
    ...options,
  });
}

export function useGalleryPiece(
  id: string,
  options?: UseQueryOptions<GalleryPiece, APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.pieces.detail(id),
    queryFn: () => api.gallery.getPieceById(id),
    enabled: !!id,
    ...options,
  });
}

export function useGalleryPiecesByCategory(
  category: ArtworkCategory,
  options?: UseQueryOptions<GalleryPiece[], APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.pieces.byCategory(category),
    queryFn: () => api.gallery.getByCategory(category),
    ...options,
  });
}

export function useFeaturedPieces(
  limit?: number,
  options?: UseQueryOptions<GalleryPiece[], APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.pieces.featured(limit),
    queryFn: () => api.gallery.getFeatured(limit),
    ...options,
  });
}

// Collections hooks
export function useGalleryCollections(
  options?: UseQueryOptions<GalleryCollection[], APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.collections.lists(),
    queryFn: () => api.collections.getAll(),
    ...options,
  });
}

export function useGalleryCollection(
  id: string,
  options?: UseQueryOptions<GalleryCollection, APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.collections.detail(id),
    queryFn: () => api.collections.getById(id),
    enabled: !!id,
    ...options,
  });
}

// Artists hooks
export function useArtists(
  options?: UseQueryOptions<Artist[], APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.artists.lists(),
    queryFn: () => api.artists.getAll(),
    ...options,
  });
}

export function useArtist(
  id: string,
  options?: UseQueryOptions<Artist, APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.artists.detail(id),
    queryFn: () => api.artists.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useArtistPieces(
  artistId: string,
  options?: UseQueryOptions<GalleryPiece[], APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.artists.pieces(artistId),
    queryFn: () => api.artists.getPieces(artistId),
    enabled: !!artistId,
    ...options,
  });
}

// Gallery stats hook
export function useGalleryStats(
  options?: UseQueryOptions<GalleryStats, APIError>
) {
  return useQuery({
    queryKey: galleryQueryKeys.stats,
    queryFn: () => api.gallery.getStats(),
    ...options,
  });
}

// Mutation hooks
export function useCreateGalleryPiece(
  options?: UseMutationOptions<
    GalleryPiece,
    APIError,
    Omit<GalleryPiece, 'id' | 'createdAt' | 'updatedAt'>
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.gallery.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.lists() });
      queryClient.setQueryData(galleryQueryKeys.pieces.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.stats });
    },
    ...options,
  });
}

export function useUpdateGalleryPiece(
  options?: UseMutationOptions<
    GalleryPiece,
    APIError,
    { id: string; updates: Partial<GalleryPiece> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => api.gallery.update(id, updates),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(galleryQueryKeys.pieces.detail(id), data);
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.lists() });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.all });
    },
    ...options,
  });
}

export function useDeleteGalleryPiece(
  options?: UseMutationOptions<void, APIError, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.gallery.delete,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: galleryQueryKeys.pieces.detail(id) });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.lists() });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.stats });
    },
    ...options,
  });
}

// Image upload mutation
export function useUploadGalleryImage(
  options?: UseMutationOptions<
    { url: string; thumbnailUrl?: string },
    APIError,
    { file: File; metadata?: Record<string, any> }
  >
) {
  return useMutation({
    mutationFn: ({ file, metadata }) => api.gallery.uploadImage(file, metadata),
    ...options,
  });
}

// Prefetch utilities
export const prefetchGalleryPiece = async (queryClient: any, id: string) => {
  await queryClient.prefetchQuery({
    queryKey: galleryQueryKeys.pieces.detail(id),
    queryFn: () => api.gallery.getPieceById(id),
  });
};

export const prefetchGalleryPieces = async (queryClient: any, params?: GalleryQueryParams) => {
  await queryClient.prefetchQuery({
    queryKey: galleryQueryKeys.pieces.list(params),
    queryFn: () => api.gallery.getPieces(params),
  });
};

export const prefetchFeaturedPieces = async (queryClient: any, limit?: number) => {
  await queryClient.prefetchQuery({
    queryKey: galleryQueryKeys.pieces.featured(limit),
    queryFn: () => api.gallery.getFeatured(limit),
  });
};

// Infinite query hook for gallery pieces (for infinite scroll)
import type { QueryFunctionContext } from '@tanstack/react-query';

export function useInfiniteGalleryPieces(
  baseParams?: Omit<GalleryQueryParams, 'page'>,
  options?: Omit<
    UseInfiniteQueryOptions<GalleryApiResponse, APIError>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) {
  return useInfiniteQuery({
    // keep key consistent
    queryKey: galleryQueryKeys.pieces.list(baseParams),
    queryFn: (context: QueryFunctionContext) => {
      const page = typeof context.pageParam === 'number' ? context.pageParam : 1;
      return api.gallery.getPieces({ ...baseParams, page });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    ...options,
  });
}

// Optimistic update utilities
export function useOptimisticGalleryUpdate() {
  const queryClient = useQueryClient();

  return {
    updatePieceOptimistically: (id: string, updates: Partial<GalleryPiece>) => {
      queryClient.setQueryData<GalleryPiece>(galleryQueryKeys.pieces.detail(id), (old) =>
        old ? { ...old, ...updates } : old
      );
    },
    addPieceToListsOptimistically: (piece: GalleryPiece) => {
      queryClient.setQueriesData<GalleryApiResponse>({ queryKey: galleryQueryKeys.pieces.lists() }, (old) =>
        old ? { ...old, pieces: [piece, ...old.pieces], total: old.total + 1 } : old
      );
    },
    removePieceFromListsOptimistically: (id: string) => {
      queryClient.setQueriesData<GalleryApiResponse>({ queryKey: galleryQueryKeys.pieces.lists() }, (old) =>
        old ? { ...old, pieces: old.pieces.filter((p) => p.id !== id), total: old.total - 1 } : old
      );
    },
  };
}
