// hooks/usePortfolioManagement.ts
// Simple wrapper around existing React Query hooks
import { 
  useMyPortfolio,
  useCreatePortfolio,
  useUpdatePortfolio,
  useDeletePortfolio,
} from '@/hooks/usePortfolioQueries';
import { api } from '@/lib/api-client';
import { useCallback } from 'react';
import type { Portfolio, CreatePortfolioDto, UpdatePortfolioDto } from '@/types/portfolio.types';

/**
 * Simplified portfolio management hook
 * Leverages existing React Query hooks - avoids duplication
 */
export function usePortfolioManagement() {
  // Use existing React Query hooks
  const portfolioQuery = useMyPortfolio();
  const createMutation = useCreatePortfolio();
  const updateMutation = useUpdatePortfolio();
  const deleteMutation = useDeletePortfolio();

  // Helper functions that use the API client directly
  const getPortfolioTypeConfig = useCallback((type?: string) => {
    return api.portfolio.getPortfolioTypeConfig(type || portfolioQuery.data?.kind || 'creative');
  }, [portfolioQuery.data?.kind]);

  const hasPortfolio = useCallback(() => {
    return portfolioQuery.data !== null && portfolioQuery.data !== undefined;
  }, [portfolioQuery.data]);

  // Simplified create function with proper typing
  const createPortfolio = useCallback(async (data: {
    title: string;
    bio?: string;
    visibility?: 'public' | 'private';
    kind?: 'creative' | 'educational' | 'hybrid';
    specializations?: string[];
    tags?: string[];
  }) => {
    // Map to proper CreatePortfolioDto format
    const portfolioData: CreatePortfolioDto = {
      title: data.title,
      bio: data.bio || '', // Ensure bio is always a string
      visibility: data.visibility || 'public',
      specializations: data.specializations || [],
      tags: data.tags || []
    };
    
    return createMutation.mutateAsync(portfolioData);
  }, [createMutation]);

  // Simplified update function with proper typing
  const updatePortfolio = useCallback(async (updates: Partial<Portfolio>) => {
    if (!portfolioQuery.data?.id) {
      throw new Error('No portfolio to update');
    }
    
    // Map to proper UpdatePortfolioDto format
    const updateData: UpdatePortfolioDto = {
      title: updates.title || portfolioQuery.data.title,
      bio: updates.bio || portfolioQuery.data.bio,
      visibility: updates.visibility || portfolioQuery.data.visibility,
      specializations: updates.specializations || portfolioQuery.data.specializations,
      tags: updates.tags || portfolioQuery.data.tags,
      location: updates.location || portfolioQuery.data.location || '', // Ensure location is provided
    };
    
    return updateMutation.mutateAsync({
      id: portfolioQuery.data.id,
      data: updateData
    });
  }, [updateMutation, portfolioQuery.data]);

  // Simplified delete function
  const deletePortfolio = useCallback(async () => {
    if (!portfolioQuery.data?.id) {
      throw new Error('No portfolio to delete');
    }
    return deleteMutation.mutateAsync(portfolioQuery.data.id);
  }, [deleteMutation, portfolioQuery.data?.id]);

  return {
    // Portfolio state from React Query
    portfolio: portfolioQuery.data,
    loading: portfolioQuery.isLoading,
    error: portfolioQuery.error?.message || null,
    hasPortfolio: hasPortfolio(),
    
    // Portfolio operations
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    refreshPortfolio: portfolioQuery.refetch,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Utilities
    getPortfolioTypeConfig,
    
    // Direct API access for advanced use cases
    api: api.portfolio,
    
    // React Query instance for advanced query operations
    query: portfolioQuery,
  };
}

export default usePortfolioManagement;