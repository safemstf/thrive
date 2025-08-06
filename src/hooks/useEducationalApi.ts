// src/hooks/useEducationalApi.ts
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';
import { MainCategory, SubCategory } from '@/types/portfolio.types';

// Query keys factory
export const queryKeys = {
  all: ['educational'] as const,
  books: {
    all: ['educational', 'books'] as const,
    lists: () => [...queryKeys.books.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.books.lists(), params] as const,
    details: () => [...queryKeys.books.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.books.details(), id] as const,
    byCategory: (category: MainCategory, subCategory?: SubCategory) => 
      [...queryKeys.books.all, 'category', category, subCategory] as const,
  },
  content: {
    all: ['educational', 'content'] as const,
    math: (bookId: string) => [...queryKeys.content.all, 'math', bookId] as const,
    science: (bookId: string, discipline?: string) => 
      [...queryKeys.content.all, 'science', bookId, discipline] as const,
    grammar: (bookId: string) => [...queryKeys.content.all, 'grammar', bookId] as const,
  },
  search: {
    all: ['educational', 'search'] as const,
    query: (query: string, filters?: any) => 
      [...queryKeys.search.all, query, filters] as const,
  }
};

// Books hooks
export function useBooks(
  params?: any,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => api.education.books.getAll(params),
    ...options,
  });
}

export function useBook(
  id: string,
  options?: UseQueryOptions<any, APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => api.education.books.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useBooksByCategory(
  category: MainCategory,
  subCategory?: SubCategory,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.byCategory(category, subCategory),
    queryFn: () => api.education.books.getByCategory(category, subCategory),
    ...options,
  });
}

// Content hooks
export function useMathConcepts(
  bookId: string,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.content.math(bookId),
    queryFn: async () => {
      const response = await api.education.concepts.getByBook(bookId);
      return response.concepts;
    },
    enabled: !!bookId,
    ...options,
  });
}

export function useScienceConcepts(
  bookId: string,
  discipline?: string,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.content.science(bookId, discipline),
    queryFn: async () => {
      const response = await api.education.concepts.getByBook(bookId);
      return response.concepts;
    },
    enabled: !!bookId,
    ...options,
  });
}

export function useGrammarRules(
  bookId: string,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.content.grammar(bookId),
    queryFn: async () => {
      const response = await api.education.concepts.getByBook(bookId);
      return response.concepts;
    },
    enabled: !!bookId,
    ...options,
  });
}

// Search hooks
export function useContentSearch(
  query: string,
  filters?: any,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.search.query(query, filters),
    queryFn: async () => {
      const response = await api.education.concepts.search(query, filters);
      return response.results;
    },
    enabled: !!query && query.length > 2,
    ...options,
  });
}

// Prefetch utilities
export const prefetchBook = async (queryClient: any, id: string) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => api.education.books.getById(id),
  });
};

export const prefetchBooks = async (queryClient: any, params?: any) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => api.education.books.getAll(params),
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