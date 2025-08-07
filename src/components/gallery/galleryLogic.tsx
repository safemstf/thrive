// src/components/gallery/galleryLogic.tsx - Fixed version
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/authProvider';
import type { Portfolio, PortfolioKind } from '@/types/portfolio.types';
import type {
  GalleryPiece,
} from '@/types/gallery.types';

// Local types for component logic
export type GalleryMode = 'public' | 'portfolio';
export type SortOption = 'newest' | 'oldest' | 'popular' | 'name';
export type BulkAction = 'delete' | 'visibility' | 'download' | 'collection';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  type: 'artwork';
  visibility: 'public' | 'private' | 'unlisted';
  itemCount: number;
  coverImage?: string;
  createdAt: Date;
  portfolioId?: string;
}

export interface GalleryCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  createdAt?: Date;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string | null;
  selectedTags: Set<string>;
  priceRange: { min: number; max: number };
  sortBy: SortOption;
}

export interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Main data fetching hook
export const useGalleryData = () => {
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const apiClient = useApiClient();

  const fetchData = useCallback(async (mode: GalleryMode) => {
    try {
      setLoading(true);
      setError(null);

      if (mode === 'portfolio' && isAuthenticated) {
        // Fetch portfolio data with retry logic
        try {
          const portfolioData = await apiClient.portfolio.getMyPortfolio();
          setPortfolio(portfolioData);

          if (portfolioData && (portfolioData.kind === 'creative' || portfolioData.kind === 'hybrid')) {
            // Fetch portfolio artwork
            const piecesResponse = await apiClient.portfolio.getMyGalleryPieces();
            const pieces = Array.isArray(piecesResponse) ? piecesResponse : [];
            const myPieces = pieces.filter(p => p.ownerId === user?.id || p.portfolioId === portfolioData.id);
            setGalleryPieces(myPieces);

          } else if (portfolioData && portfolioData.kind === 'educational') {
            setGalleryPieces([]);
            setError('Educational portfolios focus on learning progress. Switch to Creative or Hybrid to manage artwork.');
          } else if (portfolioData && portfolioData.kind === 'professional') {
            setGalleryPieces([]);
            setError('Professional portfolios focus on career achievements. Switch to Creative or Hybrid to manage artwork.');
          } else {
            setGalleryPieces([]);
          }
        } catch (portfolioError: any) {
          if (portfolioError?.status === 404) {
            setPortfolio(null);
            setGalleryPieces([]);
          } else {
            throw portfolioError;
          }
        }
      } else {
        // Fetch public gallery
        const publicPiecesResponse = await apiClient.portfolio.getMyGalleryPieces();
        const publicPieces = Array.isArray(publicPiecesResponse) ? publicPiecesResponse : [];
        setGalleryPieces(publicPieces);
        setPortfolio(null);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load gallery content');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, apiClient]);

  // FIXED: Now uses the type parameter properly
  const createPortfolio = useCallback(async (kind: PortfolioKind) => {
    try {
      // Generate appropriate bio based on portfolio kind
      const bios = {
        creative: 'Welcome to my creative portfolio. I\'m excited to share my artistic journey and showcase my creative works.',
        hybrid: 'Welcome to my portfolio. Here you\'ll find both my professional achievements and creative projects.',
        professional: 'Welcome to my professional portfolio. Explore my career achievements, skills, and experience.',
        educational: 'Welcome to my learning portfolio. Follow my educational journey and academic progress.'
      };

      const taglines = {
        creative: 'Sharing my creative journey',
        hybrid: 'Balancing creativity and professionalism',
        professional: 'Building excellence through experience',
        educational: 'Learning and growing every day'
      };

      const newPortfolio = await apiClient.portfolio.create({
        title: `${user?.name || 'My'} Portfolio`,
        bio: bios[kind],
        kind: kind, // FIXED: Now uses the actual kind parameter
        visibility: 'public',
        specializations: [],
        tags: [],
        tagline: taglines[kind],
        settings: {
          allowComments: true,
          showStats: true,
        }
      });
      
      setPortfolio(newPortfolio);
      return newPortfolio;
    } catch (err) {
      console.error('Error creating portfolio:', err);
      throw err;
    }
  }, [apiClient, user?.name]);

  const refreshData = useCallback((mode: GalleryMode) => {
    return fetchData(mode);
  }, [fetchData]);

  return {
    galleryPieces,
    collections,
    portfolio,
    loading,
    error,
    fetchData,
    createPortfolio,
    refreshData,
    setGalleryPieces
  };
};

// Filter and search logic hook
export const useGalleryFilters = (galleryPieces: GalleryPiece[]) => {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: null,
    selectedTags: new Set(),
    priceRange: { min: 0, max: 10000 },
    sortBy: 'newest' as SortOption
  });

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(filterState.searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterState.searchQuery]);

  // Get available tags
  const availableTags = useMemo(() => 
    Array.from(new Set(galleryPieces.flatMap(item => item.tags || []))),
    [galleryPieces]
  );

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = galleryPieces;

    // Apply search filter
    if (debouncedSearchQuery) {
      items = items.filter(item =>
        item.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterState.selectedCategory) {
      items = items.filter(item => item.category === filterState.selectedCategory);
    }

    // Apply tag filter
    if (filterState.selectedTags.size > 0) {
      items = items.filter(item =>
        item.tags?.some(tag => filterState.selectedTags.has(tag))
      );
    }

    // Apply price filter
    items = items.filter(item => {
      if (item.price) {
        return item.price >= filterState.priceRange.min && item.price <= filterState.priceRange.max;
      }
      return true;
    });

    // Sort items
    items.sort((a, b) => {
      switch (filterState.sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'popular':
          return (b.views + b.likes) - (a.views + a.likes);
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return items;
  }, [galleryPieces, debouncedSearchQuery, filterState]);

  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilterState(prev => {
      const newTags = new Set(prev.selectedTags);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return { ...prev, selectedTags: newTags };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState({
      searchQuery: '',
      selectedCategory: null,
      selectedTags: new Set(),
      priceRange: { min: 0, max: 10000 },
      sortBy: 'newest'
    });
  }, []);

  const hasActiveFilters = filterState.selectedCategory || 
    filterState.selectedTags.size > 0 || 
    filterState.searchQuery.length > 0;

  return {
    filterState,
    filteredItems,
    availableTags,
    updateFilter,
    toggleTag,
    clearFilters,
    hasActiveFilters
  };
};

// Bulk actions hook
export const useBulkActions = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  const apiClient = useApiClient();

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      return newSelection;
    });
  }, []);

  const selectAll = useCallback((itemIds: string[]) => {
    setSelectedItems(new Set(itemIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setBulkActionMode(false);
  }, []);

  const handleBulkAction = useCallback(async (action: BulkAction) => {
    if (selectedItems.size === 0) return;

    try {
      switch (action) {
        case 'delete':
          if (confirm(`Delete ${selectedItems.size} items?`)) {
            // TODO: Implement bulk delete when API supports it
            console.log('Bulk delete not yet implemented');
          }
          break;
        case 'visibility':
          // TODO: Show visibility modal
          console.log('Visibility change not yet implemented');
          break;
        case 'collection':
          // TODO: Show collection modal
          console.log('Collection assignment not yet implemented');
          break;
        case 'download':
          // TODO: Implement bulk download
          console.log('Bulk download not yet implemented');
          break;
      }
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
    }
  }, [selectedItems]);

  return {
    selectedItems,
    bulkActionMode,
    setBulkActionMode,
    toggleItemSelection,
    selectAll,
    clearSelection,
    handleBulkAction
  };
};

// Upload functionality hook
export const useImageUpload = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const apiClient = useApiClient();

  const addFiles = useCallback((files: File[]) => {
    const newFiles: UploadFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending'
    }));
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const uploadImagesWithProgress = useCallback(async (portfolioId: string): Promise<GalleryPiece[]> => {
    if (uploadFiles.length === 0) return [];

    setIsUploading(true);
    const uploadedPieces: GalleryPiece[] = [];

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const uploadFile = uploadFiles[i];
        
        // Update file status
        setUploadFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'uploading' };
          return newFiles;
        });

        try {
          // Use portfolio API for upload
          const uploadData = {
            file: uploadFile.file,
            title: uploadFile.file.name.replace(/\.[^/.]+$/, ""),
            description: '',
            category: 'digital',
            tags: [],
            visibility: 'public' as const
          };

          // Use portfolio batch upload API
          const result = await apiClient.portfolio.batchUploadGallery(
            [uploadData],
            (completed: number, total: number) => {
              const progress = (completed / total) * 100;
              setUploadFiles(prev => {
                const newFiles = [...prev];
                newFiles[i] = { ...newFiles[i], progress };
                return newFiles;
              });
            }
          );

          if (result && result.successful.length > 0) {
            uploadedPieces.push(result.successful[0]);
          } else if (result && result.failed.length > 0) {
            throw new Error(result.failed[0].error);
          }

          // Update file status to success
          setUploadFiles(prev => {
            const newFiles = [...prev];
            newFiles[i] = { ...newFiles[i], status: 'success', progress: 100 };
            return newFiles;
          });

        } catch (error) {
          // Update file status to error
          setUploadFiles(prev => {
            const newFiles = [...prev];
            newFiles[i] = { 
              ...newFiles[i], 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            };
            return newFiles;
          });
        }

        // Update overall progress
        setUploadProgress(((i + 1) / uploadFiles.length) * 100);
      }

      return uploadedPieces;
    } finally {
      setIsUploading(false);
    }
  }, [uploadFiles, apiClient]);

  const resetUpload = useCallback(() => {
    uploadFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setUploadFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
  }, [uploadFiles]);

  return {
    uploadFiles,
    uploadProgress,
    isUploading,
    addFiles,
    removeFile,
    uploadImagesWithProgress,
    resetUpload
  };
};