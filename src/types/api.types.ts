// src/types/api.types.ts

import { 
  Book, 
  MainCategory, 
  SubCategory, 
  ScientificDiscipline, 
  DifficultyLevel,
  MathConcept,
  ScienceConcept,
  GrammarRule,
  LiteraryDevice,
  WritingStructure
} from './educational.types';

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

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// API endpoints interface
export interface EducationalAPI {
  // Books
  getBooks(params?: BookQueryParams): Promise<Book[]>;
  getBookById(id: string): Promise<Book>;
  createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book>;
  updateBook(id: string, updates: Partial<Book>): Promise<Book>;
  deleteBook(id: string): Promise<void>;
  
  // Content specific
  getMathConcepts(bookId: string): Promise<MathConcept[]>;
  getScienceConcepts(bookId: string, discipline?: ScientificDiscipline): Promise<ScienceConcept[]>;
  getGrammarRules(bookId: string): Promise<GrammarRule[]>;
  
  // Search and filters
  searchContent(query: string, filters?: SearchFilters): Promise<SearchResult[]>;
  getBooksByCategory(category: MainCategory, subCategory?: SubCategory): Promise<Book[]>;
  getBooksByDifficulty(level: DifficultyLevel): Promise<Book[]>;
  
  // Analytics
  getPopularBooks(limit?: number): Promise<Book[]>;
  getUserProgress(userId: string, bookId: string): Promise<UserProgress>;
  trackContentView(userId: string, contentId: string, contentType: string): Promise<void>;
}