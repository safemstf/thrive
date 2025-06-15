import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';
import { Artwork, CreateArtworkDto, UpdateArtworkDto } from '@/types/artwork.types';

// Define the missing artwork methods interface
interface ArtworkApiMethods {
  create: (portfolioId: string, data: FormData) => Promise<Artwork>;
  getById: (id: string) => Promise<Artwork>;
  getByPortfolio: (portfolioId: string) => Promise<Artwork[]>;
}

// Extend the api object type with artwork methods
const apiWithArtwork = api as typeof api & {
  artwork: ArtworkApiMethods;
};

export const artworkQueryKeys = {
  all: ['artwork'] as const,
  artwork: (id: string) => [...artworkQueryKeys.all, 'artwork', id] as const,
  byPortfolio: (portfolioId: string) => [...artworkQueryKeys.all, 'portfolio', portfolioId] as const,
};

export function useCreateArtwork(
  options?: UseMutationOptions<Artwork, APIError, { portfolioId: string; data: FormData }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ portfolioId, data }) => 
      apiWithArtwork.artwork.create(portfolioId, data),
    onSuccess: (data, { portfolioId }) => {
      queryClient.invalidateQueries({ queryKey: artworkQueryKeys.byPortfolio(portfolioId) });
      queryClient.invalidateQueries({ queryKey: artworkQueryKeys.all });
    },
    ...options,
  });
}

export function useArtwork(
  id: string,
  options?: UseQueryOptions<Artwork, APIError>
) {
  return useQuery({
    queryKey: artworkQueryKeys.artwork(id),
    queryFn: () => apiWithArtwork.artwork.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useArtworkByPortfolio(
  portfolioId: string,
  options?: UseQueryOptions<Artwork[], APIError>
) {
  return useQuery({
    queryKey: artworkQueryKeys.byPortfolio(portfolioId),
    queryFn: () => apiWithArtwork.artwork.getByPortfolio(portfolioId),
    enabled: !!portfolioId,
    ...options,
  });
}