// types/artwork.types.ts
import { GalleryPiece, GalleryVisibility } from './gallery.types';

export type Artwork = GalleryPiece;
export type ArtworkVisibility = GalleryVisibility;

export interface CreateArtworkDto {
  title: string;
  description?: string;
  alt?: string;
  medium?: string;
  year?: number;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: string;
  };
  price?: number;
  currency?: string;
  visibility?: ArtworkVisibility;
  category?: string;
  tags?: string[];
  media: File;
}

export interface UpdateArtworkDto {
  title?: string;
  description?: string;
  alt?: string;
  medium?: string;
  year?: number;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: string;
  };
  price?: number;
  currency?: string;
  visibility?: ArtworkVisibility;
  category?: string;
  tags?: string[];
  displayOrder?: number;
}