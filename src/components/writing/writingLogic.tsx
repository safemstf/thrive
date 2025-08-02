// =============================================================================
// src/components/writing/writingLogic.tsx
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/authProvider';
import { useApiClient } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';
import { defaultSections as sections } from '@/types/educational.types';
import type { 
  Book, 
  ConceptProgress as BaseConceptProgress, 
  Concept as BaseConcept,
} from '@/types/educational.types';

import { PortfolioKind } from '@/types/portfolio.types';
// Types
type ViewMode = 'books' | 'concepts' | 'progress' | 'achievements';
type DisplayMode = 'grid' | 'list';
type LoadingState = 'idle' | 'loading' | 'error' | 'success';

interface ErrorInfo {
  message: string;
  code?: string;
  canRetry: boolean;
}

interface PortfolioIntegration {
  isAuthenticated: boolean;
  hasPortfolio: boolean;
  portfolioType?: PortfolioKind; // Use the imported PortfolioKind type
  conceptProgress: Map<string, ConceptProgress>;
  totalConcepts: number;
  completedConcepts: number;
  inProgressConcepts: number;
}

interface ConceptProgress extends Omit<BaseConceptProgress, 'startedAt' | 'completedAt'> {
  score?: number;
  attempts?: number;
  notes?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export function useWritingLogic() {
  const { user } = useAuth();
  const apiClient = useApiClient();
  
  // Core state
  const [activeSection, setActiveSection] = useState(sections[0].key);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [concepts, setConcepts] = useState<BaseConcept[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [filteredConcepts, setFilteredConcepts] = useState<BaseConcept[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Portfolio integration state
  const [portfolioIntegration, setPortfolioIntegration] = useState<PortfolioIntegration>({
    isAuthenticated: false,
    hasPortfolio: false,
    conceptProgress: new Map(),
    totalConcepts: 0,
    completedConcepts: 0,
    inProgressConcepts: 0
  });

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('books');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch books and concepts from API
  const fetchData = useCallback(async (isRetry = false) => {
    try {
      setLoadingState('loading');
      setError(null);

      // Fetch books
      const fetchedBooks = await apiClient.educational.getBooks();
      setBooks(fetchedBooks);

      // For concepts view, we'll rely on portfolio integration to get concept data
      // The concepts state will be populated from portfolio data in fetchPortfolioData
      if (viewMode === 'concepts' || viewMode === 'progress') {
        // Set empty concepts initially - they'll be populated by portfolio data
        setConcepts([]);
      }

      // Fetch portfolio data if authenticated
      if (portfolioIntegration.isAuthenticated) {
        await fetchPortfolioData();
      }

      setLoadingState('success');
      
      if (isRetry) {
        setRetryCount(0);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      handleError(err);
    }
  }, [viewMode, portfolioIntegration.isAuthenticated, apiClient]);

  // Fetch portfolio-specific data
  const fetchPortfolioData = useCallback(async () => {
    try {
      const portfolio = await apiClient.portfolio.getMyPortfolio();
      if (portfolio && (portfolio.kind === 'educational' || portfolio.kind === 'hybrid')) {
        // Fetch concept progress data (this returns ConceptProgress[], not Concept[])
        const conceptProgressRaw = await apiClient.portfolio.getMyConcepts();
        
        // Normalize dates for concept progress
        const conceptProgress = conceptProgressRaw.map((cp: any) => ({
          ...cp,
          startedAt: cp.startedAt ? new Date(cp.startedAt) : undefined,
          completedAt: cp.completedAt ? new Date(cp.completedAt) : undefined
        }));

        // Convert to Map for easy lookup
        const progressMap = new Map<string, ConceptProgress>();
        conceptProgress.forEach((cp: ConceptProgress) => {
          progressMap.set(cp.conceptId, cp);
        });

        // Also populate concepts from progress data for concepts/progress view
        if (viewMode === 'concepts' || viewMode === 'progress') {
          const conceptsFromProgress = conceptProgress.map((progress: any) => ({
            id: progress.conceptId,
            title: progress.concept?.title || progress.title || `Concept ${progress.conceptId}`,
            summary: progress.concept?.summary || progress.summary || 'No description available',
            difficulty: progress.concept?.difficulty || progress.difficulty || 'intermediate',
            tags: progress.concept?.tags || progress.tags || [],
            estimatedMinutes: progress.concept?.estimatedMinutes || progress.estimatedMinutes || 30,
          }));
          setConcepts(conceptsFromProgress);
        }

        setPortfolioIntegration((prev: PortfolioIntegration) => ({
          ...prev,
          hasPortfolio: true,
          portfolioType: portfolio.kind,
          conceptProgress: progressMap,
          totalConcepts: conceptProgress.length,
          completedConcepts: conceptProgress.filter((cp: ConceptProgress) => cp.status === 'completed').length,
          inProgressConcepts: conceptProgress.filter((cp: ConceptProgress) => cp.status === 'in-progress').length
        }));
      }
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
    }
  }, [apiClient, viewMode]);

  // Add concept to portfolio
  const addConceptToPortfolio = useCallback(async (conceptId: string) => {
    try {
      await apiClient.portfolio.addConceptToPortfolio(conceptId, {
        status: 'in-progress',
        startedAt: new Date().toISOString()
      });

      // Update local state
      const newProgress: ConceptProgress = {
        conceptId,
        status: 'in-progress',
        startedAt: new Date()
      };

      setPortfolioIntegration((prev: PortfolioIntegration) => {
        const newProgressMap = new Map(prev.conceptProgress);
        newProgressMap.set(conceptId, newProgress);
        
        return {
          ...prev,
          conceptProgress: newProgressMap,
          totalConcepts: prev.totalConcepts + 1,
          inProgressConcepts: prev.inProgressConcepts + 1
        };
      });
    } catch (err) {
      console.error('Error adding concept to portfolio:', err);
    }
  }, [apiClient]);

  // Mark concept as completed
  const markConceptComplete = useCallback(async (conceptId: string, score?: number) => {
    try {
      await apiClient.portfolio.updateConceptProgress(conceptId, {
        status: 'completed',
      });

      // Update local state
      setPortfolioIntegration((prev: PortfolioIntegration) => {
        const progress = prev.conceptProgress.get(conceptId);
        const wasInProgress = progress?.status === 'in-progress';
        
        const newProgress: ConceptProgress = {
          ...progress,
          conceptId,
          status: 'completed',
          completedAt: new Date(),
          score
        };
        const newProgressMap = new Map(prev.conceptProgress);
        newProgressMap.set(conceptId, newProgress);
        
        return {
          ...prev,
          conceptProgress: newProgressMap,
          completedConcepts: prev.completedConcepts + 1,
          inProgressConcepts: wasInProgress ? prev.inProgressConcepts - 1 : prev.inProgressConcepts
        };
      });
    } catch (err) {
      console.error('Error marking concept complete:', err);
    }
  }, [apiClient]);

  // Error handling
  const handleError = useCallback((err: any) => {
    let errorInfo: ErrorInfo = {
      message: 'Unable to load content. Please try again.',
      canRetry: true
    };

    if (err instanceof APIError) {
      if (err.status === 404) {
        errorInfo = {
          message: 'No content found on the server.',
          code: 'NOT_FOUND',
          canRetry: false
        };
      } else if (err.status === 500) {
        errorInfo = {
          message: 'Server error. Our team has been notified.',
          code: 'SERVER_ERROR',
          canRetry: true
        };
      }
    }
    
    setError(errorInfo);
    setLoadingState('error');
  }, []);

  // Calculate learning streak
  const calculateLearningStreak = useCallback((progressMap: Map<string, ConceptProgress>): number => {
    const completedDates = Array.from(progressMap.values())
      .filter(cp => cp.status === 'completed' && cp.completedAt)
      .map(cp => cp.completedAt!)
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (completedDates.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(completedDates[0]);
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 1; i < completedDates.length; i++) {
      const prevDate = new Date(completedDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  }, []);

  // Calculate progress stats
  const progressStats = useMemo(() => {
    if (!portfolioIntegration.hasPortfolio) return null;
    
    const completionRate = portfolioIntegration.totalConcepts > 0 
      ? (portfolioIntegration.completedConcepts / portfolioIntegration.totalConcepts) * 100 
      : 0;
    
    const averageScore = Array.from(portfolioIntegration.conceptProgress.values())
      .filter(cp => cp.status === 'completed' && cp.score)
      .reduce((acc: number, cp: ConceptProgress, _, arr: ConceptProgress[]) => acc + (cp.score || 0) / arr.length, 0);
    
    return {
      completionRate,
      averageScore,
      streak: calculateLearningStreak(portfolioIntegration.conceptProgress)
    };
  }, [portfolioIntegration, calculateLearningStreak]);

  // Extract unique tags from concepts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    concepts.forEach(c => {
      if (c.tags) {
        c.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [concepts]);

  // Modal handlers
  const openModal = useCallback((book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBook(null);
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchData(true);
  }, [fetchData]);

  // Filter handlers
  const clearFilters = useCallback(() => {
    setSelectedDifficulty(null);
    setSelectedTags(new Set());
    setSearchQuery('');
  }, []);

  const toggleTag = useCallback((tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  }, [selectedTags]);

  const toggleDifficulty = useCallback((difficulty: string) => {
    setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty);
  }, [selectedDifficulty]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check authentication
  useEffect(() => {
    setPortfolioIntegration(prev => ({
      ...prev,
      isAuthenticated: !!user
    }));
  }, [user]);

  // Filter content when section or filters change
  useEffect(() => {
    const section = sections.find(s => s.key === activeSection);
    
    if (viewMode === 'books') {
      let filtered = books;
      
      if (section) {
        filtered = books.filter(
          b => b.mainCategory === section.mainCategory && b.subCategory === section.subCategory
        );
      }
      
      setFilteredBooks(filtered);
    } else if (viewMode === 'concepts' || viewMode === 'progress') {
      let filtered = concepts;
      
      // Apply filters
      if (selectedDifficulty) {
        filtered = filtered.filter(c => c.difficulty === selectedDifficulty);
      }
      
      if (selectedTags.size > 0) {
        filtered = filtered.filter(c => 
          c.tags && c.tags.some((tag: string) => selectedTags.has(tag))
        );
      }
      
      if (searchQuery) {
        filtered = filtered.filter(c => 
          (c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (c.summary?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
        );
      }
      
      // If in progress view, only show concepts with progress
      if (viewMode === 'progress') {
        filtered = filtered.filter(c => 
          portfolioIntegration.conceptProgress.has(c.id)
        );
      }
      
      setFilteredConcepts(filtered);
    }
  }, [activeSection, books, concepts, viewMode, selectedDifficulty, selectedTags, searchQuery, portfolioIntegration.conceptProgress]);

  return {
    // State
    activeSection,
    selectedBook,
    isModalOpen,
    books,
    concepts,
    filteredBooks,
    filteredConcepts,
    loadingState,
    error,
    retryCount,
    portfolioIntegration,
    viewMode,
    displayMode,
    showFilters,
    selectedDifficulty,
    selectedTags,
    searchQuery,
    progressStats,
    allTags,
    
    // Setters
    setActiveSection,
    setViewMode,
    setDisplayMode,
    setShowFilters,
    setSearchQuery,
    
    // Handlers
    fetchData,
    addConceptToPortfolio,
    markConceptComplete,
    openModal,
    closeModal,
    handleRetry,
    clearFilters,
    toggleTag,
    toggleDifficulty,
    
    // Utils
    sections
  };
}