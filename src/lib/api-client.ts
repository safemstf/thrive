// lib/api-client.ts - Fixed TypeScript issues
import { BaseApiClient } from './api/base-api-client';
import { PortfolioApiClient } from './api/portfolio-api-client';
import { EducationalApiClient } from './api/educational-api-client';
import { AuthApiClient } from './api/api-client-auth';

// Import types
import type {
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioKind,
  Portfolio
} from '@/types/portfolio.types';

import type {
  GalleryVisibility,
} from '@/types/gallery.types';

import type {
  BackendGalleryPiece
} from '@/types/base.types';

import type {
  LoginCredentials,
  SignupCredentials,
  User,
} from '@/types/auth.types';

import type {
  MainCategory,
  SubCategory,
  ConceptFilters,
  BookQueryParams,
  ScientificDiscipline
} from '@/types/educational.types';

// Re-export types
export { APIError } from './api/base-api-client';
export type { RequestConfig } from './api/base-api-client';

// ==================== PORTFOLIO FILTERS TYPE ====================
// Define this here since it's missing from portfolio.types.ts
interface PortfolioFilters {
  kind?: string;
  search?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  visibility?: 'public' | 'private';
  status?: 'active' | 'inactive' | 'suspended';
  specializations?: string[];
  tags?: string[];
  location?: string;
  minRating?: number;
  hasReviews?: boolean;
}

// ==================== EXTENDED API CLIENT INTERFACES ====================
// These extend the base clients to include missing methods

interface ExtendedEducationalApiClient extends EducationalApiClient {
  // Add missing methods to educational client
  createBook(data: any): Promise<any>;
  composeBook(data: any): Promise<any>;
  getBookSuggestions(id: string): Promise<any>;
  analyzeBook(id: string): Promise<any>;
  cloneBook(id: string): Promise<any>;
  getConceptsByType(type: string): Promise<any>;
  createConcept(data: any): Promise<any>;
  updateConcept(id: string, data: any): Promise<any>;
}

// Additional client interfaces for missing functionality
interface ProgressApiClient {
  getProgressSummary(): Promise<any>;
  getBookProgress(bookId: string): Promise<any>;
  updateConceptProgress(bookId: string, conceptId: string, data: any): Promise<any>;
  getStats(): Promise<any>;
  resetBookProgress(bookId: string): Promise<any>;
}

interface UsersApiClient {
  getAll(): Promise<any>;
  getById(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<any>;
  getProgress(id: string): Promise<any>;
  resetPassword(id: string): Promise<any>;
}

interface MeApiClient {
  getSkills(): Promise<any>;
  getLearningPaths(): Promise<any>;
  getMarketIntelligence(): Promise<any>;
  getPrivacySettings(): Promise<any>;
  updatePrivacySettings(settings: any): Promise<any>;
  getAccountInfo(): Promise<any>;
  updateAccountInfo(info: any): Promise<any>;
  getBilling(): Promise<any>;
  upgradeBilling(plan: any): Promise<any>;
  deleteAccount(): Promise<any>;
}

interface SimulationsApiClient {
  getAll(filters?: any): Promise<any>;
  create(data: any): Promise<any>;
  getStats(): Promise<any>;
  uploadResults(data: any): Promise<any>;
  getById(id: string): Promise<any>;
  getInsights(id: string): Promise<any>;
  sendEvents(id: string, events: any): Promise<any>;
  getLiveData(id: string): Promise<any>;
  getStream(id: string): Promise<any>;
  disconnect(id: string): Promise<any>;
  delete(id: string): Promise<any>;
}

interface HealthApiClient {
  getDetailed(): Promise<any>;
  getReady(): Promise<any>;
  getLive(): Promise<any>;
}

// Combined API Interface - Extended
export interface CombinedAPI {
  portfolio: PortfolioApiClient;
  educational: ExtendedEducationalApiClient;
  auth: AuthApiClient;
  progress: ProgressApiClient;
  users: UsersApiClient;
  me: MeApiClient;
  simulations: SimulationsApiClient;
  health: HealthApiClient;
  healthCheck(): Promise<{ status: string; version: string }>;
  testConnection(): Promise<{ connected: boolean; baseUrl: string; error?: string }>;
}

// ==================== MAIN API CLIENT ====================
export class ApiClient extends BaseApiClient implements CombinedAPI {
  portfolio: PortfolioApiClient;
  educational: ExtendedEducationalApiClient;
  auth: AuthApiClient;
  progress: ProgressApiClient;
  users: UsersApiClient;
  me: MeApiClient;
  simulations: SimulationsApiClient;
  health: HealthApiClient;

  // Expose baseURL publicly for image URL generation
  public getBaseURL(): string {
    return (this as any).baseURL; // Access protected property safely
  }

  constructor(baseURL?: string) {
    super(baseURL);
    this.portfolio = new PortfolioApiClient(baseURL);
    
    // Create extended educational client
    this.educational = this.createExtendedEducationalClient(baseURL);
    
    this.auth = new AuthApiClient(baseURL);
    
    // Create placeholder clients for missing functionality
    this.progress = this.createProgressClient();
    this.users = this.createUsersClient();
    this.me = this.createMeClient();
    this.simulations = this.createSimulationsClient();
    this.health = this.createHealthClient();
  }

  // ==================== HEALTH & CONNECTION METHODS ====================
  
  async healthCheck(): Promise<{ status: string; version: string }> {
    try {
      return await this.request('/api/health');
    } catch (error) {
      return { status: 'error', version: 'unknown' };
    }
  }

  async testConnection(): Promise<{ connected: boolean; baseUrl: string; error?: string }> {
    try {
      await this.request('/api/health');
      return { 
        connected: true, 
        baseUrl: (this as any).baseURL 
      };
    } catch (error: any) {
      return { 
        connected: false, 
        baseUrl: (this as any).baseURL,
        error: error.message 
      };
    }
  }

  // ==================== CLIENT FACTORIES ====================
  
  private createExtendedEducationalClient(baseURL?: string): ExtendedEducationalApiClient {
    const baseClient = new EducationalApiClient(baseURL);
    
    // Add missing methods to the educational client
    const extendedClient = Object.assign(baseClient, {
      createBook: async (data: any) => {
        return await (baseClient as any).request('/api/books', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      composeBook: async (data: any) => {
        return await (baseClient as any).request('/api/books/compose', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      getBookSuggestions: async (id: string) => {
        return await (baseClient as any).request(`/api/books/${id}/suggestions`);
      },
      analyzeBook: async (id: string) => {
        return await (baseClient as any).request(`/api/books/${id}/analysis`);
      },
      cloneBook: async (id: string) => {
        return await (baseClient as any).request(`/api/books/${id}/clone`, {
          method: 'POST'
        });
      },
      getConceptsByType: async (type: string) => {
        return await (baseClient as any).request(`/api/concepts/type/${type}`);
      },
      createConcept: async (data: any) => {
        return await (baseClient as any).request('/api/concepts', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      updateConcept: async (id: string, data: any) => {
        return await (baseClient as any).request(`/api/concepts/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      }
    });

    return extendedClient as ExtendedEducationalApiClient;
  }

  private createProgressClient(): ProgressApiClient {
    return {
      getProgressSummary: async () => {
        return await this.request('/api/progress');
      },
      getBookProgress: async (bookId: string) => {
        return await this.request(`/api/progress/book/${bookId}`);
      },
      updateConceptProgress: async (bookId: string, conceptId: string, data: any) => {
        return await this.request(`/api/progress/book/${bookId}/concept/${conceptId}`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      getStats: async () => {
        return await this.request('/api/progress/stats');
      },
      resetBookProgress: async (bookId: string) => {
        return await this.request(`/api/progress/book/${bookId}`, {
          method: 'DELETE'
        });
      }
    };
  }

  private createUsersClient(): UsersApiClient {
    return {
      getAll: async () => {
        return await this.request('/api/users');
      },
      getById: async (id: string) => {
        return await this.request(`/api/users/${id}`);
      },
      update: async (id: string, data: any) => {
        return await this.request(`/api/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      },
      delete: async (id: string) => {
        return await this.request(`/api/users/${id}`, {
          method: 'DELETE'
        });
      },
      getProgress: async (id: string) => {
        return await this.request(`/api/users/${id}/progress`);
      },
      resetPassword: async (id: string) => {
        return await this.request(`/api/users/${id}/reset-password`, {
          method: 'POST'
        });
      }
    };
  }

  private createMeClient(): MeApiClient {
    return {
      getSkills: async () => {
        return await this.request('/api/users/me/skills');
      },
      getLearningPaths: async () => {
        return await this.request('/api/users/me/learning-paths');
      },
      getMarketIntelligence: async () => {
        return await this.request('/api/users/me/market-intelligence');
      },
      getPrivacySettings: async () => {
        return await this.request('/api/users/me/privacy-settings');
      },
      updatePrivacySettings: async (settings: any) => {
        return await this.request('/api/users/me/privacy-settings', {
          method: 'PUT',
          body: JSON.stringify(settings)
        });
      },
      getAccountInfo: async () => {
        return await this.request('/api/users/me/account-info');
      },
      updateAccountInfo: async (info: any) => {
        return await this.request('/api/users/me/account-info', {
          method: 'PUT',
          body: JSON.stringify(info)
        });
      },
      getBilling: async () => {
        return await this.request('/api/users/me/billing');
      },
      upgradeBilling: async (plan: any) => {
        return await this.request('/api/users/me/billing/upgrade', {
          method: 'POST',
          body: JSON.stringify(plan)
        });
      },
      deleteAccount: async () => {
        return await this.request('/api/users/me/delete-account', {
          method: 'DELETE'
        });
      }
    };
  }

  private createSimulationsClient(): SimulationsApiClient {
    return {
      getAll: async (filters?: any) => {
        return await this.request('/api/simulations', { params: filters });
      },
      create: async (data: any) => {
        return await this.request('/api/simulations', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      getStats: async () => {
        return await this.request('/api/simulations/stats');
      },
      uploadResults: async (data: any) => {
        return await this.request('/api/simulations/results', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      getById: async (id: string) => {
        return await this.request(`/api/simulations/${id}`);
      },
      getInsights: async (id: string) => {
        return await this.request(`/api/simulations/${id}/insights`);
      },
      sendEvents: async (id: string, events: any) => {
        return await this.request(`/api/simulations/${id}/events`, {
          method: 'POST',
          body: JSON.stringify(events)
        });
      },
      getLiveData: async (id: string) => {
        return await this.request(`/api/simulations/${id}/live-data`);
      },
      getStream: async (id: string) => {
        return await this.request(`/api/simulations/${id}/stream`);
      },
      disconnect: async (id: string) => {
        return await this.request(`/api/simulations/${id}/disconnect`, {
          method: 'POST'
        });
      },
      delete: async (id: string) => {
        return await this.request(`/api/simulations/${id}`, {
          method: 'DELETE'
        });
      }
    };
  }

  private createHealthClient(): HealthApiClient {
    return {
      getDetailed: async () => {
        return await this.request('/api/health/detailed');
      },
      getReady: async () => {
        return await this.request('/api/health/ready');
      },
      getLive: async () => {
        return await this.request('/api/health/live');
      }
    };
  }
}

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
  // === HEALTH & SYSTEM ===
  health: {
    check: () => getApiClient().healthCheck(),
    testConnection: () => getApiClient().testConnection(),
    detailed: () => getApiClient().health.getDetailed(),
    ready: () => getApiClient().health.getReady(),
    live: () => getApiClient().health.getLive(),
  },

  // === PORTFOLIO API - Complete System ===
  portfolio: {
    // Core Operations
    get: (): Promise<Portfolio | null> => getApiClient().portfolio.getMyPortfolio(),
    create: (data: CreatePortfolioDto) => getApiClient().portfolio.create(data),
    update: (data: UpdatePortfolioDto) => getApiClient().portfolio.update(data),
    delete: (deleteGalleryPieces?: boolean) => getApiClient().portfolio.deleteMyPortfolio(deleteGalleryPieces),
    upgrade: (kind: PortfolioKind, preserveContent: boolean = true) => getApiClient().portfolio.upgrade(kind, preserveContent),
    check: () => getApiClient().portfolio.hasPortfolio(),

    // Discovery & Public Access
    discover: (filters?: PortfolioFilters, page: number = 1, limit: number = 20) =>
      getApiClient().portfolio.discover(filters, page, limit),
    getByUsername: (username: string) => getApiClient().portfolio.getByUsername(username),
    getStats: () => getApiClient().portfolio.getStats(),
    getTypeConfig: (type: string) => getApiClient().portfolio.getTypeConfig(type),

    // 2-Step Upload Wizard & Image Management
    images: {
      upload: (file: File, type: 'profile' | 'cover' | 'gallery' = 'gallery') =>
        getApiClient().portfolio.uploadImage(file, type),
      
      uploadRaw: (formData: FormData) =>
        getApiClient().portfolio.uploadImageRaw(formData),
      // Image URL helpers (generate URLs, don't make requests)
      getMyGalleryImageUrl: (pieceId: string, size?: 'full' | 'thumbnail') =>
        `${getApiClient().getBaseURL()}/api/portfolios/me/gallery/${encodeURIComponent(pieceId)}/image${size ? `?size=${encodeURIComponent(size)}` : ''}`,
      getPublicGalleryImageUrl: (username: string, pieceId: string, size?: 'full' | 'thumbnail') =>
        `${getApiClient().getBaseURL()}/api/portfolios/by-username/${encodeURIComponent(username)}/gallery/${encodeURIComponent(pieceId)}/image${size ? `?size=${encodeURIComponent(size)}` : ''}`,
      getMyProfileImageUrl: (type: 'profile' | 'cover') =>
        `${getApiClient().getBaseURL()}/api/portfolios/me/image/${encodeURIComponent(type)}`,
      getPublicProfileImageUrl: (username: string, type: 'profile' | 'cover') =>
        `${getApiClient().getBaseURL()}/api/portfolios/by-username/${encodeURIComponent(username)}/image/${encodeURIComponent(type)}`,
    },

    // Gallery Management (Portfolio-Owned)
    gallery: {
      get: (options?: {
        page?: number;
        limit?: number;
        category?: string;
        visibility?: 'public' | 'private' | 'unlisted' | 'all';
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => getApiClient().portfolio.getMyGalleryPieces(options),
      getByUsername: (username: string, page: number = 1, limit: number = 20) =>
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
        price?: number;
        artist?: string;
      }) => getApiClient().portfolio.addGalleryPiece(pieceData),
      update: (pieceId: string, updates: Partial<BackendGalleryPiece>) =>
        getApiClient().portfolio.updateGalleryPiece(pieceId, updates),
      delete: (pieceId: string) => getApiClient().portfolio.deleteGalleryPiece(pieceId),
      batchDelete: (pieceIds: string[], onProgress?: (completed: number, total: number) => void) =>
        getApiClient().portfolio.batchDeleteGalleryPieces(pieceIds, onProgress),
      batchUpdateVisibility: (pieceIds: string[], visibility: GalleryVisibility) =>
        getApiClient().portfolio.batchUpdateGalleryVisibility(pieceIds, visibility),
      getStats: () => getApiClient().portfolio.getGalleryStats(),
    },

    // Concept Tracking (Educational/Hybrid)
    concepts: {
      get: () => getApiClient().portfolio.getMyConcepts(),
      add: (conceptId: string, data: {
        status?: 'started' | 'in-progress' | 'completed';
        startedAt?: string;
        notes?: string;
        score?: number;
      } = {}) => getApiClient().portfolio.addConceptToPortfolio(conceptId, data),
      updateProgress: (conceptId: string, data: {
        status?: 'started' | 'in-progress' | 'completed';
        score?: number;
        notes?: string;
        completedAt?: string;
      } = {}) => getApiClient().portfolio.updateConceptProgress(conceptId, data),
    },

    // Analytics & Dashboard
    analytics: {
      get: (period: '7d' | '30d' | '90d' | '1y' = '30d') => getApiClient().portfolio.getAnalytics(period),
      dashboard: () => getApiClient().portfolio.getDashboard(),
      trackView: (portfolioId: string, data?: { referrer?: string; duration?: number }) =>
        getApiClient().portfolio.trackView(portfolioId, data),
    },

    // Debug & Testing
    debug: {
      uploadConfig: () => getApiClient().portfolio.getUploadConfig(),
      validateFile: (filename: string) => getApiClient().portfolio.validateFile(filename),
    },

    // Legacy methods (for backward compatibility during migration)
    getById: (id: string) => getApiClient().portfolio.getById(id),
    getByUserId: (userId: string) => getApiClient().portfolio.getByUserId(userId),
  },
  // === EDUCATION API ===
  books: {
    getAll: (params?: BookQueryParams) => getApiClient().educational.getBooks(params),
    getById: (id: string) => getApiClient().educational.getBookById(id),
    getByCategory: (category: MainCategory, subCategory?: SubCategory) => 
      getApiClient().educational.getBooksByCategory(category, subCategory),
    create: (data: any) => getApiClient().educational.createBook(data),
    compose: (data: any) => getApiClient().educational.composeBook(data),
    getSuggestions: (id: string) => getApiClient().educational.getBookSuggestions(id),
    analyze: (id: string) => getApiClient().educational.analyzeBook(id),
    clone: (id: string) => getApiClient().educational.cloneBook(id),
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
    getByType: (type: string) => getApiClient().educational.getConceptsByType(type),
    markComplete: (id: string, score?: number) => 
      getApiClient().educational.markConceptComplete(id, score),
    create: (data: any) => getApiClient().educational.createConcept(data),
    update: (id: string, data: any) => getApiClient().educational.updateConcept(id, data),
  },

  // === PROGRESS TRACKING ===
  progress: {
    get: () => getApiClient().progress.getProgressSummary(),
    getByBook: (bookId: string) => getApiClient().progress.getBookProgress(bookId),
    updateConcept: (bookId: string, conceptId: string, data: any) =>
      getApiClient().progress.updateConceptProgress(bookId, conceptId, data),
    getStats: () => getApiClient().progress.getStats(),
    resetBook: (bookId: string) => getApiClient().progress.resetBookProgress(bookId),
  },

  // === USER MANAGEMENT ===
  users: {
    getAll: () => getApiClient().users.getAll(),
    getById: (id: string) => getApiClient().users.getById(id),
    update: (id: string, data: any) => getApiClient().users.update(id, data),
    delete: (id: string) => getApiClient().users.delete(id),
    getProgress: (id: string) => getApiClient().users.getProgress(id),
    resetPassword: (id: string) => getApiClient().users.resetPassword(id),
  },

  // === ACCOUNT MANAGEMENT ===
  me: {
    getSkills: () => getApiClient().me.getSkills(),
    getLearningPaths: () => getApiClient().me.getLearningPaths(),
    getMarketIntelligence: () => getApiClient().me.getMarketIntelligence(),
    getPrivacySettings: () => getApiClient().me.getPrivacySettings(),
    updatePrivacySettings: (settings: any) => getApiClient().me.updatePrivacySettings(settings),
    getAccountInfo: () => getApiClient().me.getAccountInfo(),
    updateAccountInfo: (info: any) => getApiClient().me.updateAccountInfo(info),
    getBilling: () => getApiClient().me.getBilling(),
    upgradeBilling: (plan: any) => getApiClient().me.upgradeBilling(plan),
    deleteAccount: () => getApiClient().me.deleteAccount(),
  },

  // === SIMULATIONS ===
  simulations: {
    getAll: (filters?: any) => getApiClient().simulations.getAll(filters),
    create: (data: any) => getApiClient().simulations.create(data),
    getStats: () => getApiClient().simulations.getStats(),
    uploadResults: (data: any) => getApiClient().simulations.uploadResults(data),
    getById: (id: string) => getApiClient().simulations.getById(id),
    getInsights: (id: string) => getApiClient().simulations.getInsights(id),
    sendEvents: (id: string, events: any) => getApiClient().simulations.sendEvents(id, events),
    getLiveData: (id: string) => getApiClient().simulations.getLiveData(id),
    getStream: (id: string) => getApiClient().simulations.getStream(id),
    disconnect: (id: string) => getApiClient().simulations.disconnect(id),
    delete: (id: string) => getApiClient().simulations.delete(id),
  },
  
  // === AUTH API ===
  auth: {
    signup: (credentials: SignupCredentials) => getApiClient().auth.signup(credentials),
    login: (credentials: LoginCredentials) => getApiClient().auth.login(credentials),
    logout: () => getApiClient().auth.logout(),
    getCurrentUser: () => getApiClient().auth.getCurrentUser(),
    updateProfile: (updates: Partial<User>) => getApiClient().auth.updateProfile(updates),
    verifyToken: (token: string) => getApiClient().auth.verifyToken(token),
  },
};

// ==================== DEFAULT EXPORT ====================
export default api;