// hooks/usePortfolioManagement.ts

import {
  useMyPortfolio,
  useCreatePortfolio,
  useUpdatePortfolio,
  useDeletePortfolio,
} from '@/hooks/usePortfolioQueries';
import { api } from '@/lib/api-client';
import { useCallback } from 'react';
import type { Portfolio, CreatePortfolioDto, UpdatePortfolioDto } from '@/types/portfolio.types';
import { useGalleryPieces } from '@/hooks/useGalleryApi';

// Define this outside the hook
type CreatePortfolioInput = {
  title: string;
  bio?: string;
  visibility?: 'public' | 'private';
  kind?: 'creative' | 'educational' | 'hybrid';
  specializations?: string[];
  tags?: string[];
};

/**
 * Simplified portfolio management hook
 * Leverages existing React Query hooks - avoids duplication
 */
export function usePortfolioManagement() {
  const portfolioQuery = useMyPortfolio();
  const createMutation = useCreatePortfolio();
  const updateMutation = useUpdatePortfolio();
  const deleteMutation = useDeletePortfolio();

  const hasPortfolio = !!portfolioQuery.data;

  const getPortfolioTypeConfig = useCallback((type?: string) => {
    return api.portfolio.getPortfolioTypeConfig(type ?? portfolioQuery.data?.kind ?? 'creative');
  }, [portfolioQuery.data?.kind]);

  const createPortfolio = useCallback(async (data: CreatePortfolioInput) => {
    const portfolioData: CreatePortfolioDto = {
      title: data.title,
      bio: data.bio ?? '',
      visibility: data.visibility ?? 'public',
      specializations: data.specializations ?? [],
      tags: data.tags ?? [],
    };
    return createMutation.mutateAsync(portfolioData);
  }, [createMutation]);

  const updatePortfolio = useCallback(async (updates: Partial<Portfolio>) => {
    const current = portfolioQuery.data;
    if (!current?.id) {
      throw new Error('No portfolio to update');
    }

    const updateData: UpdatePortfolioDto = {
      title: updates.title ?? current.title,
      bio: updates.bio ?? current.bio,
      visibility: updates.visibility ?? current.visibility,
      specializations: updates.specializations ?? current.specializations,
      tags: updates.tags ?? current.tags,
      location: updates.location ?? current.location ?? '',
    };

    return updateMutation.mutateAsync({
      id: current.id,
      data: updateData,
    });
  }, [updateMutation, portfolioQuery.data]);

  const deletePortfolio = useCallback(async () => {
    const id = portfolioQuery.data?.id;
    if (!id) {
      throw new Error('No portfolio to delete');
    }
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation, portfolioQuery.data?.id]);

  const ownerId = portfolioQuery.data?.userId;

 const galleryQuery = useGalleryPieces(
  ownerId ? { artist: ownerId } : undefined,
);



  return {
    // Portfolio state from React Query
    portfolio: portfolioQuery.data,
    loading: portfolioQuery.isLoading,
    error: portfolioQuery.error?.message || null,
    hasPortfolio,

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

    // Related gallery data
    galleryQuery,
  };
}

export default usePortfolioManagement;
