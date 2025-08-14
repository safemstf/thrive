// src/hooks/usePortfolioQueries.ts
// Fixed to use proper types matching your API structure

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
} from '@/types/api.types';

import type {
  Portfolio,
  PortfolioWithPieces,
  PortfolioListResponse,
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioFilters,
  PortfolioReview,
  CreateReviewDto,
  PortfolioStats,
  PortfolioShareLink,
  PortfolioWithPieces as PortfolioWithPiecesType,
} from '@/types/portfolio.types';

import type { GalleryPiece } from '@/types/gallery.types';

// --------------------- Helper types ---------------------

type PortfolioWithOwner = Portfolio & { isOwner?: boolean };

type ApiPortfolioResponse = ApiResponse<PortfolioWithOwner | null>;
type ApiPortfolioWithPiecesResponse = ApiResponse<PortfolioWithPieces | null>;
type ApiPortfolioListResponse = ApiResponse<{ portfolios: Portfolio[]; pagination?: any }>;

// --------------------- Query keys ---------------------
export const portfolioQueryKeys = {
  all: ['portfolio'] as const,
  portfolios: () => [...portfolioQueryKeys.all, 'portfolios'] as const,
  portfolio: (id: string) => [...portfolioQueryKeys.all, 'portfolio', id] as const,
  portfolioByUser: (userId: string) => [...portfolioQueryKeys.all, 'user', userId] as const,
  portfolioByUsername: (username: string) => [...portfolioQueryKeys.all, 'username', username] as const,
  myPortfolio: () => [...portfolioQueryKeys.all, 'me'] as const,
  discover: (filters: PortfolioFilters, page: number, limit: number) => [...portfolioQueryKeys.all, 'discover', JSON.stringify(filters), page, limit] as const,
  featured: () => [...portfolioQueryKeys.all, 'featured'] as const,
  myGallery: () => [...portfolioQueryKeys.all, 'myGallery'] as const,
  galleryByUsername: (username: string, page?: number, limit?: number) => [...portfolioQueryKeys.all, 'gallery', username, page ?? 1, limit ?? 20] as const,
};

// --------------------- Normalizer ---------------------

/**
 * Normalize API responses so hooks can accept either:
 * - ApiResponse<T> (with `.data`) or
 * - a direct payload T or
 * - legacy shapes like `{ portfolio: T }` or `{ portfolios: T[] }`.
 */
function normalizeApi<T>(response: any): T | null {
  if (response == null) return null;

  // Common wrapper: ApiResponse<T> with `.data`
  if (typeof response === 'object' && 'data' in response) return response.data as T;

  // Common wrapper variant: { success: true, portfolio: T }
  if (typeof response === 'object' && 'portfolio' in response) return (response as any).portfolio as T;

  // Some endpoints return `{ portfolios: T[] }` etc.
  if (typeof response === 'object' && 'portfolios' in response) return (response as any) as unknown as T;

  // If already matches T
  return response as T;
}

// --------------------- Core queries ---------------------

export function useMyPortfolio(
  options?: UseQueryOptions<Portfolio | null, APIError>
) {
  return useQuery<Portfolio | null, APIError>({
    queryKey: portfolioQueryKeys.myPortfolio(),
    queryFn: async () => {
      const raw = await api.portfolio.get();
      const normalized = normalizeApi<PortfolioWithOwner | null>(raw);
      return normalized ? (normalized as Portfolio) : null;
    },
    ...options,
  });
}

export function usePortfolioByUsername(
  username: string,
  options?: UseQueryOptions<Portfolio | null, APIError>
) {
  return useQuery<Portfolio | null, APIError>({
    queryKey: portfolioQueryKeys.portfolioByUsername(username),
    queryFn: async () => {
      const raw = await api.portfolio.getByUsername(username);
      const normalized = normalizeApi<PortfolioWithOwner | null>(raw);
      return normalized ? (normalized as Portfolio) : null;
    },
    enabled: !!username,
    ...options,
  });
}

export function usePortfolio(
  id: string,
  options?: UseQueryOptions<Portfolio | null, APIError>
) {
  return useQuery<Portfolio | null, APIError>({
    queryKey: portfolioQueryKeys.portfolio(id),
    queryFn: async () => {
      const raw = await api.portfolio.getById(id);
      const normalized = normalizeApi<Portfolio | null>(raw);
      return normalized;
    },
    enabled: !!id,
    ...options,
  });
}

export function usePortfolioByUserId(
  userId: string,
  options?: UseQueryOptions<Portfolio | null, APIError>
) {
  return useQuery<Portfolio | null, APIError>({
    queryKey: portfolioQueryKeys.portfolioByUser(userId),
    queryFn: async () => {
      const raw = await api.portfolio.getByUserId(userId);
      const normalized = normalizeApi<Portfolio | null>(raw);
      return normalized;
    },
    enabled: !!userId,
    ...options,
  });
}

// --------------------- Discover / Listing (FIXED) ---------------------

export function useDiscoverPortfolios(
  filters: PortfolioFilters = {},
  page: number = 1,
  limit: number = 20,
  options?: UseQueryOptions<PortfolioListResponse, APIError>
) {
  return useQuery<PortfolioListResponse, APIError>({
    queryKey: portfolioQueryKeys.discover(filters, page, limit),
    queryFn: async () => {
      // Cast to any to resolve type mismatch between PortfolioFilters interface and API client expectations
      const raw = await api.portfolio.discover(filters as any, page, limit);

      // Try to normalize a few likely shapes
      const payload = normalizeApi<{ portfolios?: Portfolio[]; pagination?: any }>(raw) || raw || {};

      const portfolios = payload?.portfolios ?? (raw && (raw as any).portfolios) ?? [];
      const pagination = payload?.pagination ?? (raw && (raw as any).pagination) ?? { page, limit, total: 0, pages: 1 };

      return {
        data: portfolios,
        portfolios,
        total: pagination.total ?? 0,
        page: pagination.page ?? page,
        pageSize: pagination.limit ?? limit,
        hasMore: (pagination.page ?? page) < (pagination.pages ?? 1),
      } as PortfolioListResponse;
    },
    ...options,
  });
}

// --------------------- Stats ---------------------
export function usePortfolioStats(
  options?: UseQueryOptions<PortfolioStats, APIError>
) {
  return useQuery<PortfolioStats, APIError>({
    queryKey: [...portfolioQueryKeys.all, 'stats'],
    queryFn: async () => {
      const raw = await api.portfolio.getStats();
      return normalizeApi<PortfolioStats>(raw) as PortfolioStats;
    },
    ...options,
  });
}

// --------------------- CRUD Mutations ---------------------
export function useCreatePortfolio(
  options?: UseMutationOptions<Portfolio, APIError, CreatePortfolioDto>
) {
  const qc = useQueryClient();
  return useMutation<Portfolio, APIError, CreatePortfolioDto>({
    mutationFn: async (data) => {
      const raw = await api.portfolio.create(data);
      const payload = normalizeApi<Portfolio>(raw);
      return payload as Portfolio;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.all });
      qc.setQueryData(portfolioQueryKeys.myPortfolio(), data);
    },
    ...options,
  });
}

export function useUpdatePortfolio(
  options?: UseMutationOptions<Portfolio, APIError, UpdatePortfolioDto>
) {
  const qc = useQueryClient();
  return useMutation<Portfolio, APIError, UpdatePortfolioDto>({
    mutationFn: async (data) => {
      const raw = await api.portfolio.update(data);
      const payload = normalizeApi<Portfolio>(raw);
      return payload as Portfolio;
    },
    onSuccess: (data) => {
      qc.setQueryData(portfolioQueryKeys.myPortfolio(), data);
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.all });
    },
    ...options,
  });
}

export function useDeletePortfolio(
  options?: UseMutationOptions<void, APIError, { portfolioId?: string; deleteGalleryPieces?: boolean }>
) {
  const qc = useQueryClient();
  return useMutation<void, APIError, { portfolioId?: string; deleteGalleryPieces?: boolean }>({
    mutationFn: async ({ deleteGalleryPieces = false } = {}) => {
      await api.portfolio.delete(deleteGalleryPieces);
    },
    onSuccess: () => {
      qc.setQueryData(portfolioQueryKeys.myPortfolio(), null);
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.all });
    },
    ...options,
  });
}

// --------------------- Gallery Queries & Mutations ---------------------

export function useMyGalleryPieces(
  options?: UseQueryOptions<GalleryPiece[], APIError>
) {
  return useQuery<GalleryPiece[], APIError>({
    queryKey: portfolioQueryKeys.myGallery(),
    queryFn: async () => {
      const raw = await api.portfolio.gallery.get();
      const payload = normalizeApi<any>(raw) ?? raw;

      // prefer galleryPieces, then legacy 'pieces', then direct array payload
      if (payload && typeof payload === 'object' && 'galleryPieces' in payload) {
        return (payload as any).galleryPieces as GalleryPiece[];
      }

      if (payload && typeof payload === 'object' && 'pieces' in payload) {
        return (payload as any).pieces as GalleryPiece[];
      }

      if (Array.isArray(payload)) {
        return payload as GalleryPiece[];
      }

      // fallback to checking raw in case normalizeApi returned null
      if (raw && typeof raw === 'object' && 'galleryPieces' in raw) {
        return (raw as any).galleryPieces as GalleryPiece[];
      }

      if (raw && typeof raw === 'object' && 'pieces' in raw) {
        return (raw as any).pieces as GalleryPiece[];
      }

      return [] as GalleryPiece[];
    },
    ...options,
  });
}

export function usePortfolioGalleryByUsername(
  username: string,
  page: number = 1,
  limit: number = 20,
  options?: UseQueryOptions<{ galleryPieces: GalleryPiece[]; pagination?: any; portfolio?: Portfolio | null }, APIError>
) {
  return useQuery<{ galleryPieces: GalleryPiece[]; pagination?: any; portfolio?: Portfolio | null }, APIError>({
    queryKey: portfolioQueryKeys.galleryByUsername(username, page, limit),
    queryFn: async () => {
      const raw = await api.portfolio.gallery.getByUsername(username, page, limit);
      const payload = normalizeApi<any>(raw) || raw;
      const pieces = (payload?.galleryPieces ?? payload?.pieces ?? raw?.pieces ?? raw?.pieces ?? []) as GalleryPiece[];
      const pagination = payload?.pagination ?? raw?.pagination ?? { page, limit, total: 0, pages: 1 };
      const portfolio = normalizeApi<Portfolio>(payload?.portfolio ?? raw?.portfolio) ?? null;
      return { galleryPieces: pieces, pagination, portfolio };
    },
    enabled: !!username,
    ...options,
  });
}

export function useGalleryStats(
  options?: UseQueryOptions<any, APIError>
) {
  return useQuery<any, APIError>({
    queryKey: [...portfolioQueryKeys.all, 'galleryStats'],
    queryFn: async () => {
      const raw = await api.portfolio.gallery.getStats();
      return normalizeApi<any>(raw);
    },
    ...options,
  });
}

export function useAddGalleryPiece(
  options?: UseMutationOptions<GalleryPiece, APIError, any>
) {
  const qc = useQueryClient();
  return useMutation<GalleryPiece, APIError, any>({
    mutationFn: async (pieceData) => {
      const raw = await api.portfolio.gallery.add(pieceData);
      const payload = normalizeApi<GalleryPiece>(raw) ?? raw?.galleryPiece ?? raw;
      return payload as GalleryPiece;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.myGallery() });
      qc.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'galleryStats'] });
    },
    ...options,
  });
}

export function useUpdateGalleryPiece(
  options?: UseMutationOptions<GalleryPiece, APIError, { pieceId: string; updates: any }>
) {
  const qc = useQueryClient();
  return useMutation<GalleryPiece, APIError, { pieceId: string; updates: any }>({
    mutationFn: async ({ pieceId, updates }) => {
      const raw = await api.portfolio.gallery.update(pieceId, updates);
      const payload = normalizeApi<GalleryPiece>(raw) ?? raw?.galleryPiece ?? raw;
      return payload as GalleryPiece;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.myGallery() });
      qc.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'galleryStats'] });
    },
    ...options,
  });
}

export function useDeleteGalleryPiece(
  options?: UseMutationOptions<{ message?: string; id?: string }, APIError, string>
) {
  const qc = useQueryClient();
  return useMutation<{ message?: string; id?: string }, APIError, string>({
    mutationFn: async (pieceId: string) => {
      const raw = await api.portfolio.gallery.delete(pieceId);
      const payload = normalizeApi<any>(raw) ?? raw;
      return { message: payload?.message ?? raw?.message, id: payload?.deletedPieceId ?? raw?.deletedPieceId };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.myGallery() });
      qc.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'galleryStats'] });
    },
    ...options,
  });
}

export function useBatchDeleteGalleryPieces(
  options?: UseMutationOptions<{ message?: string; deletedCount: number }, APIError, string[]>
) {
  const qc = useQueryClient();
  return useMutation<{ message?: string; deletedCount: number }, APIError, string[]>({
    mutationFn: async (pieceIds: string[]) => {
      const raw = await api.portfolio.gallery.batchDelete(pieceIds);
      const payload = normalizeApi<any>(raw) ?? raw;
      return { message: payload?.message ?? raw?.message, deletedCount: payload?.deletedCount ?? raw?.deletedCount ?? 0 };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.myGallery() });
    },
    ...options,
  });
}

export function useBatchUpdateGalleryVisibility(
  options?: UseMutationOptions<{ message?: string; updatedCount: number }, APIError, { pieceIds: string[]; visibility: string }>
) {
  const qc = useQueryClient();
  return useMutation<{ message?: string; updatedCount: number }, APIError, { pieceIds: string[]; visibility: string }>({
    mutationFn: async ({ pieceIds, visibility }) => {
      const raw = await api.portfolio.gallery.batchUpdateVisibility(pieceIds, visibility as any);
      const payload = normalizeApi<any>(raw) ?? raw;
      return { message: payload?.message ?? raw?.message, updatedCount: payload?.updatedCount ?? raw?.updatedCount ?? 0 };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.myGallery() });
    },
    ...options,
  });
}

// --------------------- Concepts (lightweight) ---------------------
export function useMyConcepts(
  options?: UseQueryOptions<any, APIError>
) {
  return useQuery<any, APIError>({
    queryKey: [...portfolioQueryKeys.all, 'concepts'],
    queryFn: async () => {
      const raw = await api.portfolio.concepts.get();
      return normalizeApi<any>(raw) ?? raw;
    },
    ...options,
  });
}

export function useAddConceptToPortfolio(
  options?: UseMutationOptions<any, APIError, { conceptId: string; data?: any }>
) {
  const qc = useQueryClient();
  return useMutation<any, APIError, { conceptId: string; data?: any }>({
    mutationFn: async ({ conceptId, data = {} }) => {
      const raw = await api.portfolio.concepts.add(conceptId, data);
      return normalizeApi<any>(raw) ?? raw;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'concepts'] }),
    ...options,
  });
}

export function useUpdateConceptProgress(
  options?: UseMutationOptions<any, APIError, { conceptId: string; data?: any }>
) {
  const qc = useQueryClient();
  return useMutation<any, APIError, { conceptId: string; data?: any }>({
    mutationFn: async ({ conceptId, data = {} }) => {
      const raw = await api.portfolio.concepts.updateProgress(conceptId, data);
      return normalizeApi<any>(raw) ?? raw;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [...portfolioQueryKeys.all, 'concepts'] }),
    ...options,
  });
}

// --------------------- Analytics & Utilities ---------------------
export function usePortfolioAnalytics(
  period: '7d' | '30d' | '90d' | '1y' = '30d',
  options?: UseQueryOptions<any, APIError>
) {
  return useQuery<any, APIError>({
    queryKey: [...portfolioQueryKeys.all, 'analytics', period],
    queryFn: async () => {
      const raw = await api.portfolio.analytics.get(period);
      return normalizeApi<any>(raw) ?? raw;
    },
    ...options,
  });
}

export function useUploadPortfolioImage(
  options?: UseMutationOptions<{ url: string }, APIError, { file: File; type: 'profile' | 'cover' }>
) {
  const qc = useQueryClient();
  return useMutation<{ url: string }, APIError, { file: File; type: 'profile' | 'cover' }>({
    mutationFn: ({ file, type }) => api.portfolio.images.upload(file, type),
    onSuccess: () => qc.invalidateQueries({ queryKey: portfolioQueryKeys.myPortfolio() }),
    ...options,
  });
}

// --------------------- Utility hooks ---------------------
export function useHasPortfolio() {
  const { data: portfolio, isLoading } = useMyPortfolio();
  return { hasPortfolio: !!portfolio, isLoading, portfolio };
}

export function usePortfolioCheck(options?: UseQueryOptions<boolean, APIError>) {
  return useQuery<boolean, APIError>({
    queryKey: [...portfolioQueryKeys.all, 'check'],
    queryFn: async () => {
      const raw = await api.portfolio.check();
      // expected shape: { hasPortfolio: boolean }
      const payload = normalizeApi<any>(raw) ?? raw;
      return payload?.hasPortfolio ?? raw?.hasPortfolio ?? false;
    },
    ...options,
  });
}

export default {
  useMyPortfolio,
  usePortfolioByUsername,
  usePortfolio,
  usePortfolioByUserId,
  useDiscoverPortfolios,
  usePortfolioStats,
  useCreatePortfolio,
  useUpdatePortfolio,
  useDeletePortfolio,
  useMyGalleryPieces,
  usePortfolioGalleryByUsername,
  useGalleryStats,
  useAddGalleryPiece,
  useUpdateGalleryPiece,
  useDeleteGalleryPiece,
  useBatchDeleteGalleryPieces,
  useBatchUpdateGalleryVisibility,
  useMyConcepts,
  useAddConceptToPortfolio,
  useUpdateConceptProgress,
  usePortfolioAnalytics,
  useUploadPortfolioImage,
  useHasPortfolio,
  usePortfolioCheck,
};