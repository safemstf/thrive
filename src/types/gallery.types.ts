// src/types/gallery.types.ts
import { BaseEntity } from './educational.types';

// === Core Unions & Types ===
export type GalleryVisibility = 'public' | 'private' | 'unlisted';
export type GalleryLayout     = 'grid' | 'masonry' | 'list';
export type GalleryStatus     = 'available' | 'sold' | 'exhibition' | 'not-for-sale';

export type ArtworkSize     = 'tiny' | 'small' | 'medium' | 'large';
export type ArtworkCategory = 'portrait' | 'landscape' | 'abstract' | 'series' | 'mixed-media';
export type ArtworkStatus   = GalleryStatus;

// === Supporting Types ===
export interface Exhibition {
  id: string;
  name: string;
  venue: string;
  location: string;
  startDate: Date;
  endDate: Date;
  curator?: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  year: string;
  pages?: string;
  isbn?: string;
}

// === Main Gallery Piece ===
export interface GalleryPiece extends BaseEntity {
  _id: string;
  title: string;
  artist: string;
  description?: string;

  // Images
  thumbnailUrl: string;
  imageUrl: string;
  highResUrl?: string;

  // Metadata & Accessibility
  alt: string;
  medium?: string;
  year?: number;
  size: ArtworkSize;
  displayOrder: number;

  // Dimensions
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: string;
  };

  // Sales/Status
  status: ArtworkStatus;
  price?: number;
  currency?: string;

  // Visibility & Permissions
  visibility: GalleryVisibility;
  ownerId: string;
  sharedWith?: string[];
  shareToken?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;

  // Tags & Categories
  tags?: string[];
  category?: ArtworkCategory;

  // Upload metadata
  uploadedBy: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;

  // Portfolio/Social Features (ADDED)
  portfolioId?: string;
  views: number;
  likes: number;
}

// === Collections & Artist Profiles ===
export interface GalleryCollection extends BaseEntity {
  name: string;
  description?: string;
  artist: string;
  pieces: string[];
  coverImage?: string;
  startYear?: string;
  endYear?: string;
  metadata?: Record<string, any>;
}

export interface Artist extends BaseEntity {
  name: string;
  bio?: string;
  profileImage?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  exhibitions?: Exhibition[];
  collections?: string[];
}

// === API Response & Pagination ===
export interface GalleryApiResponse {
  pieces: GalleryPiece[];
  total: number;
  page: number;
  pages: Array<{ pieces: GalleryPiece[] }>;
  pageSize: number;
  hasMore: boolean;
}

// === Filters & Query Params ===
export interface GalleryFilters {
  visibility: GalleryVisibility | 'all';
  status?: ArtworkStatus;
  tags?: string[];
  category?: ArtworkCategory;
  artist?: string;
  year?: number;
  priceRange?: { min: number; max: number };
  searchQuery?: string;
  owner?: string;
}

export interface GalleryQueryParams {
  page?: number;
  limit?: number;

  category?: ArtworkCategory;
  artist?: string;
  featured?: boolean;
  status?: ArtworkStatus;
  sortBy?: 'title' | 'date' | 'artist' | 'displayOrder';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tags?: string[];

  visibility?: GalleryVisibility | 'all';
  year?: number;
  priceRange?: { min: number; max: number };
}

// === UI & Admin Types ===
export interface GalleryUploadFile {
  file: File;
  id: string;
  preview?: string;
  progress: number;
  error?: string;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
}

export interface GalleryUploadOptions {
  visibility: GalleryVisibility;
  generateThumbnail: boolean;
  optimizeImages: boolean;
  preserveMetadata: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  tags?: string[];
  category?: ArtworkCategory;
}

export interface GalleryViewConfig {
  layout: GalleryLayout;
  itemsPerPage: number;
  showPrivateIndicator: boolean;
  enableSelection: boolean;
  enableQuickEdit: boolean;
}

export interface GalleryPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangeVisibility: boolean;
  canShare: boolean;
  isOwner: boolean;
}

export interface GalleryStats {
  totalPieces: number;
  totalArtists: number;
  totalCollections: number;
  piecesByCategory: Record<ArtworkCategory, number>;
  featuredCount: number;
}

export interface GalleryUpload {
  file: File;
  title: string;
  artist: string;
  category: ArtworkCategory;
  description?: string;
  dimensions?: { width: number; height: number; unit: 'px' | 'cm' | 'in' };
  metadata?: Record<string, any>;
}

// === Component Interface Types ===
export interface GalleryItemProps {
  piece: GalleryPiece;
  layout: GalleryLayout;
  isSelected?: boolean;
  showPrivateIndicator?: boolean;
  onQuickAction?: (action: 'edit' | 'delete', pieceId: string) => Promise<void>;
  priority?: boolean;
}

export interface GalleryModalProps {
  piece: GalleryPiece;
  onClose: () => void;
  onEdit?: (piece: GalleryPiece) => void;
  onDelete?: (piece: GalleryPiece) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

// === Upload Modal Types (ADDED) ===
export interface ArtworkUploadModalProps {
  portfolioId: string;
  onClose: () => void;
  onSuccess: () => void;
  initialFiles?: GalleryUploadFile[];
}

// === Batch Upload Result (ADDED) ===
export interface BatchUploadResult {
  successful: GalleryPiece[];
  failed: Array<{ error: string; fileName: string }>;
}