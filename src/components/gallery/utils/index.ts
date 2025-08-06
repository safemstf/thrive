// src/components/gallery/utils/index.ts

import { 
  GalleryPiece, 
  GalleryFilters, 
  GalleryVisibility,
  GalleryQueryParams 
} from '@/types/gallery.types';

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

  if (filters.owner) {
    params.append('owner', filters.owner);
  }

  return params;
};

// ==================== PORTFOLIO-CENTRIC GALLERY API ====================
import { api } from '@/lib/api-client';

/**
 * PORTFOLIO API - GALLERY MANAGEMENT
 * All user-specific gallery operations go through the portfolio API
 */

/**
 * Create a new gallery piece through portfolio
 * This ensures the piece is properly linked to the user's portfolio
 */
export const createGalleryPiece = async (
  file: File,
  metadata: Record<string, any>
) => {
  try {
    // First upload the image
    const uploadResponse = await api.portfolio.images.uploadRaw(createFormData(file));
    
    // Then create the gallery piece using the uploaded URL
    const pieceData = {
      title: metadata.title,
      description: metadata.description,
      imageUrl: uploadResponse.url,
      category: metadata.category,
      medium: metadata.medium,
      tags: metadata.tags,
      visibility: metadata.visibility,
      year: metadata.year,
      displayOrder: metadata.displayOrder
    };
    
    const result = await api.portfolio.gallery.add(pieceData);
    console.log('[Portfolio/Gallery] Created new piece:', result);
    return result;
  } catch (error) {
    console.error('[Portfolio/Gallery] Failed to create piece:', error);
    throw error;
  }
};

// Helper to create FormData for file upload
const createFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

/**
 * Update a gallery piece through portfolio
 * TODO: Implement /portfolios/me/gallery/:pieceId endpoint with PUT method
 */
export const updateGalleryPiece = async (
  pieceId: string,
  updates: Partial<GalleryPiece>
) => {
  try {
    const result = await api.portfolio.gallery.update(pieceId, updates);
    console.log('[Portfolio/Gallery] Updated piece:', pieceId);
    return result;
  } catch (error) {
    console.error('[Portfolio/Gallery] Failed to update piece:', error);
    throw error;
  }
};

/**
 * Delete a single gallery piece through portfolio
 * Uses portfolio API to maintain consistency
 */
export const deleteGalleryPiece = async (pieceId: string) => {
  try {
    const result = await api.portfolio.gallery.delete(pieceId);
    console.log(`[Portfolio/Gallery] Deleted piece ${pieceId}`);
    return result;
  } catch (error) {
    console.error('[Portfolio/Gallery] Failed to delete piece:', error);
    throw error;
  }
};

/**
 * Batch delete multiple gallery pieces through portfolio
 * Efficiently removes multiple pieces while maintaining portfolio integrity
 */
export const batchDeletePieces = async (pieceIds: string[]) => {
  try {
    const result = await api.portfolio.gallery.batchDelete(pieceIds);
    console.log(`[Portfolio/Gallery] Batch deleted ${pieceIds.length} pieces`);
    return result;
  } catch (error) {
    console.error('[Portfolio/Gallery] Failed to batch delete pieces:', error);
    throw error;
  }
};
/**
 * Update visibility for a single gallery piece through portfolio
 */
export const updatePieceVisibility = async (
  pieceId: string, 
  visibility: GalleryVisibility
) => {
  try {
    const result = await api.portfolio.gallery.update(pieceId, { visibility });
    console.log(`[Portfolio/Gallery] Updated piece ${pieceId} visibility to: ${visibility}`);
    return result;
  } catch (error) {
    console.error('[Portfolio/Gallery] Failed to update piece visibility:', error);
    throw error;
  }
};

/**
 * Batch update visibility for multiple gallery pieces through portfolio
 */
export const batchUpdateVisibility = async (
  pieceIds: string[], 
  visibility: GalleryVisibility
) => {
  try {
    const result = await api.portfolio.gallery.batchUpdateVisibility(pieceIds, visibility);
    console.log(`[Portfolio/Gallery] Updated ${pieceIds.length} pieces visibility to: ${visibility}`);
    return result;
  } catch (error) {
    console.error('[Portfolio/Gallery] Failed to batch update visibility:', error);
    throw error;
  }
};

/**
 * Delete a gallery piece with user confirmation
 */
export const deleteGalleryPieceWithConfirmation = async (
  pieceId: string,
  pieceName?: string
): Promise<boolean> => {
  const message = pieceName 
    ? `Are you sure you want to delete "${pieceName}"? This action cannot be undone.`
    : 'Are you sure you want to delete this artwork? This action cannot be undone.';
    
  if (!window.confirm(message)) {
    return false;
  }
  
  try {
    await deleteGalleryPiece(pieceId);
    return true;
  } catch (error) {
    // You might want to show a toast or notification here
    alert('Failed to delete artwork. Please try again.');
    return false;
  }
};

/**
 * Helper to check if pieces can be deleted
 */
export const checkDeletablePieces = (
  pieces: Array<{ id: string; ownerId: string }>,
  userId?: string
): { deletable: string[]; nonDeletable: string[] } => {
  if (!userId) {
    return { deletable: [], nonDeletable: pieces.map(p => p.id) };
  }
  
  const deletable: string[] = [];
  const nonDeletable: string[] = [];
  
  pieces.forEach(piece => {
    if (piece.ownerId === userId) {
      deletable.push(piece.id);
    } else {
      nonDeletable.push(piece.id);
    }
  });
  
  return { deletable, nonDeletable };
};

/**
 * Get user's own gallery pieces through portfolio
 * TODO: Implement /portfolios/me/gallery endpoint with GET method
 */
export const getMyGalleryPieces = async (params?: GalleryQueryParams) => {
  try {
    // Use the new portfolio gallery endpoint
    const result = await api.portfolio.gallery.get();
    console.log('[Portfolio/Gallery] Fetched user pieces:', result.length);
    return {
      pieces: result,
      total: result.length,
      page: 1,
      limit: result.length
    };
  } catch (error) {
    console.error('[Portfolio/Gallery] Failed to fetch user pieces:', error);
    throw error;
  }
};