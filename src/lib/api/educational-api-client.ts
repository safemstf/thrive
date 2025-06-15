// lib/api/educational-client.ts
import { BaseApiClient } from './base-api-client';
import { 
  Book, 
  MainCategory, 
  SubCategory, 
  ScientificDiscipline, 
  DifficultyLevel,
  MathConcept,
  ScienceConcept,
  GrammarRule
} from '@/types/educational.types';
import {
  EducationalAPI,
  BookQueryParams,
  SearchFilters,
  SearchResult,
  UserProgress
} from '@/types/api.types';

export class EducationalApiClient extends BaseApiClient implements EducationalAPI {
  async getBooks(params?: BookQueryParams): Promise<Book[]> {
    return this.requestWithRetry<Book[]>('/books', { params });
  }

  async getBookById(id: string): Promise<Book> {
    return this.requestWithRetry<Book>(`/books/${id}`);
  }

  async createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
    return this.requestWithRetry<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
    return this.requestWithRetry<Book>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteBook(id: string): Promise<void> {
    return this.requestWithRetry<void>(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  async getMathConcepts(bookId: string): Promise<MathConcept[]> {
    return this.requestWithRetry<MathConcept[]>(`/books/${bookId}/math-concepts`);
  }

  async getScienceConcepts(bookId: string, discipline?: ScientificDiscipline): Promise<ScienceConcept[]> {
    return this.requestWithRetry<ScienceConcept[]>(`/books/${bookId}/science-concepts`, {
      params: { discipline },
    });
  }

  async getGrammarRules(bookId: string): Promise<GrammarRule[]> {
    return this.requestWithRetry<GrammarRule[]>(`/books/${bookId}/grammar-rules`);
  }

  async searchContent(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    return this.requestWithRetry<SearchResult[]>('/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  }

  async getBooksByCategory(category: MainCategory, subCategory?: SubCategory): Promise<Book[]> {
    return this.requestWithRetry<Book[]>(`/categories/${category}/books`, {
      params: { subCategory },
    });
  }

  async getBooksByDifficulty(level: DifficultyLevel): Promise<Book[]> {
    return this.requestWithRetry<Book[]>('/books', {
      params: { difficulty: level },
    });
  }

  async getPopularBooks(limit: number = 10): Promise<Book[]> {
    return this.requestWithRetry<Book[]>('/analytics/popular-books', {
      params: { limit },
    });
  }

  async getUserProgress(userId: string, bookId: string): Promise<UserProgress> {
    return this.requestWithRetry<UserProgress>(`/users/${userId}/progress`, {
      params: { bookId },
    });
  }

  async trackContentView(userId: string, contentId: string, contentType: string): Promise<void> {
    return this.requestWithRetry<void>('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ userId, contentId, contentType }),
    });
  }
}