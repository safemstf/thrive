// ============================================
// lib/api/educational-api-client.ts
// ============================================
// Enhanced Educational API Client with Concepts & Lessons
// ============================================

import { BaseApiClient } from './base-api-client';
import type { RequestConfig } from './base-api-client';
import type {
  Book,
  MainCategory,
  SubCategory,
  DifficultyLevel,
} from '@/types/educational.types';
import type {
  BookQueryParams,
  SearchFilters,
  SearchResult,
  UserProgress,
} from '@/types/api.types';
import {ScientificDiscipline} from '@/types/portfolio.types'

// ============================================
// New Types for Concepts & Lessons
// ============================================

export interface Concept {
  id: string;
  topic: string;
  type: 'math' | 'science' | 'grammar' | 'literary' | 'writing';
  bookIds: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Type-specific fields
  discipline?: 'physics' | 'chemistry' | 'biology';
  formula?: any;
  rules?: any[];
  examples?: any[];
  strategies?: any[];
  commonErrors?: any[];
  
  // Metadata
  prerequisites?: string[];
  relatedConcepts?: string[];
  tags?: string[];
  estimatedTime?: number;
  stats?: {
    views: number;
    completions: number;
    averageScore: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id?: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'code' | 'drawing' | 'matching';
  question: string;
  instructions?: string;
  
  // Type-specific fields
  options?: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }>;
  matchingPairs?: Array<{
    left: string;
    right: string;
  }>;
  correctAnswer?: any;
  acceptableAnswers?: string[];
  
  // Scoring
  points: number;
  partialCredit?: boolean;
  
  // Help
  hints?: Array<{
    text: string;
    penaltyPoints?: number;
  }>;
  explanation?: string;
  
  // Metadata
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  tags?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  objectives?: string[];
  
  // Associations
  teacherId: string;
  courseId?: string;
  bookId?: string;
  conceptIds?: string[];
  
  // Content
  sections?: Array<{
    title: string;
    content: string;
    exercises?: Exercise[];
    order: number;
  }>;
  exercises: Exercise[];
  
  // Settings
  settings: {
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showHints?: boolean;
    showExplanations?: 'never' | 'after-attempt' | 'after-submission';
    maxAttempts?: number;
    timeLimitMinutes?: number;
    passingScore?: number;
    allowLateSubmission?: boolean;
    latePenaltyPerDay?: number;
  };
  
  // Status
  isPublished: boolean;
  publishedAt?: Date;
  
  // Assignment info (for students)
  assignment?: {
    dueDate?: Date;
    availableFrom?: Date;
    availableUntil?: Date;
    assignedAt: Date;
  };
  
  // Stats
  stats: {
    totalPoints: number;
    exerciseCount: number;
    estimatedDuration: number;
    completions?: number;
    averageScore?: number;
  };
  
  // Metadata
  subject?: string;
  gradeLevel?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ConceptFilters {
  type?: string;
  discipline?: string;
  difficulty?: string;
  bookId?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LessonFilters {
  subject?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AssignmentData {
  studentIds?: string[];
  groupIds?: string[];
  dueDate?: Date | string;
  availableFrom?: Date | string;
  availableUntil?: Date | string;
}

export interface LessonSubmission {
  answers: Record<string, any>;
}

// ============================================
// Enhanced Educational API Client
// ============================================

export class EducationalApiClient extends BaseApiClient {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  // ========================================
  // Book Methods (existing)
  // ========================================
  
  async getBooks(params?: BookQueryParams): Promise<Book[]> {
    const response = await this.request<{ books: Book[] }>('/books', {
      method: 'GET',
      params
    });
    return response.books || response as any || [];
  }

  async getBookById(id: string): Promise<Book> {
    return this.request<Book>(`/books/${id}`, { method: 'GET' });
  }

  async createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
    return this.request<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(book)
    });
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
    return this.request<Book>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteBook(id: string): Promise<void> {
    return this.request<void>(`/books/${id}`, { method: 'DELETE' });
  }

  async getBooksByCategory(category: MainCategory, subCategory?: SubCategory): Promise<Book[]> {
    const endpoint = `/books/category/${category}`;
    const response = await this.request<{ books: Book[] }>(endpoint, {
      method: 'GET',
      params: subCategory ? { subCategory } : undefined
    });
    return response.books || response as any || [];
  }

  async getBooksByDifficulty(level: DifficultyLevel): Promise<Book[]> {
    const response = await this.request<{ books: Book[] }>('/books', {
      method: 'GET',
      params: { difficulty: level }
    });
    return response.books || response as any || [];
  }

  // ========================================
  // Concept Methods (new)
  // ========================================
  
  async getConcepts(filters?: ConceptFilters): Promise<{ concepts: Concept[]; pagination: any }> {
    return this.request('/concepts', {
      method: 'GET',
      params: filters
    });
  }

  async searchConcepts(query: string, filters?: Omit<ConceptFilters, 'search'>): Promise<{
    query: string;
    results: Concept[];
    count: number;
  }> {
    return this.request('/concepts/search', {
      method: 'GET',
      params: { q: query, ...filters }
    });
  }

  async getConceptById(id: string): Promise<Concept> {
    return this.request(`/concepts/${id}`, { method: 'GET' });
  }

  async getConceptsByBook(bookId: string): Promise<{
    bookId: string;
    concepts: Concept[];
    count: number;
  }> {
    return this.request(`/concepts/book/${bookId}`, { method: 'GET' });
  }

  async getConceptsByType(type: string, discipline?: string): Promise<{
    type: string;
    discipline?: string;
    concepts: Concept[];
    count: number;
  }> {
    return this.request(`/concepts/type/${type}`, {
      method: 'GET',
      params: discipline ? { discipline } : undefined
    });
  }

  async markConceptComplete(id: string, score?: number): Promise<{
    message: string;
    conceptId: string;
    score?: number;
    stats: any;
  }> {
    return this.request(`/concepts/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ score })
    });
  }

  // Teacher methods for concepts
  async createConcept(concept: Omit<Concept, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    message: string;
    concept: Concept;
  }> {
    return this.request('/concepts', {
      method: 'POST',
      body: JSON.stringify(concept)
    });
  }

  async updateConcept(id: string, updates: Partial<Concept>): Promise<{
    message: string;
    concept: Concept;
  }> {
    return this.request(`/concepts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteConcept(id: string): Promise<{
    message: string;
    conceptId: string;
  }> {
    return this.request(`/concepts/${id}`, { method: 'DELETE' });
  }

  async bulkCreateConcepts(concepts: Array<Omit<Concept, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{
    message: string;
    created: number;
    concepts: Concept[];
  }> {
    return this.request('/concepts/bulk-create', {
      method: 'POST',
      body: JSON.stringify({ concepts })
    });
  }

  // ========================================
  // Lesson Methods (new)
  // ========================================
  
  async getLessons(filters?: LessonFilters): Promise<{
    lessons: Lesson[];
    pagination: any;
    isTeacher: boolean;
  }> {
    return this.request('/lessons', {
      method: 'GET',
      params: filters
    });
  }

  async getLessonById(id: string): Promise<Lesson> {
    return this.request(`/lessons/${id}`, { method: 'GET' });
  }

  async createLesson(lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<{
    message: string;
    lesson: Lesson;
  }> {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson)
    });
  }

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<{
    message: string;
    lesson: Lesson;
  }> {
    return this.request(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteLesson(id: string): Promise<{
    message: string;
    lessonId: string;
  }> {
    return this.request(`/lessons/${id}`, { method: 'DELETE' });
  }

  async publishLesson(id: string, isPublished: boolean = true): Promise<{
    message: string;
    lesson: {
      id: string;
      isPublished: boolean;
      publishedAt?: Date;
    };
  }> {
    return this.request(`/lessons/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ isPublished })
    });
  }

  async assignLesson(id: string, assignment: AssignmentData): Promise<{
    message: string;
    assignment: any;
  }> {
    return this.request(`/lessons/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(assignment)
    });
  }

  async duplicateLesson(id: string): Promise<{
    message: string;
    lesson: Lesson;
  }> {
    return this.request(`/lessons/${id}/duplicate`, {
      method: 'POST'
    });
  }

  async getLessonSubmissions(id: string): Promise<{
    lessonId: string;
    submissions: any[];
    stats: any;
  }> {
    return this.request(`/lessons/${id}/submissions`, { method: 'GET' });
  }

  // Student methods for lessons
  async submitLesson(id: string, submission: LessonSubmission): Promise<{
    message: string;
    submission: any;
  }> {
    return this.request(`/lessons/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(submission)
    });
  }

  async getLessonProgress(id: string): Promise<{
    lessonId: string;
    studentId: string;
    progress: {
      started: boolean;
      completed: boolean;
      score: number | null;
      attempts: number;
      lastAttempt: Date | null;
    };
  }> {
    return this.request(`/lessons/${id}/progress`, { method: 'GET' });
  }

  // ========================================
  // Existing methods (preserved)
  // ========================================
  
  async getMathConcepts(bookId: string): Promise<any[]> {
    return this.getConceptsByBook(bookId).then(res => res.concepts);
  }

  async getScienceConcepts(bookId: string, discipline?: ScientificDiscipline): Promise<any[]> {
    return this.request(`/concepts/book/${bookId}`, {
      method: 'GET',
      params: discipline ? { type: 'science', discipline } : { type: 'science' }
    });
  }

  async getGrammarRules(bookId: string): Promise<any[]> {
    return this.request(`/concepts/book/${bookId}`, {
      method: 'GET',
      params: { type: 'grammar' }
    });
  }

  async searchContent(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    const response = await this.searchConcepts(query, filters as any);
    // Transform to SearchResult format
    return response.results.map(concept => ({
      bookId: concept.bookIds[0] || '',
      bookTitle: '',
      contentType: concept.type,
      contentId: concept.id,
      snippet: concept.topic,
      relevanceScore: 1
    }));
  }

  async getPopularBooks(limit: number = 10): Promise<Book[]> {
    const response = await this.request<{ books: Book[] }>('/books/popular', {
      method: 'GET',
      params: { limit }
    });
    return response.books || [];
  }

  async getUserProgress(userId: string, bookId: string): Promise<UserProgress> {
    return this.request(`/progress/user/${userId}/book/${bookId}`, { method: 'GET' });
  }

  async trackContentView(userId: string, contentId: string, contentType: string): Promise<void> {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ userId, contentId, contentType, event: 'view' })
    });
  }
}