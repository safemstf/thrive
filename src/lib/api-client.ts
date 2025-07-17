// lib/api-client.ts
import { BaseApiClient } from './api/base-api-client';
import { DeletePortfolioOptions, PortfolioApiClient } from './api/portfolio-api-client';
import { GalleryApiClient } from './api/gallery-api-client';
import { EducationalApiClient } from './api/educational-api-client';
import { AuthApiClient } from './api/api-client-auth';

import type {
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioFilters,
  CreateReviewDto,
} from '@/types/portfolio.types';
import type {
  GalleryPiece,
  GalleryQueryParams,
  ArtworkCategory,
  GalleryVisibility,
} from '@/types/gallery.types';
import type {
  Book,
  MainCategory,
  SubCategory,
  ScientificDiscipline,
  DifficultyLevel,
} from '@/types/educational.types';
import type {
  BookQueryParams,
  SearchFilters,
} from '@/types/api.types';
import type {
  LoginCredentials,
  SignupCredentials,
  User,
} from '@/types/auth.types';

// Re-export types
export { APIError } from './api/base-api-client';
export type { RequestConfig } from './api/base-api-client';

// Combined API Interface
export interface CombinedAPI {
  portfolio: PortfolioApiClient;
  gallery: GalleryApiClient;
  educational: EducationalApiClient;
  auth: AuthApiClient;
  healthCheck(): Promise<{ status: string; version: string }>;
  testConnection(): Promise<{ connected: boolean; baseUrl: string; error?: string }>;
}

// ==================== MAIN API CLIENT ====================
export class ApiClient extends BaseApiClient implements CombinedAPI {
  portfolio: PortfolioApiClient;
  gallery: GalleryApiClient;
  educational: EducationalApiClient;
  auth: AuthApiClient;

  constructor(baseURL?: string) {
    super(baseURL);
    this.portfolio = new PortfolioApiClient(baseURL);
    this.gallery = new GalleryApiClient(baseURL);
    this.educational = new EducationalApiClient(baseURL);
    this.auth = new AuthApiClient(baseURL);
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

// ==================== UTILITY API NAMESPACE ====================
// Update for lib/api-client.ts - portfolio namespace section

// ==================== UTILITY API NAMESPACE ====================
export const api = {
  // Portfolio API utilities
  portfolio: {
    create: (data: CreatePortfolioDto) => getApiClient().portfolio.create(data),
    update: (id: string, data: UpdatePortfolioDto) => getApiClient().portfolio.update(id, data),
    getById: (id: string) => getApiClient().portfolio.getById(id),
    getByUserId: (userId: string) => getApiClient().portfolio.getByUserId(userId),
    getByUsername: (username: string) => getApiClient().portfolio.getByUsername(username),
    delete: (id: string, options?: DeletePortfolioOptions) => getApiClient().portfolio.delete(id, options),
    getMyPortfolio: () => getApiClient().portfolio.getMyPortfolio(),
    
    // Gallery management (NEW)
    deleteGalleryPiece: (pieceId: string) => 
      getApiClient().portfolio.deleteGalleryPiece(pieceId),
    batchDeleteGalleryPieces: (pieceIds: string[]) => 
      getApiClient().portfolio.batchDeleteGalleryPieces(pieceIds),
    updateGalleryPieceVisibility: (pieceId: string, visibility: GalleryVisibility) => 
      getApiClient().portfolio.updateGalleryPieceVisibility(pieceId, visibility),
    batchUpdateGalleryVisibility: (pieceIds: string[], visibility: GalleryVisibility) => 
      getApiClient().portfolio.batchUpdateGalleryVisibility(pieceIds, visibility),
    
    // Discovery
    discover: (filters?: PortfolioFilters, page?: number, limit?: number) => 
      getApiClient().portfolio.discover(filters, page, limit),
    search: (query: string, limit?: number) => getApiClient().portfolio.search(query, limit),
    getFeatured: (limit?: number) => getApiClient().portfolio.getFeatured(limit),
    getTrending: (period?: 'day' | 'week' | 'month') => getApiClient().portfolio.getTrending(period),
    
    // Reviews
    addReview: (portfolioId: string, review: CreateReviewDto) => 
      getApiClient().portfolio.addReview(portfolioId, review),
    getReviews: (portfolioId: string, page?: number, limit?: number) => 
      getApiClient().portfolio.getReviews(portfolioId, page, limit),
    
    // Analytics & tracking
    trackView: (portfolioId: string, data?: any) => 
      getApiClient().portfolio.trackView(portfolioId, data),
    getAnalytics: (portfolioId: string, period?: string) => 
      getApiClient().portfolio.getAnalytics(portfolioId, period),
    
    // Image upload
    uploadImage: (file: File, type: 'profile' | 'cover') => 
      getApiClient().portfolio.uploadImage(file, type),
  },
  
  gallery: {
    getPieces: (params?: GalleryQueryParams) => getApiClient().gallery.getPieces(params),
    getPieceById: (id: string) => getApiClient().gallery.getPieceById(id),
    create: (piece: Omit<GalleryPiece, 'id' | 'createdAt' | 'updatedAt'>) => 
      getApiClient().gallery.create(piece),
    update: (id: string, updates: Partial<GalleryPiece>) => 
      getApiClient().gallery.update(id, updates),
    delete: (id: string) => getApiClient().gallery.delete(id),
    getFeatured: (limit?: number) => getApiClient().gallery.getFeatured(limit),
    getByCategory: (category: ArtworkCategory) => getApiClient().gallery.getByCategory(category),
    uploadImage: (file: File, metadata?: Record<string, any>) => 
      getApiClient().gallery.uploadImage(file, metadata),
    getStats: () => getApiClient().gallery.getStats(),
  },
  
  collections: {
    getAll: () => getApiClient().gallery.getCollections(),
    getById: (id: string) => getApiClient().gallery.getCollectionById(id),
  },
  
  artists: {
    getAll: () => getApiClient().gallery.getArtists(),
    getById: (id: string) => getApiClient().gallery.getArtistById(id),
    getPieces: (artistId: string) => getApiClient().gallery.getArtistPieces(artistId),
  },
  
  // Educational API utilities
  books: {
    getAll: (params?: BookQueryParams) => getApiClient().educational.getBooks(params),
    getById: (id: string) => getApiClient().educational.getBookById(id),
    create: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => 
      getApiClient().educational.createBook(book),
    update: (id: string, updates: Partial<Book>) => 
      getApiClient().educational.updateBook(id, updates),
    delete: (id: string) => getApiClient().educational.deleteBook(id),
    getByCategory: (category: MainCategory, subCategory?: SubCategory) => 
      getApiClient().educational.getBooksByCategory(category, subCategory),
    getByDifficulty: (level: DifficultyLevel) => 
      getApiClient().educational.getBooksByDifficulty(level),
  },
  
  content: {
    getMathConcepts: (bookId: string) => getApiClient().educational.getMathConcepts(bookId),
    getScienceConcepts: (bookId: string, discipline?: ScientificDiscipline) => 
      getApiClient().educational.getScienceConcepts(bookId, discipline),
    getGrammarRules: (bookId: string) => getApiClient().educational.getGrammarRules(bookId),
    search: (query: string, filters?: SearchFilters) => 
      getApiClient().educational.searchContent(query, filters),
  },
  
  // Auth API utilities
  auth: {
    login: (credentials: LoginCredentials) => getApiClient().auth.login(credentials),
    signup: (credentials: SignupCredentials) => getApiClient().auth.signup(credentials),
    logout: () => getApiClient().auth.logout(),
    getCurrentUser: () => getApiClient().auth.getCurrentUser(),
    updateProfile: (updates: Partial<User>) => getApiClient().auth.updateProfile(updates),
    refreshToken: () => getApiClient().auth.refreshToken(),
    verifyToken: (token: string) => getApiClient().auth.verifyToken(token),
  },
  
  // Common utilities
  health: {
    check: () => getApiClient().healthCheck(),
    testConnection: () => getApiClient().testConnection(),
  },
};