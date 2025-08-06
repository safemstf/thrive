// lib/api-client.ts - Portfolio-Centric Architecture (TypeScript Fixed)
import { BaseApiClient } from './api/base-api-client';
import { PortfolioApiClient } from './api/portfolio-api-client';
import { EducationalApiClient } from './api/educational-api-client';
import { AuthApiClient } from './api/api-client-auth';

// Import types
import type {
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioFilters,
  PortfolioKind
} from '@/types/portfolio.types';

import type {
  GalleryPiece,
  GalleryVisibility,
} from '@/types/gallery.types';

import type {
  BookQueryParams,
} from '@/types/api.types';

import type { ConceptFilters } from '@/types/portfolio.types';

import type {
  LoginCredentials,
  SignupCredentials,
  User,
} from '@/types/auth.types';

import type {
  MainCategory,
  SubCategory,
} from '@/types/educational.types';

// Re-export types
export { APIError } from './api/base-api-client';
export type { RequestConfig } from './api/base-api-client';

// Combined API Interface - Portfolio-Centric
export interface CombinedAPI {
  portfolio: PortfolioApiClient;
  educational: EducationalApiClient;
  auth: AuthApiClient;
  healthCheck(): Promise<{ status: string; version: string }>;
  testConnection(): Promise<{ connected: boolean; baseUrl: string; error?: string }>;
}

// ==================== MAIN API CLIENT ====================
export class ApiClient extends BaseApiClient implements CombinedAPI {
  portfolio: PortfolioApiClient;
  educational: EducationalApiClient;
  auth: AuthApiClient;

  constructor(baseURL?: string) {
    super(baseURL);
    this.portfolio = new PortfolioApiClient(baseURL);
    this.educational = new EducationalApiClient(baseURL);
    this.auth = new AuthApiClient(baseURL);
  }
}

type ApiCategory = 'portfolio' | 'education' | 'auth' | 'health';

// ==================== SINGLETON & EXPORTS ====================
let apiClient: ApiClient;

export function getApiClient(): ApiClient {
  if (!apiClient) {
    apiClient = new ApiClient();
  }
  return apiClient;
}

// React Hook for API client (re-export from provider)
export { useApiClient } from '@/providers/apiProvider';

// ==================== STREAMLINED API NAMESPACE ====================
export const api = {
  // === PORTFOLIO API - Core hub for all portfolio operations ===
  portfolio: {
    // Core Operations
    get: () => getApiClient().portfolio.getMyPortfolio(),
    create: (data: CreatePortfolioDto) => getApiClient().portfolio.create(data),
    update: (data: UpdatePortfolioDto) => getApiClient().portfolio.update(data), // Fixed: only needs data parameter
    delete: (deleteGalleryPieces?: boolean) => getApiClient().portfolio.deleteMyPortfolio(deleteGalleryPieces),
    upgrade: (kind: PortfolioKind, preserveContent?: boolean) => getApiClient().portfolio.upgrade(kind, preserveContent),
    check: () => getApiClient().portfolio.hasPortfolio(),

    // Discovery & Public Access
    discover: (filters?: PortfolioFilters, page?: number, limit?: number) => 
      getApiClient().portfolio.discover(filters, page, limit),
    getByUsername: (username: string) => getApiClient().portfolio.getByUsername(username),
    getStats: () => getApiClient().portfolio.getStats(),
    getTypeConfig: (type: string) => getApiClient().portfolio.getTypeConfig(type),

    // Gallery Management (Portfolio-Owned)
    gallery: {
      get: () => getApiClient().portfolio.getMyGalleryPieces(),
      getByUsername: (username: string, page?: number, limit?: number) => 
        getApiClient().portfolio.getPortfolioGalleryByUsername(username, page, limit),
      add: (pieceData: {
        title: string;
        description?: string;
        imageUrl: string;
        category?: string;
        medium?: string;
        tags?: string[];
        visibility?: GalleryVisibility;
        year?: number;
        displayOrder?: number;
      }) => getApiClient().portfolio.addGalleryPiece(pieceData),
      update: (pieceId: string, updates: Partial<GalleryPiece>) => 
        getApiClient().portfolio.updateGalleryPiece(pieceId, updates),
      delete: (pieceId: string) => getApiClient().portfolio.deleteGalleryPiece(pieceId),
      batchDelete: (pieceIds: string[]) => 
        getApiClient().portfolio.batchDeleteGalleryPieces(pieceIds),
      batchUpdateVisibility: (pieceIds: string[], visibility: GalleryVisibility) => 
        getApiClient().portfolio.batchUpdateGalleryVisibility(pieceIds, visibility),
      getStats: () => getApiClient().portfolio.getGalleryStats(),
    },

    // Concept Tracking (Educational/Hybrid) - Fixed type issues
    concepts: {
      get: () => getApiClient().portfolio.getMyConcepts(),
      add: (conceptId: string, data: { 
        status?: string; 
        startedAt?: string;
        notes?: string;
        score?: number;
      } = {}) => getApiClient().portfolio.addConceptToPortfolio(conceptId, data), // Fixed: made data optional with default
      updateProgress: (conceptId: string, data: { 
        status?: string; 
        score?: number;
        notes?: string;
        completedAt?: string;
      } = {}) => getApiClient().portfolio.updateConceptProgress(conceptId, data), // Fixed: made data optional with default
    },

    // Analytics & Dashboard
    analytics: {
      get: (period?: string) => getApiClient().portfolio.getAnalytics(period),
      dashboard: () => getApiClient().portfolio.getDashboard(),
      trackView: (portfolioId: string, data?: { referrer?: string; duration?: number }) => 
        getApiClient().portfolio.trackView(portfolioId, data),
    },

    // Image Uploads
    images: {
      upload: (file: File, type: 'profile' | 'cover') => 
        getApiClient().portfolio.uploadImage(file, type),
      uploadRaw: (formData: FormData) => 
        getApiClient().portfolio.uploadImageRaw(formData),
    },

    // Legacy methods (for backward compatibility during migration)
    getById: (id: string) => getApiClient().portfolio.getById(id),
    getByUserId: (userId: string) => getApiClient().portfolio.getByUserId(userId),
  },
  
  // === EDUCATION API ===
  education: {
    books: {
      getAll: (params?: BookQueryParams) => getApiClient().educational.getBooks(params),
      getById: (id: string) => getApiClient().educational.getBookById(id),
      getByCategory: (category: MainCategory, subCategory?: SubCategory) => 
        getApiClient().educational.getBooksByCategory(category, subCategory),
    },
    
    concepts: {
      getAll: (filters?: ConceptFilters) => 
        getApiClient().educational.getConcepts(filters),
      search: (query: string, filters?: Omit<ConceptFilters, 'search'>) => 
        getApiClient().educational.searchConcepts(query, filters),
      getById: (id: string) => 
        getApiClient().educational.getConceptById(id),
      getByBook: (bookId: string) => 
        getApiClient().educational.getConceptsByBook(bookId),
      markComplete: (id: string, score?: number) => 
        getApiClient().educational.markConceptComplete(id, score),
    },
  },
  
  // === AUTH API ===
  auth: {
    login: (credentials: LoginCredentials) => getApiClient().auth.login(credentials),
    signup: (credentials: SignupCredentials) => getApiClient().auth.signup(credentials),
    logout: () => getApiClient().auth.logout(),
    getCurrentUser: () => getApiClient().auth.getCurrentUser(),
    updateProfile: (updates: Partial<User>) => getApiClient().auth.updateProfile(updates),
    verifyToken: (token: string) => getApiClient().auth.verifyToken(token),
  },
  
  // === HEALTH & TESTING ===
  health: {
    check: () => getApiClient().healthCheck(),
    testConnection: () => getApiClient().testConnection(),
  },
};

// ==================== DEFAULT EXPORT ====================
export default api;

// ==================== TESTING UTILITIES FOR YOUR API TEST PAGE ====================
export const testingUtils = {
  // Get all available API methods for testing
  getAllMethods: () => ({
    portfolio: {
      core: ['get', 'create', 'update', 'delete', 'upgrade', 'check'],
      discovery: ['discover', 'getByUsername', 'getStats', 'getTypeConfig'],
      gallery: ['gallery.get', 'gallery.getByUsername', 'gallery.add', 'gallery.update', 'gallery.delete', 'gallery.batchDelete', 'gallery.batchUpdateVisibility', 'gallery.getStats'],
      concepts: ['concepts.get', 'concepts.add', 'concepts.updateProgress'],
      analytics: ['analytics.get', 'analytics.dashboard', 'analytics.trackView'],
      images: ['images.upload', 'images.uploadRaw']
    },
    education: {
      books: ['books.getAll', 'books.getById', 'books.getByCategory'],
      concepts: ['concepts.getAll', 'concepts.search', 'concepts.getById', 'concepts.getByBook', 'concepts.markComplete']
    },
    auth: ['login', 'signup', 'logout', 'getCurrentUser', 'updateProfile', 'verifyToken'],
    health: ['check', 'testConnection']
  }),
  
  // Get safe methods for automated testing (read-only operations)
  getSafeMethods: () => ({
    portfolio: [
      'get', 'check', 'discover', 'getByUsername', 
      'getStats', 'getTypeConfig', 'gallery.get', 
      'gallery.getStats', 'concepts.get', 
      'analytics.get', 'analytics.dashboard'
    ],
    education: [
      'books.getAll', 'books.getById', 'books.getByCategory',
      'concepts.getAll', 'concepts.getById', 'concepts.getByBook'
    ],
    auth: ['getCurrentUser'],
    health: ['check', 'testConnection']
  }),
  
  // Check if a method is safe for testing
  isSafeMethod: (category: string, method: string) => {
    const safeMethods = testingUtils.getSafeMethods();
    return safeMethods[category as keyof typeof safeMethods]?.includes(method) || false;
  },
  
  // Get methods that require authentication
  getAuthMethods: () => ({
    portfolio: [
      'get', 'create', 'update', 'delete', 'upgrade', 'check',
      'gallery.get', 'gallery.add', 'gallery.update', 'gallery.delete',
      'concepts.get', 'concepts.add', 'concepts.updateProgress',
      'analytics.get', 'analytics.dashboard', 'images.upload'
    ],
    education: ['concepts.markComplete'],
    auth: ['getCurrentUser', 'updateProfile', 'logout']
  }),

  // Get methods that modify data (be careful in testing)
  getModificationMethods: () => ({
    portfolio: [
      'create', 'update', 'delete', 'upgrade',
      'gallery.add', 'gallery.update', 'gallery.delete', 'gallery.batchDelete', 'gallery.batchUpdateVisibility',
      'concepts.add', 'concepts.updateProgress',
      'analytics.trackView', 'images.upload', 'images.uploadRaw'
    ],
    education: ['concepts.markComplete'],
    auth: ['login', 'signup', 'logout', 'updateProfile']
  }),

  getDestructiveMethods: (): Record<ApiCategory, string[]> => ({
  portfolio: ['delete', 'gallery.delete', 'gallery.batchDelete'],
  education: [],
  auth: ['logout'],
  health: []
  }),


  // Helper to categorize API calls for your test page
  categorizeMethod: (category: string, method: string) => {
    const safe = testingUtils.getSafeMethods();
    const auth = testingUtils.getAuthMethods();
    const modification = testingUtils.getModificationMethods();
    const destructive = testingUtils.getDestructiveMethods();

    if (destructive[category as keyof typeof destructive]?.includes(method)) {
      return 'destructive';
    }
    if (modification[category as keyof typeof modification]?.includes(method)) {
      return 'modification';
    }
    if (auth[category as keyof typeof auth]?.includes(method)) {
      return 'authenticated';
    }
    if (safe[category as keyof typeof safe]?.includes(method)) {
      return 'safe';
    }
    return 'unknown';
  },

  // Portfolio-specific testing helpers
  portfolio: {
    // Test data generators
    generateCreateData: (): CreatePortfolioDto => ({
      title: `Test Portfolio ${Date.now()}`,
      bio: 'This is a test portfolio created by the API testing suite',
      visibility: 'public',
      specializations: ['Digital Art', 'Photography'],
      tags: ['test', 'portfolio', 'automated'],
    }),

    generateGalleryPieceData: () => ({
      title: `Test Artwork ${Date.now()}`,
      description: 'Test artwork created by API testing suite',
      imageUrl: 'https://picsum.photos/800/600',
      category: 'digital',
      medium: 'Digital Art',
      tags: ['test', 'digital', 'automated'],
      visibility: 'public' as GalleryVisibility,
      year: 2025,
      displayOrder: 0
    }),

    generateConceptData: () => ({
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      notes: 'Test concept progress via API testing'
    }),

    // Quick test sequences for portfolio functionality
    runBasicPortfolioTest: async () => {
      try {
        // 1. Check if portfolio exists
        const hasPortfolio = await api.portfolio.check();
        console.log('Has portfolio:', hasPortfolio);

        // 2. Get portfolio if exists
        if (hasPortfolio) {
          const portfolio = await api.portfolio.get();
          console.log('Portfolio:', portfolio?.username);
          
          // 3. Get gallery stats
          const galleryStats = await api.portfolio.gallery.getStats();
          console.log('Gallery stats:', galleryStats);
        }

        // 4. Get public stats
        const publicStats = await api.portfolio.getStats();
        console.log('Public stats:', publicStats);

        return { success: true, hasPortfolio };
      } catch (error) {
        console.error('Portfolio test failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    runGalleryTest: async () => {
      try {
        const pieces = await api.portfolio.gallery.get();
        console.log(`Found ${pieces.length} gallery pieces`);
        
        const stats = await api.portfolio.gallery.getStats();
        console.log('Gallery stats:', stats);

        return { success: true, pieceCount: pieces.length, stats };
      } catch (error) {
        console.error('Gallery test failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  }
};