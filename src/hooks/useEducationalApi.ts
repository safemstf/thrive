// src/hooks/useEducationalApi.ts - Fixed to match your API structure
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';
import { MainCategory, SubCategory } from '@/types/educational.types';

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
    suggestions: (id: string) => [...queryKeys.books.all, 'suggestions', id] as const,
    analysis: (id: string) => [...queryKeys.books.all, 'analysis', id] as const,
  },
  concepts: {
    all: ['educational', 'concepts'] as const,
    lists: () => [...queryKeys.concepts.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.concepts.lists(), filters] as const,
    details: () => [...queryKeys.concepts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.concepts.details(), id] as const,
    byBook: (bookId: string) => [...queryKeys.concepts.all, 'book', bookId] as const,
    byType: (type: string) => [...queryKeys.concepts.all, 'type', type] as const,
  },
  search: {
    all: ['educational', 'search'] as const,
    concepts: (query: string, filters?: any) => 
      [...queryKeys.search.all, 'concepts', query, filters] as const,
  }
};

// ==================== BOOKS HOOKS ====================

export function useBooks(
  params?: any,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => api.books.getAll(params), // Fixed: matches your API structure
    ...options,
  });
}

export function useBook(
  id: string,
  options?: UseQueryOptions<any, APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => api.books.getById(id), // Fixed: matches your API structure
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
    queryFn: () => api.books.getByCategory(category, subCategory), // Fixed: matches your API structure
    ...options,
  });
}

export function useBookSuggestions(
  id: string,
  options?: UseQueryOptions<any, APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.suggestions(id),
    queryFn: () => api.books.getSuggestions(id),
    enabled: !!id,
    ...options,
  });
}

export function useBookAnalysis(
  id: string,
  options?: UseQueryOptions<any, APIError>
) {
  return useQuery({
    queryKey: queryKeys.books.analysis(id),
    queryFn: () => api.books.analyze(id),
    enabled: !!id,
    ...options,
  });
}

// ==================== CONCEPTS HOOKS ====================

export function useConcepts(
  filters?: any,
  options?: UseQueryOptions<{ concepts: any[]; pagination: any }, APIError>
) {
  return useQuery({
    queryKey: queryKeys.concepts.list(filters),
    queryFn: () => api.concepts.getAll(filters), // Returns { concepts: [], pagination: {} }
    ...options,
  });
}

export function useConcept(
  id: string,
  options?: UseQueryOptions<any, APIError>
) {
  return useQuery({
    queryKey: queryKeys.concepts.detail(id),
    queryFn: () => api.concepts.getById(id), // Fixed: matches your API structure
    enabled: !!id,
    ...options,
  });
}

export function useConceptsByBook(
  bookId: string,
  options?: UseQueryOptions<{ bookId: string; concepts: any[]; count: number }, APIError>
) {
  return useQuery({
    queryKey: queryKeys.concepts.byBook(bookId),
    queryFn: () => api.concepts.getByBook(bookId), // Returns { bookId, concepts: [], count: number }
    enabled: !!bookId,
    ...options,
  });
}

export function useConceptsByType(
  type: string,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.concepts.byType(type),
    queryFn: () => api.concepts.getByType(type), // Fixed: matches your API structure
    enabled: !!type,
    ...options,
  });
}

// ==================== HELPER HOOKS FOR EASIER ACCESS ====================

// Helper hook to get just the concepts array from useConcepts
export function useConceptsList(
  filters?: any,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: [...queryKeys.concepts.list(filters), 'array'],
    queryFn: async () => {
      const response = await api.concepts.getAll(filters);
      return response.concepts || [];
    },
    ...options,
  });
}

// Helper hook to get just the concepts array from useConceptsByBook
export function useConceptsByBookList(
  bookId: string,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: [...queryKeys.concepts.byBook(bookId), 'array'],
    queryFn: async () => {
      const response = await api.concepts.getByBook(bookId);
      return response.concepts || [];
    },
    enabled: !!bookId,
    ...options,
  });
}

// ==================== SPECIALIZED CONTENT HOOKS ====================

export function useMathConcepts(
  bookId: string,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: [...queryKeys.concepts.byBook(bookId), 'math'],
    queryFn: async () => {
      const response = await api.concepts.getByBook(bookId);
      // Extract concepts array from response object
      return response.concepts || [];
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
    queryKey: [...queryKeys.concepts.byBook(bookId), 'science', discipline],
    queryFn: async () => {
      const response = await api.concepts.getByBook(bookId);
      // Extract concepts array from response object
      return response.concepts || [];
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
    queryKey: [...queryKeys.concepts.byBook(bookId), 'grammar'],
    queryFn: async () => {
      const response = await api.concepts.getByBook(bookId);
      // Extract concepts array from response object
      return response.concepts || [];
    },
    enabled: !!bookId,
    ...options,
  });
}

// ==================== SEARCH HOOKS ====================

export function useConceptSearch(
  query: string,
  filters?: any,
  options?: UseQueryOptions<any[], APIError>
) {
  return useQuery({
    queryKey: queryKeys.search.concepts(query, filters),
    queryFn: async () => {
      const response = await api.concepts.search(query, filters); // Fixed: matches your API structure
      // Handle different possible response structures
      if (Array.isArray(response)) {
        return response;
      }
      // Response structure: { query: string; results: Concept[]; count: number; }
      return response.results || [];
    },
    enabled: !!query && query.length > 2,
    ...options,
  });
}

// Legacy alias for backward compatibility
export const useContentSearch = useConceptSearch;

// ==================== MUTATION HOOKS (if needed) ====================

export function useCreateBook() {
  // You can add mutation hooks here if you use react-query mutations
  // For now, direct API calls work fine
  return {
    createBook: api.books.create,
    composeBook: api.books.compose,
    cloneBook: api.books.clone,
  };
}

export function useConceptMutations() {
  return {
    createConcept: api.concepts.create,
    updateConcept: api.concepts.update,
    markComplete: api.concepts.markComplete,
  };
}

// ==================== PREFETCH UTILITIES ====================

export const prefetchBook = async (queryClient: any, id: string) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => api.books.getById(id),
  });
};

export const prefetchBooks = async (queryClient: any, params?: any) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => api.books.getAll(params),
  });
};

export const prefetchConcepts = async (queryClient: any, filters?: any) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.concepts.list(filters),
    queryFn: () => api.concepts.getAll(filters),
  });
};

export const prefetchConceptsByBook = async (queryClient: any, bookId: string) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.concepts.byBook(bookId),
    queryFn: () => api.concepts.getByBook(bookId),
  });
};

// ==================== ERROR HANDLING UTILITY ====================

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
    isForbidden: (error: unknown): boolean => {
      return error instanceof APIError && error.status === 403;
    },
    isValidationError: (error: unknown): boolean => {
      return error instanceof APIError && error.status === 400;
    },
  };
}

// ==================== EXPORTS ====================

// Main hooks export
export default {
  // Books
  useBooks,
  useBook,
  useBooksByCategory,
  useBookSuggestions,
  useBookAnalysis,
  
  // Concepts (full responses)
  useConcepts,
  useConcept,
  useConceptsByBook,
  useConceptsByType,
  
  // Concepts (array helpers)
  useConceptsList,
  useConceptsByBookList,
  
  // Specialized content
  useMathConcepts,
  useScienceConcepts,
  useGrammarRules,
  
  // Search
  useConceptSearch,
  useContentSearch,
  
  // Mutations
  useCreateBook,
  useConceptMutations,
  
  // Utils
  useApiError,
  
  // Prefetch utilities
  prefetchBook,
  prefetchBooks,
  prefetchConcepts,
  prefetchConceptsByBook,
  
  // Query keys for advanced usage
  queryKeys,
};