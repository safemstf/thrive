// src/types/gallery.types.ts
import { BackendGalleryPiece, BaseEntity } from './base.types';

// === Core Unions & Types ===
export type GalleryVisibility = 'public' | 'private' | 'unlisted';
export type GalleryLayout     = 'grid' | 'masonry' | 'list';
export type GalleryStatus     = 'available' | 'sold' | 'exhibition' | 'not-for-sale';

export type ArtworkSize     = 'tiny' | 'small' | 'medium' | 'large';
export type ArtworkCategory = 'portrait' | 'landscape' | 'abstract' | 'series' | 'mixed-media';
export type ArtworkStatus   = GalleryStatus;

// Local component types
export type ViewLayout = GalleryLayout;
export type GalleryMode = 'public' | 'portfolio';
export type BulkAction = 'delete' | 'visibility' | 'download' | 'collection';

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

// === Backend Gallery Piece Type ===
export interface GalleryResponse {
  galleryPieces: BackendGalleryPiece[];
  total: number;
  page: number;
  limit: number;
}

// === New Types for API ===
export interface GalleryPieceCreateData {
  // required minimum
  title: string;
  imageUrl: string;

  // optional extras (form may omit these)
  description?: string;
  category?: string;
  medium?: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'unlisted';
  year?: number;
  displayOrder?: number;

  // optional business fields
  artist?: string;
  price?: number;

  // attach to a portfolio when needed
  portfolioId?: string;
}

export interface GalleryPieceResponse {
  success: boolean;
  galleryPiece: BackendGalleryPiece;
  portfolioId?: string;
  message?: string;
  error?: string;
  code?: string;
  data?: {
    galleryPiece?: BackendGalleryPiece;
  };
}

export interface APIErrorExtended extends Error {
  status?: number;
  code?: string;
  details?: Array<{ field: string; message: string }>;
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

  // Portfolio/Social Features
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
export interface GalleryHeaderProps {
  galleryMode: GalleryMode;
  setGalleryMode: (mode: GalleryMode) => void;
  viewLayout: ViewLayout;
  setViewLayout: (layout: ViewLayout) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedTags: Set<string>;
  toggleTag: (tag: string) => void;
  bulkActionMode: boolean;
  setBulkActionMode: (mode: boolean) => void;
  hasCreativeCapability: boolean;
  onUpload: () => void;
  isAuthenticated: boolean;
  portfolio?: any; // Import Portfolio type from portfolio.types if needed
  galleryPieces: GalleryPiece[];
  filteredItemsCount: number;
}

export interface GalleryGridProps {
  items: GalleryPiece[];
  viewLayout: ViewLayout;
  loading: boolean;
  error: string | null;
  galleryMode: GalleryMode;
  bulkActionMode: boolean;
  selectedItems: Set<string>;
  onItemSelect: (itemId: string) => void;
  onRetry: () => void;
  hasCreativeCapability: boolean;
  onUpload: () => void;
  searchQuery: string;
  selectedTags: Set<string>;
  selectedCategory: string | null;
  portfolio?: any; // Import Portfolio type from portfolio.types if needed
}

export interface BulkActionBarProps {
  selectedItems: Set<string>;
  onBulkAction: (action: BulkAction) => void;
  onCancel: () => void;
}

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

// === Upload Modal Types ===
export interface ArtworkUploadModalProps {
  portfolioId?: string;
  onClose: () => void;
  onSuccess: (galleryPiece?: BackendGalleryPiece) => void;
  initialFiles?: GalleryUploadFile[];
}

// === Batch Upload Result ===
export interface BatchUploadResult {
  successful: GalleryPiece[];
  failed: Array<{ error: string; fileName: string }>;
}