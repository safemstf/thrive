// src/types/portfolio.types.ts - Main index file for all portfolio-related types

import { GalleryPiece } from './gallery.types';

// ==================== Base Types ====================
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==================== Core Portfolio Types ====================
export type PortfolioVisibility = 'public' | 'private' | 'unlisted';
export type PortfolioStatus = 'active' | 'inactive' | 'suspended';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type PortfolioKind = 'educational' | 'hybrid' | 'creative' | 'professional';

// ==================== Educational/Learning Types ====================
export type MainCategory = 'math' | 'english' | 'science';
export type SubCategory = 'sat' | 'foundations' | 'ap';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type CategoryIcon = MainCategory | SubCategory;

export interface Concept {
  id: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  title: string;
  summary?: string;
  estimatedMinutes?: number;
}

export interface ConceptProgress {
  conceptId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt?: string;  // ISO timestamp
  completedAt?: string; // ISO timestamp
  score?: number;
  attempts?: number;
  notes?: string;
}

export interface Book extends BaseEntity {
  title: string;
  subtitle?: string;
  year: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  excerpt: string;
  description: string;
}

export interface SectionConfig {
  key: string;
  title: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
}

export const defaultSections: SectionConfig[] = [
  { key: 'sat', title: 'SAT Guides', mainCategory: 'math', subCategory: 'sat' },
  { key: 'workbooks', title: 'Workbooks', mainCategory: 'english', subCategory: 'foundations' },
  { key: 'ms-science', title: 'MS Science', mainCategory: 'science', subCategory: 'foundations' },
  { key: 'ap-science', title: 'AP Science', mainCategory: 'science', subCategory: 'ap' },
  { key: 'ap-calc', title: 'AP Calculus', mainCategory: 'math', subCategory: 'ap' }
];

// ==================== Main Portfolio Interface ====================
export interface Portfolio extends BaseEntity {
  // Basic Info
  userId: string;
  username: string;
  name?: string;

  title: string;
  tagline?: string;
  bio: string;
  kind: PortfolioKind;
  
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
    github?: string;
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
  kind?: PortfolioKind;
  specializations: string[];
  tags: string[];
  settings?: Partial<PortfolioSettings>;
}

export interface UpdatePortfolioDto extends Partial<CreatePortfolioDto> {
  location?: string;
  profileImage?: string;
  coverImage?: string;
  socialLinks?: Portfolio['socialLinks'];
  contactEmail?: string;
  showContactInfo?: boolean;
  customUrl?: string;
  featuredPieces?: string[];
  kind?: PortfolioKind;
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
  kind?: PortfolioKind;
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
  data: Portfolio[];
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

// ==================== Portfolio Kind Utilities ====================
export const PORTFOLIO_KINDS: Record<PortfolioKind, {
  label: string;
  description: string;
  features: string[];
}> = {
  creative: {
    label: 'Creative Portfolio',
    description: 'Showcase your artwork, designs, and creative projects',
    features: ['Image galleries', 'Portfolio showcase', 'Creative collections']
  },
  educational: {
    label: 'Educational Portfolio',
    description: 'Track your academic progress and learning achievements',
    features: ['Progress tracking', 'Concept mastery', 'Learning analytics']
  },
  professional: {
    label: 'Professional Portfolio',
    description: 'Highlight your technical skills and professional experience',
    features: ['Code repositories', 'Technical projects', 'Professional timeline']
  },
  hybrid: {
    label: 'Hybrid Portfolio',
    description: 'Combine creative works with educational progress',
    features: ['Creative showcase', 'Learning progress', 'Unified dashboard']
  }
};

// Helper functions for portfolio capabilities
export const hasGalleryCapability = (kind: PortfolioKind): boolean => {
  return kind === 'creative' || kind === 'hybrid' || kind === 'professional';
};

export const hasLearningCapability = (kind: PortfolioKind): boolean => {
  return kind === 'educational' || kind === 'hybrid';
};

export const canUpgrade = (currentKind: PortfolioKind): boolean => {
  return currentKind !== 'hybrid';
};