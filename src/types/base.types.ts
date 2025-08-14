// src/types/base.types.ts
/**
 * Shared base types used across the app.
 * Keep this minimal and dependency-free so other type files can import it.
 */

export interface BaseEntity {
  /** Frontend-normalized id (string) */
  id?: string;

  /** Raw backend/Mongo id */
  _id?: string;

  /** ISO timestamp or Date */
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Shared gallery piece definition used across portfolio and gallery contexts.
 * Mirrors the Mongoose GalleryPiece schema (frontend-friendly).
 *
 * NOTE: do NOT redeclare `id` here — it's inherited from BaseEntity.
 */
export interface BackendGalleryPiece extends BaseEntity {
  portfolioId?: string; // optional so standalone gallery fetches work
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category?: string;
  medium?: string;
  tags?: string[];
  visibility: 'public' | 'private' | 'unlisted';
  year?: number;
  price?: number;
  artist?: string;
  displayOrder?: number;

  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: 'cm' | 'in' | 'mm';
  };

  metadata?: {
    fileSize?: number;
    format?: string;
    colorProfile?: string;
    uploadedAt?: string | Date;
  };

  stats?: {
    views?: number;
    likes?: number;
    saves?: number;
  };
}
