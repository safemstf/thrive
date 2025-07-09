// src/components/gallery/utils/index.ts

import { GalleryPiece, GalleryFilters, GalleryVisibility } from '@/types/gallery.types';

// ==================== Constants ====================
export const GALLERY_CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  MAX_FILE_SIZE_MB: 10,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  THUMBNAIL_SIZE: { width: 400, height: 400 },
  IMAGE_QUALITY: 0.9,
  MAX_UPLOAD_FILES: 10,
};

export const VISIBILITY_CONFIG = {
  public: {
    label: 'Public',
    description: 'Anyone can view this',
    icon: 'Globe',
    color: '#10b981'
  },
  unlisted: {
    label: 'Unlisted', 
    description: 'Only people with the link',
    icon: 'Link',
    color: '#3b82f6'
  },
  private: {
    label: 'Private',
    description: 'Only you can view this',
    icon: 'Lock',
    color: '#6b7280'
  }
};

// ==================== Image Processing ====================
export const validateImage = (
  file: File, 
  maxSizeMB: number = GALLERY_CONSTANTS.MAX_FILE_SIZE_MB,
  acceptedTypes: string[] = GALLERY_CONSTANTS.ACCEPTED_IMAGE_TYPES
) => {
  const errors: string[] = [];
  
  if (!acceptedTypes.includes(file.type)) {
    errors.push(`File type not supported. Accepted: ${acceptedTypes.join(', ')}`);
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File too large. Maximum size: ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generatePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const compressImage = async (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = GALLERY_CONSTANTS.IMAGE_QUALITY
): Promise<File> => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Calculate new dimensions
  let { width, height } = bitmap;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width *= ratio;
    height *= ratio;
  }
  
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(bitmap, 0, 0, width, height);
  
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(new File([blob!], file.name, { type: file.type }));
      },
      file.type,
      quality
    );
  });
};

// ==================== Gallery Helpers ====================
export const filterGalleryPieces = (
  pieces: GalleryPiece[],
  filters: GalleryFilters
): GalleryPiece[] => {
  return pieces.filter(piece => {
    // Visibility filter
    if (filters.visibility !== 'all' && piece.visibility !== filters.visibility) {
      return false;
    }
    
    // Status filter
    if (filters.status && piece.status !== filters.status) {
      return false;
    }
    
    // Tags filter
    if (filters.tags?.length && !filters.tags.some(tag => piece.tags?.includes(tag))) {
      return false;
    }
    
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        piece.title.toLowerCase().includes(query) ||
        piece.artist?.toLowerCase().includes(query) ||
        piece.description?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
};

export const sortGalleryPieces = (
  pieces: GalleryPiece[],
  sortBy: 'date' | 'title' | 'price' | 'displayOrder' = 'displayOrder',
  order: 'asc' | 'desc' = 'asc'
): GalleryPiece[] => {
  const sorted = [...pieces].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'price':
        return (a.price || 0) - (b.price || 0);
      case 'displayOrder':
      default:
        return a.displayOrder - b.displayOrder;
    }
  });
  
  return order === 'desc' ? sorted.reverse() : sorted;
};

export const canUserEditPiece = (
  piece: GalleryPiece,
  userId?: string,
  userRole?: string
): boolean => {
  if (!userId) return false;
  if (userRole === 'admin') return true;
  return piece.ownerId === userId;
};

export const getShareUrl = (piece: GalleryPiece): string => {
  if (piece.visibility === 'public') {
    return `${window.location.origin}/gallery/${piece.id}`;
  }
  return `${window.location.origin}/gallery/shared/${piece.shareToken}`;
};

// ==================== Grid Layout Helpers ====================
export const getGridItemSize = (
  size: string,
  layout: 'grid' | 'masonry' | 'list'
): string => {
  if (layout === 'list') return '';
  
  const sizeMap = {
    tiny: '1',
    small: '1',
    medium: '2',
    large: '3'
  };
  
  return `span ${sizeMap[size as keyof typeof sizeMap] || '1'}`;
};

export const getMasonryColumns = (windowWidth: number): number => {
  if (windowWidth < 640) return 1;
  if (windowWidth < 1024) return 2;
  if (windowWidth < 1536) return 3;
  return 4;
};

// ==================== API Helpers ====================
export const buildGalleryQueryParams = (
  filters: GalleryFilters,
  page: number = 1,
  limit: number = GALLERY_CONSTANTS.ITEMS_PER_PAGE
): URLSearchParams => {
  const params = new URLSearchParams();

  params.append('page',  page.toString());
  params.append('limit', limit.toString());

  if (filters.visibility !== 'all') {
    params.append('visibility', filters.visibility);
  }

  if (filters.status) {
    params.append('status', filters.status);
  }

  if (filters.tags?.length) {
    params.append('tags', filters.tags.join(','));
  }

  if (filters.searchQuery) {
    params.append('q', filters.searchQuery);
  }

  // ← NEW: only append owner if it's defined
  if (filters.owner) {
    params.append('owner', filters.owner);
  }

  return params;
};

// ==================== Batch Operations ====================
export const batchUpdateVisibility = async (
  pieceIds: string[],
  visibility: GalleryVisibility
): Promise<void> => {
  // Import the api utilities from the main api-client file
  const { api } = await import('@/lib/api-client');
  
  // Get the gallery client instance through the API utilities
  const galleryClient = api.gallery;
  
  // Since the gallery client doesn't have batchUpdateVisibility in the api utilities,
  // we need to get the actual client instance
  const { getApiClient } = await import('@/lib/api-client');
  const client = getApiClient();
  
  return client.gallery.batchUpdateVisibility(pieceIds, visibility);
};

export const batchDeletePieces = async (pieceIds: string[]): Promise<void> => {
  // Import and use the API client properly
  const { getApiClient } = await import('@/lib/api-client');
  const client = getApiClient();
  
  return client.gallery.batchDeletePieces(pieceIds);
};