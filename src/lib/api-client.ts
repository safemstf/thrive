// lib/api-client.ts 
import { BaseApiClient } from './api/base-api-client';
import { PortfolioApiClient } from './api/portfolio-api-client';
import { GalleryApiClient } from './api/gallery-api-client';
import { EducationalApiClient } from './api/educational-api-client';
import { AuthApiClient } from './api/api-client-auth';

// Import educational types from the educational API client
import type {
  Concept,
  ConceptFilters,
  Exercise,
  Lesson,
  LessonFilters,
  AssignmentData,
  LessonSubmission
} from './api/educational-api-client';

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
export type { 
  Concept, 
  ConceptFilters,
  Exercise,
  Lesson,
  LessonFilters,
  AssignmentData,
  LessonSubmission 
} from './api/educational-api-client';

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

// ==================== ENHANCED API NAMESPACE ====================
export const api = {
  // Portfolio API utilities - Enhanced with new methods
  portfolio: {
    // Core CRUD operations
    create: (data: CreatePortfolioDto) => getApiClient().portfolio.create(data),
    update: (id: string, data: UpdatePortfolioDto) => getApiClient().portfolio.update(id, data),
    getById: (id: string) => getApiClient().portfolio.getById(id),
    getByUserId: (userId: string) => getApiClient().portfolio.getByUserId(userId),
    getByUsername: (username: string) => getApiClient().portfolio.getByUsername(username),
    delete: (id: string) => getApiClient().portfolio.delete(id),
    deleteMyPortfolio: (deleteGalleryPieces?: boolean) => getApiClient().portfolio.deleteMyPortfolio(deleteGalleryPieces),
    getMyPortfolio: () => getApiClient().portfolio.getMyPortfolio(),

    // Discovery and search
    discover: (filters?: PortfolioFilters, page?: number, limit?: number) => 
      getApiClient().portfolio.discover(filters, page, limit),
    search: (query: string, limit?: number) => getApiClient().portfolio.search(query, limit),
    getFeatured: (limit?: number) => getApiClient().portfolio.getFeatured(limit),
    getTrending: (period?: 'day' | 'week' | 'month') => getApiClient().portfolio.getTrending(period),

    // Gallery management - Enhanced methods
    getMyGalleryPieces: () => getApiClient().portfolio.getMyGalleryPieces(),
    getPortfolioGallery: (portfolioId: string) => getApiClient().portfolio.getPortfolioGallery(portfolioId),
    addGalleryPiece: (pieceData: {
      title: string;
      description?: string;
      imageUrl: string;
      category?: string;
      tags?: string[];
      visibility?: GalleryVisibility;
    }) => getApiClient().portfolio.addGalleryPiece(pieceData),
    updateGalleryPiece: (pieceId: string, updates: Partial<GalleryPiece>) => 
      getApiClient().portfolio.updateGalleryPiece(pieceId, updates),
    deleteGalleryPiece: (pieceId: string) => getApiClient().portfolio.deleteGalleryPiece(pieceId),
    batchDeleteGalleryPieces: (pieceIds: string[]) => 
      getApiClient().portfolio.batchDeleteGalleryPieces(pieceIds),
    updateGalleryPieceVisibility: (pieceId: string, visibility: GalleryVisibility) => 
      getApiClient().portfolio.updateGalleryPieceVisibility(pieceId, visibility),
    batchUpdateGalleryVisibility: (pieceIds: string[], visibility: GalleryVisibility) => 
      getApiClient().portfolio.batchUpdateGalleryVisibility(pieceIds, visibility),
    getGalleryStats: () => getApiClient().portfolio.getGalleryStats(),

    // Advanced batch operations
    batchUploadGallery: (uploads: Array<{
      file: File;
      title: string;
      description?: string;
      category?: string;
      tags?: string[];
      visibility?: GalleryVisibility;
    }>, onProgress?: (completed: number, total: number) => void) => 
      getApiClient().portfolio.batchUploadGallery(uploads, onProgress),

    // Concept progress tracking
    getMyConcepts: () => getApiClient().portfolio.getMyConcepts(),
    addConceptToPortfolio: (conceptId: string, data: { status: string; startedAt: string }) =>
      getApiClient().portfolio.addConceptToPortfolio(conceptId, data),
    updateConceptProgress: (conceptId: string, data: { status: string }) =>
      getApiClient().portfolio.updateConceptProgress(conceptId, data),

    // Reviews system (NEWLY ADDED)
    addReview: (portfolioId: string, review: CreateReviewDto) => 
      getApiClient().portfolio.addReview(portfolioId, review),
    getReviews: (portfolioId: string, page?: number, limit?: number) => 
      getApiClient().portfolio.getReviews(portfolioId, page, limit),
    updateReviewStatus: (reviewId: string, status: 'approved' | 'rejected') =>
      getApiClient().portfolio.updateReviewStatus(reviewId, status),
    respondToReview: (reviewId: string, comment: string) =>
      getApiClient().portfolio.respondToReview(reviewId, comment),
    deleteReview: (reviewId: string) => getApiClient().portfolio.deleteReview(reviewId),

    // Analytics and tracking (NEWLY ADDED)
    trackView: (portfolioId: string, data?: { referrer?: string; duration?: number }) => 
      getApiClient().portfolio.trackView(portfolioId, data),
    getAnalytics: (portfolioId: string, period?: string) => 
      getApiClient().portfolio.getAnalytics(portfolioId, period),
    getPortfolioStats: () => getApiClient().portfolio.getPortfolioStats(),

    // File upload system (NEWLY ADDED)
    uploadImage: (file: File, type: 'profile' | 'cover') => 
      getApiClient().portfolio.uploadImage(file, type),

    // Sharing and collaboration (NEWLY ADDED)
    generateShareLink: (portfolioId: string, options?: { expiresIn?: number; maxViews?: number }) =>
      getApiClient().portfolio.generateShareLink(portfolioId, options),
    getByShareToken: (token: string) => getApiClient().portfolio.getByShareToken(token),

    // Utility methods
    hasPortfolio: () => getApiClient().portfolio.hasPortfolio(),
    getPortfolioTypeConfig: (type: string) => getApiClient().portfolio.getPortfolioTypeConfig(type),
  },
  
  // Gallery API utilities
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
  
  concepts: {
    getAll: (filters?: ConceptFilters) => 
      getApiClient().educational.getConcepts(filters),
    search: (query: string, filters?: Omit<ConceptFilters, 'search'>) => 
      getApiClient().educational.searchConcepts(query, filters),
    getById: (id: string) => 
      getApiClient().educational.getConceptById(id),
    getByBook: (bookId: string) => 
      getApiClient().educational.getConceptsByBook(bookId),
    getByType: (type: string, discipline?: string) => 
      getApiClient().educational.getConceptsByType(type, discipline),
    markComplete: (id: string, score?: number) => 
      getApiClient().educational.markConceptComplete(id, score),
    create: (concept: Omit<Concept, 'id' | 'createdAt' | 'updatedAt'>) => 
      getApiClient().educational.createConcept(concept),
    update: (id: string, updates: Partial<Concept>) => 
      getApiClient().educational.updateConcept(id, updates),
    delete: (id: string) => 
      getApiClient().educational.deleteConcept(id),
    bulkCreate: (concepts: Array<Omit<Concept, 'id' | 'createdAt' | 'updatedAt'>>) => 
      getApiClient().educational.bulkCreateConcepts(concepts),
  },
  
  lessons: {
    getAll: (filters?: LessonFilters) => 
      getApiClient().educational.getLessons(filters),
    getById: (id: string) => 
      getApiClient().educational.getLessonById(id),
    create: (lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => 
      getApiClient().educational.createLesson(lesson),
    update: (id: string, updates: Partial<Lesson>) => 
      getApiClient().educational.updateLesson(id, updates),
    delete: (id: string) => 
      getApiClient().educational.deleteLesson(id),
    publish: (id: string, isPublished: boolean = true) => 
      getApiClient().educational.publishLesson(id, isPublished),
    assign: (id: string, assignment: AssignmentData) => 
      getApiClient().educational.assignLesson(id, assignment),
    duplicate: (id: string) => 
      getApiClient().educational.duplicateLesson(id),
    getSubmissions: (id: string) => 
      getApiClient().educational.getLessonSubmissions(id),
    submit: (id: string, answers: Record<string, any>) => 
      getApiClient().educational.submitLesson(id, { answers }),
    getProgress: (id: string) => 
      getApiClient().educational.getLessonProgress(id),
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