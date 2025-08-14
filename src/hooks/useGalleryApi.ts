// src/hooks/useGalleryApi.ts
// Rewritten hooks for gallery endpoints with strong typing and response normalization

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { api, APIError } from '@/lib/api-client';

import type {
  GalleryPiece,
  GalleryQueryParams,
  GalleryStats,
  GalleryVisibility,
} from '@/types/gallery.types';

// --------------------- Query keys ---------------------
export const galleryQueryKeys = {
  all: ['gallery'] as const,
  pieces: {
    all: ['gallery', 'pieces'] as const,
    my: () => [...galleryQueryKeys.pieces.all, 'my'] as const,
    byUsername: (username: string, page: number = 1, limit: number = 20) =>
      [...galleryQueryKeys.pieces.all, 'username', username, 'page', page, 'limit', limit] as const,
    detail: (id: string) => [...galleryQueryKeys.pieces.all, 'detail', id] as const,
  },
  stats: ['gallery', 'stats'] as const,
};

// --------------------- Normalizer ---------------------

/**
 * Normalize API responses for gallery endpoints. Accepts:
 * - ApiResponse<T> with `.data`
 * - legacy shapes like `{ galleryPieces: T[] }`, `{ pieces: T[] }`
 * - direct payload T or T[]
 */
function normalizeApi<T = any>(raw: any): any {
  if (raw == null) return null;
  if (typeof raw === 'object') {
    if ('data' in raw) return raw.data;
    // legacy responses
    if ('galleryPieces' in raw) return raw.galleryPieces;
    if ('pieces' in raw) return raw.pieces;
    // single entity wrapper
    if ('galleryPiece' in raw) return raw.galleryPiece;
  }
  return raw;
}

// --------------------- READ HOOKS ---------------------

export function useMyGalleryPieces(
  options?: UseQueryOptions<GalleryPiece[], APIError>
) {
  return useQuery<GalleryPiece[], APIError>({
    queryKey: galleryQueryKeys.pieces.my(),
    queryFn: async () => {
      const raw = await api.portfolio.gallery.get();
      const normalized = normalizeApi<GalleryPiece[] | GalleryPiece | null>(raw);

      // If normalizeApi returned an array, return it
      if (Array.isArray(normalized)) return normalized as GalleryPiece[];

      // If it's a single item, wrap it
      if (normalized && typeof normalized === 'object') return [normalized as GalleryPiece];

      // Fallback: inspect raw object safely
      if (raw && typeof raw === 'object') {
        const anyRaw = raw as any;
        if (Array.isArray(anyRaw.galleryPieces)) return anyRaw.galleryPieces as GalleryPiece[];
        if (Array.isArray(anyRaw.pieces)) return anyRaw.pieces as GalleryPiece[];
        if (Array.isArray(anyRaw.data)) return anyRaw.data as GalleryPiece[];
      }

      return [] as GalleryPiece[];
    },
    ...options,
  });
}

export function useGalleryPiecesByUsername(
  username: string,
  params: { page?: number; limit?: number; filters?: GalleryQueryParams } = {},
  options?: UseQueryOptions<{ galleryPieces: GalleryPiece[]; pagination?: any; filters?: any }, APIError>
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  return useQuery<{ galleryPieces: GalleryPiece[]; pagination?: any; filters?: any }, APIError>({
    queryKey: galleryQueryKeys.pieces.byUsername(username, page, limit),
    queryFn: async () => {
      // Call API with the supported args (username, page, limit)
      const raw = await api.portfolio.gallery.getByUsername(username, page, limit);

      // normalize results
      const payload = normalizeApi<any>(raw) ?? raw ?? {};
      const anyPayload = payload as any;

      let galleryPieces: GalleryPiece[] = [];
      if (Array.isArray(anyPayload)) galleryPieces = anyPayload as GalleryPiece[];
      else if (Array.isArray(anyPayload.galleryPieces)) galleryPieces = anyPayload.galleryPieces as GalleryPiece[];
      else if (Array.isArray(anyPayload.pieces)) galleryPieces = anyPayload.pieces as GalleryPiece[];
      else if (Array.isArray(anyPayload.data)) galleryPieces = anyPayload.data as GalleryPiece[];

      const pagination = anyPayload.pagination ?? anyPayload.pageInfo ?? {};
      const filters = anyPayload.filters ?? params.filters ?? {};
      return { galleryPieces, pagination, filters };
    },
    enabled: !!username,
    ...options,
  });
}

export function useGalleryStats(
  options?: UseQueryOptions<GalleryStats, APIError>
) {
  return useQuery<GalleryStats, APIError>({
    queryKey: galleryQueryKeys.stats,
    queryFn: async () => {
      const raw = await api.portfolio.gallery.getStats();
      return normalizeApi<GalleryStats>(raw) as GalleryStats;
    },
    ...options,
  });
}

// --------------------- MUTATIONS ---------------------

export function useAddGalleryPiece(
  options?: UseMutationOptions<GalleryPiece, APIError, Partial<GalleryPiece>>
) {
  const queryClient = useQueryClient();
  return useMutation<GalleryPiece, APIError, Partial<GalleryPiece>>({
    mutationFn: async (pieceData) => {
      const raw = await api.portfolio.gallery.add(pieceData as any);
      const piece = normalizeApi<GalleryPiece>(raw) ?? (raw && (raw.galleryPiece ?? raw)) as GalleryPiece;
      return piece as GalleryPiece;
    },
    onSuccess: (data) => {
      // invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.stats });
      if (data && (data as any).id) {
        queryClient.setQueryData(galleryQueryKeys.pieces.detail((data as any).id), data);
      }
    },
    ...options,
  });
}

export function useUpdateGalleryPiece(
  options?: UseMutationOptions<GalleryPiece, APIError, { pieceId: string; updates: Partial<GalleryPiece> }>
) {
  const queryClient = useQueryClient();
  return useMutation<GalleryPiece, APIError, { pieceId: string; updates: Partial<GalleryPiece> }>({
    mutationFn: async ({ pieceId, updates }) => {
      const raw = await api.portfolio.gallery.update(pieceId, updates as any);
      const piece = normalizeApi<GalleryPiece>(raw) ?? (raw && (raw.galleryPiece ?? raw)) as GalleryPiece;
      return piece as GalleryPiece;
    },
    onSuccess: (data, { pieceId }) => {
      // update detail and refresh lists
      queryClient.setQueryData(galleryQueryKeys.pieces.detail(pieceId), data);
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
    },
    ...options,
  });
}

export function useDeleteGalleryPiece(
  options?: UseMutationOptions<{ message?: string; id?: string }, APIError, string>
) {
  const queryClient = useQueryClient();
  return useMutation<{ message?: string; id?: string }, APIError, string>({
    mutationFn: async (pieceId: string) => {
      const raw = await api.portfolio.gallery.delete(pieceId);
      const payload = normalizeApi<any>(raw) ?? raw;
      return { message: payload?.message ?? raw?.message, id: payload?.deletedPieceId ?? raw?.deletedPieceId ?? pieceId };
    },
    onSuccess: (_data, pieceId) => {
      queryClient.removeQueries({ queryKey: galleryQueryKeys.pieces.detail(pieceId) });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.stats });
    },
    ...options,
  });
}

export function useBatchDeleteGalleryPieces(
  options?: UseMutationOptions<{ message?: string; deletedCount: number }, APIError, string[]>
) {
  const queryClient = useQueryClient();
  return useMutation<{ message?: string; deletedCount: number }, APIError, string[]>({
    mutationFn: async (pieceIds: string[]) => {
      const raw = await api.portfolio.gallery.batchDelete(pieceIds);
      const payload = normalizeApi<any>(raw) ?? raw;
      return { message: payload?.message ?? raw?.message, deletedCount: payload?.deletedCount ?? raw?.deletedCount ?? 0 };
    },
    onSuccess: (_data, pieceIds) => {
      pieceIds.forEach(id => queryClient.removeQueries({ queryKey: galleryQueryKeys.pieces.detail(id) }));
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.stats });
    },
    ...options,
  });
}

export function useBatchUpdateGalleryVisibility(
  options?: UseMutationOptions<{ message?: string; updatedCount: number }, APIError, { pieceIds: string[]; visibility: GalleryVisibility }>
) {
  const queryClient = useQueryClient();
  return useMutation<{ message?: string; updatedCount: number }, APIError, { pieceIds: string[]; visibility: GalleryVisibility }>({
    mutationFn: async ({ pieceIds, visibility }) => {
      const raw = await api.portfolio.gallery.batchUpdateVisibility(pieceIds, visibility as any);
      const payload = normalizeApi<any>(raw) ?? raw;
      return { message: payload?.message ?? raw?.message, updatedCount: payload?.updatedCount ?? raw?.updatedCount ?? 0 };
    },
    onSuccess: (_data, { pieceIds }) => {
      pieceIds.forEach(id => queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.detail(id) }));
      queryClient.invalidateQueries({ queryKey: galleryQueryKeys.pieces.my() });
    },
    ...options,
  });
}

// --------------------- Prefetch utilities ---------------------
export const prefetchMyGalleryPieces = async (queryClient: any) => {
  await queryClient.prefetchQuery({ queryKey: galleryQueryKeys.pieces.my(), queryFn: () => api.portfolio.gallery.get() });
};

export const prefetchGalleryPiecesByUsername = async (queryClient: any, username?: string, page: number = 1, limit: number = 20) => {
  if (!username) return;
  await queryClient.prefetchQuery({ queryKey: galleryQueryKeys.pieces.byUsername(username, page, limit), queryFn: () => api.portfolio.gallery.getByUsername(username, page, limit) });
};

export const prefetchGalleryStats = async (queryClient: any) => {
  await queryClient.prefetchQuery({ queryKey: galleryQueryKeys.stats, queryFn: () => api.portfolio.gallery.getStats() });
};

// --------------------- Optimistic utilities ---------------------
export function useOptimisticGalleryUpdate() {
  const queryClient = useQueryClient();

  return {
    updatePieceOptimistically: (pieceId: string, updates: Partial<GalleryPiece>) => {
      queryClient.setQueryData<GalleryPiece[]>(galleryQueryKeys.pieces.my(), (old) => {
        if (!old) return old ?? [];
        return old.map(p => (p.id === pieceId ? { ...p, ...updates } : p));
      });
    },
    addPieceToListOptimistically: (piece: GalleryPiece) => {
      queryClient.setQueryData<GalleryPiece[]>(galleryQueryKeys.pieces.my(), (old) => {
        if (!old) return [piece];
        return [piece, ...old];
      });
    },
    removePieceFromListOptimistically: (pieceId: string) => {
      queryClient.setQueryData<GalleryPiece[]>(galleryQueryKeys.pieces.my(), (old) => {
        if (!old) return old ?? [];
        return old.filter(p => p.id !== pieceId);
      });
    },
    removePiecesFromListOptimistically: (pieceIds: string[]) => {
      queryClient.setQueryData<GalleryPiece[]>(galleryQueryKeys.pieces.my(), (old) => {
        if (!old) return old ?? [];
        // Guard for possibly-undefined piece ids on gallery items
        return old.filter(p => {
          const id = (p as any).id;
          if (typeof id !== 'string') return true; // keep items without an id
          return !pieceIds.includes(id);
        });
      });
    },
  };
}

// --------------------- Deprecated / legacy helpers ---------------------
export const useGalleryPieces = useMyGalleryPieces; // deprecated alias

export default {
  useMyGalleryPieces,
  useGalleryPiecesByUsername,
  useGalleryStats,
  useAddGalleryPiece,
  useUpdateGalleryPiece,
  useDeleteGalleryPiece,
  useBatchDeleteGalleryPieces,
  useBatchUpdateGalleryVisibility,
  prefetchMyGalleryPieces,
  prefetchGalleryPiecesByUsername,
  prefetchGalleryStats,
  useOptimisticGalleryUpdate,
};
