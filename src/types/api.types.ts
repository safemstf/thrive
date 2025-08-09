// src/types/api.types.ts - Clean, enhanced API types
import { DifficultyLevel, MainCategory, ScientificDiscipline, SubCategory } from "./portfolio.types";

// ==================== ROUTE DEFINITIONS ====================
export interface RouteDefinition {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  needsAuth?: boolean;
  params?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  skipInBatchTest?: boolean;
  dependsOn?: string; // For routes that need data from other routes
  
  // Enhanced tagging system for test automation and categorization
  tags?: {
    // ID and placeholder management
    needsIdGenerator?: boolean;
    placeholderIds?: string[];
    dependsOnData?: string[];
    
    // Route characteristics
    readOnly?: boolean;
    modifiesData?: boolean;
    destructive?: boolean;
    needsFileUpload?: boolean;
    batchOperation?: boolean;
    
    // Authentication and authorization
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    requiresSpecialAuth?: boolean;
    
    // Data categories
    dataCategory?: 'portfolio' | 'gallery' | 'user' | 'concept' | 'book' | 'simulation' | 'auth' | 'health';
    
    // Functional categories
    analytics?: boolean;
    settings?: boolean;
    account?: boolean;
    billing?: boolean;
    educational?: boolean;
    subscription?: boolean;
    
    // Test execution hints
    setupRoute?: boolean;
    cleanupRoute?: boolean;
    dangerousOperation?: boolean;
    requiresExistingData?: boolean;
    
    // File handling
    fileUploadType?: 'image' | 'document' | 'avatar' | 'gallery';
    
    // Special handling
    realTimeData?: boolean;
    legacyEndpoint?: boolean;
    deprecatedEndpoint?: boolean;
  };
}

export interface RouteCategory {
  name: string;
  description?: string;
  routes: RouteDefinition[];
}

// ==================== QUERY PARAMETERS ====================
export interface BookQueryParams {
  mainCategory?: MainCategory;
  subCategory?: SubCategory;
  discipline?: ScientificDiscipline;
  year?: string;
  limit?: number;
  offset?: number;
  sort?: 'title' | 'year' | 'created' | 'updated';
  order?: 'asc' | 'desc';
}

export interface SearchFilters {
  categories?: MainCategory[];
  subCategories?: SubCategory[];
  disciplines?: ScientificDiscipline[];
  difficulty?: DifficultyLevel[];
  contentTypes?: ('math' | 'science' | 'grammar' | 'literary' | 'writing')[];
}

export interface SearchResult {
  bookId: string;
  bookTitle: string;
  contentType: string;
  contentId: string;
  snippet: string;
  relevanceScore: number;
}

// ==================== USER PROGRESS ====================
export interface UserProgress {
  userId: string;
  bookId: string;
  completedConcepts: string[];
  currentConcept?: string;
  progressPercentage: number;
  lastAccessed: Date;
  notes: UserNote[];
}

export interface UserNote {
  id: string;
  conceptId: string;
  content: string;
  createdAt: Date;
}

// ==================== UTILITY FUNCTIONS ====================
export function generateUniqueUsername(): string {
  return `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

export function generateUniqueEmail(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`;
}

export function generateUniqueId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==================== COMMON FILTER TYPES ====================
export interface BaseFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface DateRangeFilter {
  startDate?: string | Date;
  endDate?: string | Date;
}

// ==================== FILE UPLOAD TYPES ====================
export interface FileUploadResponse {
  success: boolean;
  url: string;
  fileId: string;
  filename: string;
  size: number;
  contentType: string;
  message?: string;
}

export interface FileUploadConfig {
  maxFileSize: string;
  allowedTypes: string[];
  uploadPath: string;
  gridFS?: {
    bucketName: string;
    connected: boolean;
  };
}

// ==================== ERROR TYPES ====================
export interface ApiErrorResponse {
  error: string;
  code?: string;
  message?: string;
  details?: any;
  status?: number;
}

// ==================== ANALYTICS TYPES ====================
export interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  trafficSources: Record<string, number>;
  topReferrers: Array<{ source: string; count: number }>;
  viewerLocations: Array<{ country: string; count: number }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

// ==================== HEALTH CHECK TYPES ====================
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services?: Record<string, {
    status: 'up' | 'down';
    responseTime?: number;
    lastCheck?: string;
  }>;
}