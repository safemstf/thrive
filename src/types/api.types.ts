import { DifficultyLevel, MainCategory, ScientificDiscipline, SubCategory } from "./portfolio.types";

// src/types/api.types.ts - Enhanced with tags support
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
  dependsOn?: string;
  
  // NEW: Optional tagging system for test automation
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
  routes: RouteDefinition[];
}

// Utility functions for generating unique values
export function generateUniqueUsername(): string {
  return `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

export function generateUniqueEmail(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`;
}

export function generateUniqueId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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
}

export interface RouteCategory {
  name: string;
  routes: RouteDefinition[];
}
// Query parameters
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