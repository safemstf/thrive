// src/hooks/useEducationalApi.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { api, useApiClient } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';

import { 
  Book, 
  MainCategory, 
  SubCategory, 
  ScientificDiscipline,
  MathConcept,
  ScienceConcept,
  GrammarRule
} from '@/types/educational.types';
import {
  BookQueryParams,
  SearchFilters,
  SearchResult,
  UserProgress
} from '@/types/api.types';

// Query keys factory
export const queryKeys = {
  all: ['educational'] as const,
  books: {
    all: ['educational', 'books'] as const,
    lists: () => [...queryKeys.books.all, 'list'] as const,
    list: (params?: BookQueryParams) => [...queryKeys.books.lists(), params] as const,
    details: () => [...queryKeys.books.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.books.details(), id] as const,
    byCategory: (category: MainCategory, subCategory?: SubCategory) => 
      [...queryKeys.books.all, 'category', category, subCategory] as const,
  },
  content: {
    all: ['educational', 'content'] as const,
    math: (bookId: string) => [...queryKeys.content.all, 'math', bookId] as const,
    science: (bookId: string, discipline?: ScientificDiscipline) => 
      [...queryKeys.content.all, 'science', bookId, discipline] as const,
    grammar: (bookId: string) => [...queryKeys.content.all, 'grammar', bookId] as const,
  },
  search: {
    all: ['educational', 'search'] as const,
    query: (query: string, filters?: SearchFilters) => 
      [...queryKeys.search.all, query, filters] as const,
  },
  analytics: {
    popular: (limit?: number) => ['educational', 'analytics', 'popular', limit] as const,
  },
  user: {
    progress: (userId: string, bookId: string) => 
      ['educational', 'user', userId, 'progress', bookId] as const,
  },
};

// Books hooks
export function useBooks(
  params?: BookQueryParams,
  options?: UseQueryOptions<Book[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => api.books.getAll(params),
    ...options,
  });
}

export function useBook(
  id: string,
  options?: UseQueryOptions<Book, APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => api.books.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useBooksByCategory(
  category: MainCategory,
  subCategory?: SubCategory,
  options?: UseQueryOptions<Book[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.byCategory(category, subCategory),
    queryFn: () => api.books.getByCategory(category, subCategory),
    ...options,
  });
}

// Content hooks
export function useMathConcepts(
  bookId: string,
  options?: UseQueryOptions<MathConcept[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.content.math(bookId),
    queryFn: () => api.content.getMathConcepts(bookId),
    enabled: !!bookId,
    ...options,
  });
}

export function useScienceConcepts(
  bookId: string,
  discipline?: ScientificDiscipline,
  options?: UseQueryOptions<ScienceConcept[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.content.science(bookId, discipline),
    queryFn: () => api.content.getScienceConcepts(bookId, discipline),
    enabled: !!bookId,
    ...options,
  });
}

export function useGrammarRules(
  bookId: string,
  options?: UseQueryOptions<GrammarRule[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.content.grammar(bookId),
    queryFn: () => api.content.getGrammarRules(bookId),
    enabled: !!bookId,
    ...options,
  });
}

// Search hooks
export function useContentSearch(
  query: string,
  filters?: SearchFilters,
  options?: UseQueryOptions<SearchResult[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.search.query(query, filters),
    queryFn: () => api.content.search(query, filters),
    enabled: !!query && query.length > 2, // Only search with 3+ characters
    ...options,
  });
}

// Analytics hooks
export function usePopularBooks(
  limit?: number,
  options?: UseQueryOptions<Book[], APIError>
) {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: queryKeys.analytics.popular(limit),
    queryFn: () => apiClient.educational.getPopularBooks(limit),
    ...options,
  });
}

// Mutation hooks
export function useCreateBook(
  options?: UseMutationOptions<Book, APIError, Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.books.create,
    onSuccess: (data) => {
      // Invalidate and refetch books list
      queryClient.invalidateQueries({ queryKey: queryKeys.books.lists() });
      // Add the new book to the cache
      queryClient.setQueryData(queryKeys.books.detail(data.id), data);
    },
    ...options,
  });
}

export function useUpdateBook(
  options?: UseMutationOptions<Book, APIError, { id: string; updates: Partial<Book> }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => api.books.update(id, updates),
    onSuccess: (data, { id }) => {
      // Update the book in cache
      queryClient.setQueryData(queryKeys.books.detail(id), data);
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.books.lists() });
    },
    ...options,
  });
}

export function useDeleteBook(
  options?: UseMutationOptions<void, APIError, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.books.delete,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.books.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.books.lists() });
    },
    ...options,
  });
}

// Track content view mutation
export function useTrackContentView() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: ({ userId, contentId, contentType }: {
      userId: string;
      contentId: string;
      contentType: string;
    }) => apiClient.educational.trackContentView(userId, contentId, contentType),
  });
}

// Prefetch utilities
export const prefetchBook = async (queryClient: any, id: string) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => api.books.getById(id),
  });
};

export const prefetchBooks = async (queryClient: any, params?: BookQueryParams) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => api.books.getAll(params),
  });
};

// Error handling utility
export function useApiError() {
  return {
    getErrorMessage: (error: unknown): string => {
      if (error instanceof APIError) {
        return error.message;
      }
      if (error instanceof Error) {
        return error.message;
      }
      return 'An unexpected error occurred';
    },
    isNotFound: (error: unknown): boolean => {
      return error instanceof APIError && error.status === 404;
    },
    isUnauthorized: (error: unknown): boolean => {
      return error instanceof APIError && error.status === 401;
    },
    isServerError: (error: unknown): boolean => {
      return error instanceof APIError && error.status !== undefined && error.status >= 500;
    },
  };
}