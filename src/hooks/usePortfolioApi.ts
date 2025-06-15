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

// ==================== Portfolio Queries ====================
export function usePortfolio(
  id: string,
  options?: UseQueryOptions<PortfolioWithPieces, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.portfolio(id),
    queryFn: () => api.portfolio.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function usePortfolioByUserId(
  userId: string,
  options?: UseQueryOptions<PortfolioWithPieces, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.portfolioByUser(userId),
    queryFn: () => api.portfolio.getByUserId(userId),
    enabled: !!userId,
    ...options,
  });
}

export function usePortfolioByUsername(
  username: string,
  options?: UseQueryOptions<PortfolioWithPieces, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.portfolioByUsername(username),
    queryFn: () => api.portfolio.getByUsername(username),
    enabled: !!username,
    ...options,
  });
}

export function useMyPortfolio(
  options?: UseQueryOptions<Portfolio, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.myPortfolio(),
    queryFn: () => api.portfolio.getMyPortfolio(),
    ...options,
  });
}

// ==================== Discovery Queries ====================
export function useDiscoverPortfolios(
  filters: PortfolioFilters,
  page: number = 1,
  limit: number = 20,
  options?: UseQueryOptions<PortfolioListResponse, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.discover(filters),
    queryFn: () => api.portfolio.discover(filters, page, limit),
    ...options,
  });
}

// ==================== Paginated discovery hook ====================
import { useState } from 'react';

export function usePaginatedDiscoverPortfolios(
  filters: PortfolioFilters,
  initialPage: number = 1,
  limit: number = 20,
  options?: UseQueryOptions<PortfolioListResponse, APIError>
) {
  const [page, setPage] = useState(initialPage);

  const query = useQuery<PortfolioListResponse, APIError>({
    queryKey: [...portfolioQueryKeys.discover(filters), page],
    queryFn: () => api.portfolio.discover(filters, page, limit),
    ...options,
  });

  const nextPage = () => {
    if (query.data?.hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const reset = () => setPage(initialPage);

  return {
    ...query,
    page,
    nextPage,
    reset,
  };
}

export function useSearchPortfolios(
  query: string,
  limit?: number,
  options?: UseQueryOptions<Portfolio[], APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.search(query),
    queryFn: () => api.portfolio.search(query, limit),
    enabled: !!query,
    ...options,
  });
}

export function useFeaturedPortfolios(
  limit?: number,
  options?: UseQueryOptions<Portfolio[], APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.featured(),
    queryFn: () => api.portfolio.getFeatured(limit),
    ...options,
  });
}

export function useTrendingPortfolios(
  period: 'day' | 'week' | 'month' = 'week',
  options?: UseQueryOptions<Portfolio[], APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.trending(period),
    queryFn: () => api.portfolio.getTrending(period),
    ...options,
  });
}

export function usePortfolioReviews(
  portfolioId: string,
  page: number = 1,
  limit: number = 10,
  options?: UseQueryOptions<ReviewListResponse, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.reviews(portfolioId),
    queryFn: () => api.portfolio.getReviews(portfolioId, page, limit),
    enabled: !!portfolioId,
    ...options,
  });
}

export function usePortfolioAnalytics(
  portfolioId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'month',
  options?: UseQueryOptions<PortfolioAnalytics, APIError>
) {
  return useQuery({
    queryKey: portfolioQueryKeys.analytics(portfolioId, period),
    queryFn: () => api.portfolio.getAnalytics(portfolioId, period),
    enabled: !!portfolioId,
    ...options,
  });
}

export function useCreatePortfolio(
  options?: UseMutationOptions<Portfolio, APIError, CreatePortfolioDto>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.portfolio.create,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.all });
      queryClient.setQueryData(portfolioQueryKeys.portfolio(data.id), data);
      queryClient.setQueryData(portfolioQueryKeys.myPortfolio(), data);
    },
    ...options,
  });
}

export function useUpdatePortfolio(
  options?: UseMutationOptions<Portfolio, APIError, { id: string; data: UpdatePortfolioDto }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.portfolio.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(portfolioQueryKeys.portfolio(id), data);
      queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.all });
    },
    ...options,
  });
}

export function useDeletePortfolio(
  options?: UseMutationOptions<void, APIError, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.portfolio.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: portfolioQueryKeys.portfolio(id) });
      queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.all });
    },
    ...options,
  });
}

export function useAddReview(
  options?: UseMutationOptions<PortfolioReview, APIError, { portfolioId: string; review: CreateReviewDto }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ portfolioId, review }) => api.portfolio.addReview(portfolioId, review),
    onSuccess: (data, { portfolioId }) => {
      queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.reviews(portfolioId) });
      queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.portfolio(portfolioId) });
    },
    ...options,
  });
}

export function useUploadPortfolioImage(
  options?: UseMutationOptions<{ url: string }, APIError, { file: File; type: 'profile' | 'cover' }>
) {
  return useMutation({
    mutationFn: ({ file, type }) => api.portfolio.uploadImage(file, type),
    ...options,
  });
}

export function useTrackPortfolioView() {
  return useMutation({
    mutationFn: ({ portfolioId, data }: { portfolioId: string; data?: any }) =>
      api.portfolio.trackView(portfolioId, data),
  });
}