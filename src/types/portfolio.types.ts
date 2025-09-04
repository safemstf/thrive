// src/types/portfolio.types.ts 
// Unified portfolio types including educational functionality

import { BackendGalleryPiece } from './base.types';
import { 
  GalleryPiece, 
  GalleryVisibility,
  GalleryLayout,
  GalleryStatus,
  ArtworkSize,
  ArtworkCategory,
  ArtworkStatus,
  ViewLayout,
  GalleryMode,
  BulkAction,
  GalleryHeaderProps,
  GalleryGridProps,
  BulkActionBarProps,
  Exhibition,
  Publication,
  GalleryResponse,
  GalleryPieceCreateData,
  GalleryPieceResponse,
  APIErrorExtended,
  GalleryCollection,
  Artist,
  GalleryApiResponse,
  GalleryFilters,
  GalleryQueryParams,
  GalleryUploadFile,
  GalleryUploadOptions,
  GalleryViewConfig,
  GalleryPermissions,
  GalleryStats,
  GalleryUpload,
  GalleryItemProps,
  GalleryModalProps,
  ArtworkUploadModalProps,
  BatchUploadResult
} from './gallery.types';

// ==================== Base Types ====================
export interface BaseEntity {
  id?: string;      // Frontend normalized ID
  _id?: string;     // MongoDB ObjectId
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
export type ScientificDiscipline = 'physics' | 'chemistry' | 'biology';

// Learning content structures
export interface Example {
  id?: string;
  expression: string;
  solution?: string;
  steps?: string[];
  visual?: string; // URL or diagram reference
}

export interface Strategy {
  id?: string;
  title: string;
  description: string;
  whenToUse?: string;
}

export interface Formula {
  id?: string;
  symbol: string;
  name: string;
  latex?: string;
  units?: string;
  description?: string;
}

export interface Rule {
  id?: string;
  name: string;
  statement: string;
  symbol?: string;
  exceptions?: string[];
}

export interface CommonError {
  id?: string;
  error: string;
  correct: string;
  explanation?: string;
}

// Subject-specific learning content
export interface MathConcept {
  id: string;
  topic: string;
  formula?: Formula;
  rules: Rule[];
  examples: Example[];
  strategies: Strategy[];
  commonErrors?: CommonError[];
  difficultyLevels?: {
    [K in DifficultyLevel]?: {
      description: string;
      examples: Example[];
      practiceProblems?: string[];
    };
  };
}

export interface ScienceConcept {
  id: string;
  topic: string;
  discipline: ScientificDiscipline;
  principle: string;
  formulas?: Formula[];
  laws?: Rule[];
  examples: Example[];
  applications: string[];
  labSkills?: string[];
  commonMistakes?: CommonError[];
}

export interface GrammarRule {
  id: string;
  topic: string;
  rule: Rule;
  examples: Example[];
  exceptions?: string[];
  commonErrors: CommonError[];
}

export interface LiteraryDevice {
  id: string;
  name: string;
  definition: string;
  symbol?: string;
  examples: Example[];
  effect: string;
}

export interface WritingStructure {
  id: string;
  type: string; // essay, paragraph, sentence
  components: {
    name: string;
    purpose: string;
    examples: string[];
  }[];
  transitions?: string[];
}

// Learning content union type
export interface LearningContent {
  mathConcepts?: MathConcept[];
  scienceConcepts?: ScienceConcept[];
  grammarRules?: GrammarRule[];
  literaryDevices?: LiteraryDevice[];
  writingStructures?: WritingStructure[];
}

// Concept and progress tracking
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

export interface ConceptFilters {
  type?: string;
  discipline?: string;
  difficulty?: DifficultyLevel;
  bookId?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  mainCategory?: MainCategory;
  subCategory?: SubCategory;
  scientificDiscipline?: ScientificDiscipline;
}

// Educational resources
export interface Book extends BaseEntity {
  title: string;
  subtitle?: string;
  year: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  scientificDiscipline?: ScientificDiscipline;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  icon?: string; // Icon identifier
  excerpt: string;
  description: string;
  learningContent: LearningContent;
  metadata?: {
    gradeLevel?: string[];
    prerequisites?: string[];
    duration?: string;
    lastUpdated?: Date;
  };
}

export interface BookQueryParams {
  mainCategory?: MainCategory;
  subCategory?: SubCategory;
  scientificDiscipline?: ScientificDiscipline;
  difficulty?: DifficultyLevel;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  year?: string;
  gradeLevel?: string[];
}

// Section configuration for UI
export interface SectionConfig {
  key: string;
  title: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  disciplines?: ScientificDiscipline[];
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
    etsy?: string;
    youtube?: string;
    pinterest?: string;
    spotify?: string;
    soundcloud?: string;
  };
  contactEmail?: string;
  showContactInfo: boolean;
  
  // Settings
  settings: PortfolioSettings;
  
  // Stats
  stats: PortfolioStats;
  gradient?: string;
  icon?: React.ReactNode;
  
  // Educational Content (for educational/hybrid portfolios)
  conceptProgress?: ConceptProgress[];
  learningGoals?: string[];
  currentBooks?: string[]; // Book IDs
  completedBooks?: string[]; // Book IDs
  
  // Metadata
  lastActiveAt?: Date;
  featuredPieces?: string[]; // IDs of featured gallery pieces
}

// ==================== Portfolio Settings ====================
export interface PortfolioSettings {
  // Review Settings
  allowReviews: boolean;
  allowComments?: boolean;
  requireReviewApproval: boolean;
  allowAnonymousReviews: boolean;
  
  // Display Settings
  showStats: boolean;
  showPrices: boolean;
  defaultGalleryView: 'grid' | 'masonry' | 'list';
  piecesPerPage: number;
  
  // Educational Settings (for educational/hybrid portfolios)
  showProgress?: boolean;
  publicProgress?: boolean;
  showCertifications?: boolean;
  trackLearningTime?: boolean;
  
  // Notification Settings
  notifyOnReview: boolean;
  notifyOnView: boolean;
  weeklyAnalyticsEmail: boolean;
  notifyOnConceptCompletion?: boolean;
  weeklyProgressEmail?: boolean;
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
  
  // Educational Stats (for educational/hybrid portfolios)
  totalConcepts?: number;
  completedConcepts?: number;
  inProgressConcepts?: number;
  totalLearningHours?: number;
  averageScore?: number;
  streakDays?: number;
  certificationsEarned?: number;
}

// ==================== Backend/Frontend Conversion Utilities ====================

/**
 * Convert backend portfolio data to frontend format
 * Handles ID normalization and date parsing
 */
export function portfolioFromBackend(backendData: any): Portfolio {
  if (!backendData) {
    throw new Error('Portfolio data is required');
  }

  // Handle default values for required fields
  const portfolio: Portfolio = {
    // ID handling - prefer _id from MongoDB, fallback to id
    id: backendData._id || backendData.id,
    _id: backendData._id,
    
    // Basic required fields with defaults
    userId: backendData.userId || backendData.user_id || '',
    username: backendData.username || '',
    title: backendData.title || 'Untitled Portfolio',
    bio: backendData.bio || '',
    kind: backendData.kind || 'creative',
    visibility: backendData.visibility || 'public',
    status: backendData.status || 'active',
    
    // Optional fields
    name: backendData.name,
    tagline: backendData.tagline,
    profileImage: backendData.profileImage || backendData.profile_image,
    coverImage: backendData.coverImage || backendData.cover_image,
    shareToken: backendData.shareToken || backendData.share_token,
    customUrl: backendData.customUrl || backendData.custom_url,
    location: backendData.location,
    yearsOfExperience: backendData.yearsOfExperience || backendData.years_of_experience,
    
    // Arrays with defaults
    specializations: backendData.specializations || [],
    tags: backendData.tags || [],
    
    // Social links
    socialLinks: backendData.socialLinks || backendData.social_links || {},
    contactEmail: backendData.contactEmail || backendData.contact_email,
    showContactInfo: backendData.showContactInfo ?? backendData.show_contact_info ?? false,
    
    // Settings with defaults
    settings: {
      allowReviews: backendData.settings?.allowReviews ?? backendData.settings?.allow_reviews ?? true,
      allowComments: backendData.settings?.allowComments ?? backendData.settings?.allow_comments ?? true,
      requireReviewApproval: backendData.settings?.requireReviewApproval ?? backendData.settings?.require_review_approval ?? false,
      allowAnonymousReviews: backendData.settings?.allowAnonymousReviews ?? backendData.settings?.allow_anonymous_reviews ?? true,
      showStats: backendData.settings?.showStats ?? backendData.settings?.show_stats ?? true,
      showPrices: backendData.settings?.showPrices ?? backendData.settings?.show_prices ?? false,
      defaultGalleryView: backendData.settings?.defaultGalleryView ?? backendData.settings?.default_gallery_view ?? 'grid',
      piecesPerPage: backendData.settings?.piecesPerPage ?? backendData.settings?.pieces_per_page ?? 20,
      notifyOnReview: backendData.settings?.notifyOnReview ?? backendData.settings?.notify_on_review ?? true,
      notifyOnView: backendData.settings?.notifyOnView ?? backendData.settings?.notify_on_view ?? false,
      weeklyAnalyticsEmail: backendData.settings?.weeklyAnalyticsEmail ?? backendData.settings?.weekly_analytics_email ?? false,
      // Educational settings
      showProgress: backendData.settings?.showProgress ?? backendData.settings?.show_progress ?? true,
      publicProgress: backendData.settings?.publicProgress ?? backendData.settings?.public_progress ?? false,
      showCertifications: backendData.settings?.showCertifications ?? backendData.settings?.show_certifications ?? true,
      trackLearningTime: backendData.settings?.trackLearningTime ?? backendData.settings?.track_learning_time ?? true,
      notifyOnConceptCompletion: backendData.settings?.notifyOnConceptCompletion ?? backendData.settings?.notify_on_concept_completion ?? true,
      weeklyProgressEmail: backendData.settings?.weeklyProgressEmail ?? backendData.settings?.weekly_progress_email ?? false,
      ...backendData.settings
    },
    
    // Stats with defaults
    stats: {
      totalViews: backendData.stats?.totalViews ?? backendData.stats?.total_views ?? 0,
      uniqueVisitors: backendData.stats?.uniqueVisitors ?? backendData.stats?.unique_visitors ?? 0,
      totalPieces: backendData.stats?.totalPieces ?? backendData.stats?.total_pieces ?? 0,
      totalReviews: backendData.stats?.totalReviews ?? backendData.stats?.total_reviews ?? 0,
      averageRating: backendData.stats?.averageRating ?? backendData.stats?.average_rating,
      responseRate: backendData.stats?.responseRate ?? backendData.stats?.response_rate,
      responseTime: backendData.stats?.responseTime ?? backendData.stats?.response_time,
      viewsThisWeek: backendData.stats?.viewsThisWeek ?? backendData.stats?.views_this_week ?? 0,
      viewsThisMonth: backendData.stats?.viewsThisMonth ?? backendData.stats?.views_this_month ?? 0,
      shareCount: backendData.stats?.shareCount ?? backendData.stats?.share_count ?? 0,
      savedCount: backendData.stats?.savedCount ?? backendData.stats?.saved_count ?? 0,
      // Educational stats
      totalConcepts: backendData.stats?.totalConcepts ?? backendData.stats?.total_concepts ?? 0,
      completedConcepts: backendData.stats?.completedConcepts ?? backendData.stats?.completed_concepts ?? 0,
      inProgressConcepts: backendData.stats?.inProgressConcepts ?? backendData.stats?.in_progress_concepts ?? 0,
      totalLearningHours: backendData.stats?.totalLearningHours ?? backendData.stats?.total_learning_hours ?? 0,
      averageScore: backendData.stats?.averageScore ?? backendData.stats?.average_score,
      streakDays: backendData.stats?.streakDays ?? backendData.stats?.streak_days ?? 0,
      certificationsEarned: backendData.stats?.certificationsEarned ?? backendData.stats?.certifications_earned ?? 0,
      ...backendData.stats
    },
    
    // Educational content
    conceptProgress: backendData.conceptProgress || backendData.concept_progress || [],
    learningGoals: backendData.learningGoals || backendData.learning_goals || [],
    currentBooks: backendData.currentBooks || backendData.current_books || [],
    completedBooks: backendData.completedBooks || backendData.completed_books || [],
    
    // Dates
    createdAt: backendData.createdAt ? new Date(backendData.createdAt) : 
               backendData.created_at ? new Date(backendData.created_at) : undefined,
    updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt) : 
               backendData.updated_at ? new Date(backendData.updated_at) : undefined,
    lastActiveAt: backendData.lastActiveAt ? new Date(backendData.lastActiveAt) : 
                  backendData.last_active_at ? new Date(backendData.last_active_at) : undefined,
    
    // Featured pieces
    featuredPieces: backendData.featuredPieces || backendData.featured_pieces || []
  };

  return portfolio;
}

/**
 * Convert frontend portfolio data to backend format
 * Handles ID normalization and proper field naming
 */
export function portfolioToBackend(portfolio: Portfolio): any {
  if (!portfolio) {
    throw new Error('Portfolio data is required');
  }

  return {
    // Use _id for MongoDB if available, otherwise use id
    _id: portfolio._id || portfolio.id,
    
    // Core fields
    userId: portfolio.userId,
    username: portfolio.username,
    name: portfolio.name,
    title: portfolio.title,
    tagline: portfolio.tagline,
    bio: portfolio.bio,
    kind: portfolio.kind,
    
    // Images
    profileImage: portfolio.profileImage,
    coverImage: portfolio.coverImage,
    
    // Visibility & Status
    visibility: portfolio.visibility,
    status: portfolio.status,
    shareToken: portfolio.shareToken,
    customUrl: portfolio.customUrl,
    
    // Professional Info
    location: portfolio.location,
    yearsOfExperience: portfolio.yearsOfExperience,
    specializations: portfolio.specializations,
    tags: portfolio.tags,
    
    // Social & Contact
    socialLinks: portfolio.socialLinks,
    contactEmail: portfolio.contactEmail,
    showContactInfo: portfolio.showContactInfo,
    
    // Settings
    settings: portfolio.settings,
    
    // Stats
    stats: portfolio.stats,
    
    // Educational content
    conceptProgress: portfolio.conceptProgress,
    learningGoals: portfolio.learningGoals,
    currentBooks: portfolio.currentBooks,
    completedBooks: portfolio.completedBooks,
    
    // Dates - convert to ISO strings
    createdAt: portfolio.createdAt?.toISOString(),
    updatedAt: portfolio.updatedAt?.toISOString(),
    lastActiveAt: portfolio.lastActiveAt?.toISOString(),
    
    // Featured pieces
    featuredPieces: portfolio.featuredPieces
  };
}

// ==================== Utility Functions for ID Handling ====================

/**
 * Safely extract portfolio ID from either format
 * Handles both frontend (id) and backend (_id) formats
 */
export function getPortfolioId(portfolio: Portfolio | null | undefined): string | null {
  if (!portfolio) return null;
  return portfolio.id || portfolio._id || null;
}

/**
 * Safely extract gallery piece ID from either format
 * Handles both frontend (id) and backend (_id) formats
 */
export function getGalleryPieceId(piece: GalleryPiece | BackendGalleryPiece | null | undefined): string | null {
  if (!piece) return null;
  return piece.id || piece._id || null;
}

/**
 * Normalize portfolio object to have consistent ID field
 * Converts MongoDB _id to frontend-friendly id
 */
export function normalizePortfolio(portfolio: Portfolio): Portfolio {
  if (!portfolio) return portfolio;
  
  const normalized = { ...portfolio };
  
  // Ensure we have an id field
  if (!normalized.id && normalized._id) {
    normalized.id = normalized._id;
  }
  
  return normalized;
}

/**
 * Extract ID from error response during portfolio creation conflicts
 */
export function extractPortfolioIdFromError(error: any): string | null {
  // Try to extract portfolio from different possible response locations
  const possiblePaths = [
    error.response?.data?.portfolio,
    error.response?.portfolio,
    error.data?.portfolio,
    error.portfolio
  ];
  
  for (const portfolio of possiblePaths) {
    if (portfolio) {
      const id = getPortfolioId(portfolio);
      if (id) return id;
    }
  }
  
  return null;
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
  uniqueViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  averageSessionTime: number;
  bounceRate: number;
  
  // Engagement 
  engagement: number;
  engagementRate: number;
  
  // Growth
  growth: number;
  weeklyGrowth: number;
  
  // Content Performance
  topPerformingContent: Array<{
    pieceId: string;
    title: string;
    views: number;
    engagement: number;
  }>;
  
  // Geographic
  globalReach: number;
  countries: Array<{
    country: string;
    count: number;
  }>;
  
  // Time-based
  monthly: Array<{
    month: string;
    views: number;
    visitors: number;
  }>;
  monthlyViews: number;
  
  // Social & Sharing
  shares: number;
  socialShares: Record<string, number>;
  
  // Professional
  inquiries: number;
  professionalInquiries: number;
  
  // Retention
  returnRate: number;
  returnVisitorRate: number;
  
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
  
  // Piece-specific views
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
  
  // Time tracking
  sessionTime: number;
  views: number;
}

// ==================== Search Types ====================
export interface SearchFilters {
  contentType?: string;
  difficulty?: DifficultyLevel;
  mainCategory?: MainCategory;
  subCategory?: SubCategory;
  scientificDiscipline?: ScientificDiscipline;
  bookId?: string;
  tags?: string[];
  minRelevance?: number;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface SearchResult {
  bookId: string;
  bookTitle: string;
  contentType: string;
  contentId: string;
  snippet: string;
  relevanceScore: number;
  chapter?: string;
  section?: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  matchedTerms?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  filters?: SearchFilters;
  suggestions?: string[];
  relatedConcepts?: Concept[];
}

// ==================== API DTOs ====================

// Input type for usePortfolioManagement hook
export interface CreatePortfolioInput {
  title: string;
  bio?: string;
  visibility?: PortfolioVisibility;
  kind?: PortfolioKind;
  specializations?: string[];
  tags?: string[];
  location?: string;
  tagline?: string;
}

// DTO for API calls
export interface CreatePortfolioDto {
  title: string;
  tagline?: string;
  bio: string;
  visibility: PortfolioVisibility;
  kind: PortfolioKind; // Add this required field
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
  // Educational fields
  conceptProgress?: ConceptProgress[];
  learningGoals?: string[];
  currentBooks?: string[];
  completedBooks?: string[];
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
  // Educational filters
  hasProgress?: boolean;
  completionRate?: number;
  learningCategory?: MainCategory;
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
    features: ['Progress tracking', 'Concept mastery', 'Learning analytics', 'Study resources']
  },
  professional: {
    label: 'Professional Portfolio',
    description: 'Highlight your technical skills and professional experience',
    features: ['Code repositories', 'Technical projects', 'Professional timeline']
  },
  hybrid: {
    label: 'Hybrid Portfolio',
    description: 'Combine creative works with educational progress',
    features: ['Creative showcase', 'Learning progress', 'Unified dashboard', 'Mixed content types']
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

// Portfolio creation trigger types
export type CreationTrigger = 'dashboard' | 'gallery' | 'profile' | 'url' | 'manual';

// Re-export gallery types for convenience
export type {
  GalleryPiece,
  GalleryVisibility,
  GalleryLayout,
  GalleryStatus,
  ArtworkSize,
  ArtworkCategory,
  ArtworkStatus,
  ViewLayout,
  GalleryMode,
  BulkAction,
  GalleryHeaderProps,
  GalleryGridProps,
  BulkActionBarProps,
  Exhibition,
  Publication,
  GalleryResponse,
  GalleryPieceCreateData,
  GalleryPieceResponse,
  APIErrorExtended,
  GalleryCollection,
  Artist,
  GalleryApiResponse,
  GalleryFilters,
  GalleryQueryParams,
  GalleryUploadFile,
  GalleryUploadOptions,
  GalleryViewConfig,
  GalleryPermissions,
  GalleryStats,
  GalleryUpload,
  GalleryItemProps,
  GalleryModalProps,
  ArtworkUploadModalProps,
  BatchUploadResult
};