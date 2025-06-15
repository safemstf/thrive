// src/types/portfolio.types.ts

import { BaseEntity } from './educational.types';
import { GalleryPiece } from './gallery.types';

// ==================== Core Types ====================
export type PortfolioVisibility = 'public' | 'private' | 'unlisted';
export type PortfolioStatus = 'active' | 'inactive' | 'suspended';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

// ==================== Main Portfolio Interface ====================
export interface Portfolio extends BaseEntity {
  // Basic Info
  userId: string;
  username: string;
  title: string;
  tagline?: string;
  bio: string;
  
  // Images
  profileImage?: string;
  coverImage?: string;
  
  // Visibility & Access
  visibility: PortfolioVisibility;
  status: PortfolioStatus;
  shareToken?: string;
  customUrl?: string; // e.g., /portfolio/john-doe
  
  // Professional Info
  location?: string;
  yearsOfExperience?: number;
  specializations: string[];
  tags: string[];
  
  // Social & Contact
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    behance?: string;
  };
  contactEmail?: string;
  showContactInfo: boolean;
  
  // Settings
  settings: PortfolioSettings;
  
  // Stats
  stats: PortfolioStats;
  
  // Metadata
  lastActiveAt?: Date;
  featuredPieces?: string[]; // IDs of featured gallery pieces
}

// ==================== Portfolio Settings ====================
export interface PortfolioSettings {
  // Review Settings
  allowReviews: boolean;
  requireReviewApproval: boolean;
  allowAnonymousReviews: boolean;
  
  // Display Settings
  showStats: boolean;
  showPrices: boolean;
  defaultGalleryView: 'grid' | 'masonry' | 'list';
  piecesPerPage: number;
  
  // Notification Settings
  notifyOnReview: boolean;
  notifyOnView: boolean;
  weeklyAnalyticsEmail: boolean;
}

// ==================== Portfolio Stats ====================
export interface PortfolioStats {
  totalViews: number;
  uniqueVisitors: number;
  totalPieces: number;
  totalReviews: number;
  averageRating?: number;
  responseRate?: number;
  responseTime?: string; // e.g., "within 24 hours"
  
  // Time-based stats
  viewsThisWeek: number;
  viewsThisMonth: number;
  
  // Engagement
  shareCount: number;
  savedCount: number;
}

// ==================== Review System ====================
export interface PortfolioReview extends BaseEntity {
  portfolioId: string;
  portfolioUserId: string; // Denormalized for queries
  
  // Reviewer Info
  reviewerId?: string; // Optional for anonymous
  reviewerName: string;
  reviewerEmail?: string;
  reviewerPortfolioId?: string; // If reviewer has portfolio
  
  // Review Content
  rating: number; // 1-5 stars
  title?: string;
  comment: string;
  
  // Categorized Ratings (optional)
  ratings?: {
    creativity?: number;
    technique?: number;
    presentation?: number;
    professionalism?: number;
  };
  
  // Status
  status: ReviewStatus;
  isAnonymous: boolean;
  isVerifiedPurchase?: boolean;
  
  // Response
  artistResponse?: {
    comment: string;
    respondedAt: Date;
  };
  
  // Metadata
  helpfulCount: number;
  reportCount: number;
  ipAddress?: string; // For spam prevention
}

// ==================== Analytics & Tracking ====================
export interface PortfolioView {
  id: string;
  portfolioId: string;
  
  // Viewer Info
  viewerId?: string;
  ipAddress: string;
  userAgent: string;
  
  // Source
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Behavior
  duration: number; // seconds
  piecesViewed: number;
  actionsPerformed: string[]; // ['viewed_gallery', 'clicked_contact', etc]
  
  // Metadata
  timestamp: Date;
  location?: {
    country?: string;
    city?: string;
  };
}

export interface PortfolioAnalytics {
  portfolioId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  
  // Overview
  totalViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  
  // Traffic Sources
  trafficSources: {
    direct: number;
    social: number;
    search: number;
    referral: number;
  };
  
  // Top Referrers
  topReferrers: Array<{
    source: string;
    count: number;
  }>;
  
  // Engagement
  pieceViews: Array<{
    pieceId: string;
    views: number;
  }>;
  
  // Demographics
  viewerLocations: Array<{
    country: string;
    count: number;
  }>;
  
  // Conversion
  contactClicks: number;
  shareClicks: number;
  socialLinkClicks: Record<string, number>;
}

// ==================== API DTOs ====================
export interface CreatePortfolioDto {
  title: string;
  tagline?: string;
  bio: string;
  visibility: PortfolioVisibility;
  specializations: string[];
  tags: string[];
  settings?: Partial<PortfolioSettings>;
}

export interface UpdatePortfolioDto extends Partial<CreatePortfolioDto> {
  location: string | number | readonly string[] | undefined;
  profileImage?: string;
  coverImage?: string;
  socialLinks?: Portfolio['socialLinks'];
  contactEmail?: string;
  showContactInfo?: boolean;
  customUrl?: string;
  featuredPieces?: string[];
}

export interface CreateReviewDto {
  rating: number;
  title?: string;
  comment: string;
  ratings?: PortfolioReview['ratings'];
  isAnonymous?: boolean;
  reviewerName?: string;
}

export interface PortfolioFilters {
  visibility?: PortfolioVisibility;
  status?: PortfolioStatus;
  specializations?: string[];
  tags?: string[];
  location?: string;
  minRating?: number;
  hasReviews?: boolean;
  search?: string;
  sortBy?: 'recent' | 'rating' | 'views' | 'reviews';
  sortOrder?: 'asc' | 'desc';
}

// ==================== Response Types ====================
export interface PortfolioWithPieces extends Portfolio {
  pieces: GalleryPiece[];
  pieceCount: number;
}

export interface PortfolioListResponse {
  portfolios: Portfolio[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ReviewListResponse {
  reviews: PortfolioReview[];
  total: number;
  averageRating: number;
  ratingDistribution: Record<number, number>; // { 5: 10, 4: 5, ... }
}

// ==================== Share & Access Types ====================
export interface PortfolioShareLink {
  id: string;
  portfolioId: string;
  token: string;
  expiresAt?: Date;
  maxViews?: number;
  currentViews: number;
  createdBy: string;
  createdAt: Date;
}

export interface PortfolioAccess {
  portfolioId: string;
  userId: string;
  accessLevel: 'view' | 'comment' | 'edit';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

// ==================== Utility Types ====================
export interface PortfolioSaveState {
  userId: string;
  portfolioId: string;
  savedAt: Date;
  collections?: string[]; // User's collection names
}

export interface PortfolioReport {
  id: string;
  portfolioId: string;
  reporterId: string;
  reason: 'spam' | 'inappropriate' | 'copyright' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}