// src/app/writing/page.tsx
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  BookOpen, PenTool, Calculator, Brain, Loader2, AlertCircle, RefreshCw,
  WifiOff, CheckCircle, Clock, TrendingUp, Award, BookMarked, Users,
  Grid, List, BarChart3, Filter, ChevronDown, Plus, X, Star
} from 'lucide-react';
import { CategoryIcon, defaultSections as sections } from '@/types/educational.types';
import LearningModal from '@/components/poetry/learningModal';
import { useApiClient } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';
import type { 
  Book, 
  ConceptProgress as BaseConceptProgress, 
  Concept as BaseConcept 
} from '@/types/educational.types';

// Define missing types
type ViewMode = 'books' | 'concepts' | 'progress' | 'achievements';
type DisplayMode = 'grid' | 'list';

interface PortfolioIntegration {
  isAuthenticated: boolean;
  hasPortfolio: boolean;
  portfolioType?: 'educational' | 'creative' | 'hybrid';
  conceptProgress: Map<string, ConceptProgress>;
  totalConcepts: number;
  completedConcepts: number;
  inProgressConcepts: number;
}

// Use the base Concept type for API responses
type ApiConcept = BaseConcept;

// Enhanced types for portfolio integration
interface ConceptProgress extends Omit<BaseConceptProgress, 'startedAt' | 'completedAt'> {
  score?: number;
  attempts?: number;
  notes?: string;
  // Convert string dates to Date objects for local state
  startedAt?: Date;
  completedAt?: Date;
}

const getBookIcon = (category: CategoryIcon) => {
  const props = { size: 36, color: 'var(--icon-color, #666)' };
  switch (category) {
    case 'math':
    case 'sat':
    case 'ap':
      return <Calculator {...props} />;
    case 'english':
    case 'foundations':
      return <PenTool {...props} />;
    case 'science':
      return <Brain {...props} />;
    default:
      return <BookOpen {...props} />;
  }
};

type LoadingState = 'idle' | 'loading' | 'error' | 'success';

interface ErrorInfo {
  message: string;
  code?: string;
  canRetry: boolean;
}

export default function EnhancedWritingPage() {
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

  const apiClient = useApiClient();
  
  // Fetch books and concepts from API
  const fetchData = async (isRetry = false) => {
    try {
      setLoadingState('loading');
      setError(null);

      // Fetch books
      const fetchedBooks = await apiClient.educational.getBooks();
      setBooks(fetchedBooks);

      // Fetch concepts if in concept view
      if (viewMode === 'concepts' || viewMode === 'progress') {
        const fetchedConcepts = await apiClient.portfolio.getMyConcepts();
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
  };

  // Fetch portfolio-specific data
  const fetchPortfolioData = async () => {
    try {
      const portfolio = await apiClient.portfolio.getMyPortfolio();
      if (portfolio && (portfolio.kind === 'educational' || portfolio.kind === 'hybrid')) {
        const conceptProgressRaw = await apiClient.portfolio.getMyConcepts();
        
        // Normalize dates
        const conceptProgress = conceptProgressRaw.map((cp: any) => ({
          ...cp,
          startedAt: cp.startedAt ? new Date(cp.startedAt) : undefined,
          completedAt: cp.completedAt ? new Date(cp.completedAt) : undefined
        }));

        // Convert to Map
        const progressMap = new Map<string, ConceptProgress>();
        conceptProgress.forEach((cp: ConceptProgress) => {
          progressMap.set(cp.conceptId, cp);
        });

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
  };

  // Add concept to portfolio
  const addConceptToPortfolio = async (conceptId: string) => {
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
  };

  // Mark concept as completed
  const markConceptComplete = async (conceptId: string, score?: number) => {
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
  };

  // Error handling
  const handleError = (err: any) => {
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
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [viewMode]); // Refetch when view mode changes

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
  }, [portfolioIntegration]);

  // Calculate learning streak
  const calculateLearningStreak = (progressMap: Map<string, ConceptProgress>): number => {
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
  };

  const openModal = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchData(true);
  };

  // Render functions
  const renderError = () => {
    if (!error) return null;

    return (
      <ErrorContainer>
        <ErrorIcon>
          {error.code === 'NETWORK_ERROR' ? <WifiOff size={48} /> : <AlertCircle size={48} />}
        </ErrorIcon>
        <ErrorTitle>
          {error.code === 'NETWORK_ERROR' ? 'Connection Problem' : 'Something went wrong'}
        </ErrorTitle>
        <ErrorMessage>{error.message}</ErrorMessage>
        {error.canRetry && (
          <RetryButton onClick={handleRetry}>
            <RefreshCw size={16} />
            Try Again
          </RetryButton>
        )}
      </ErrorContainer>
    );
  };

  const renderLoading = () => (
    <LoadingContainer>
      <Loader2 className="animate-spin" size={48} />
      <LoadingText>Loading educational content...</LoadingText>
    </LoadingContainer>
  );

  const renderProgressDashboard = () => {
    if (!portfolioIntegration.hasPortfolio || portfolioIntegration.portfolioType === 'creative') {
      return (
        <EmptyState>
          <EmptyMessage>
            Create an educational portfolio to track your learning progress
          </EmptyMessage>
          <CreatePortfolioButton>
            Create Educational Portfolio
          </CreatePortfolioButton>
        </EmptyState>
      );
    }

    return (
      <ProgressDashboard>
        <StatsGrid>
          <StatCard>
            <StatIcon><BookMarked size={24} /></StatIcon>
            <StatValue>{portfolioIntegration.totalConcepts}</StatValue>
            <StatLabel>Total Concepts</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><CheckCircle size={24} /></StatIcon>
            <StatValue>{portfolioIntegration.completedConcepts}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><Clock size={24} /></StatIcon>
            <StatValue>{portfolioIntegration.inProgressConcepts}</StatValue>
            <StatLabel>In Progress</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><TrendingUp size={24} /></StatIcon>
            <StatValue>{progressStats?.streak || 0} days</StatValue>
            <StatLabel>Learning Streak</StatLabel>
          </StatCard>
        </StatsGrid>

        {progressStats && (
          <ProgressBar>
            <ProgressFill $percentage={progressStats.completionRate} />
            <ProgressText>{progressStats.completionRate.toFixed(1)}% Complete</ProgressText>
          </ProgressBar>
        )}

        {filteredConcepts.length > 0 && (
          <ConceptList $displayMode={displayMode}>
            {filteredConcepts.map(concept => {
              const progress = portfolioIntegration.conceptProgress.get(concept.id);
              return (
                <ConceptCard key={concept.id} $status={progress?.status}>
                  <ConceptHeader>
                    <ConceptTitle>{concept.title || 'Untitled Concept'}</ConceptTitle>
                    <StatusBadge $status={progress?.status || 'not-started'}>
                      {progress?.status === 'completed' && <CheckCircle size={14} />}
                      {progress?.status === 'in-progress' && <Clock size={14} />}
                      {progress?.status || 'not started'}
                    </StatusBadge>
                  </ConceptHeader>
                  <ConceptDescription>{concept.summary || 'No description available'}</ConceptDescription>
                  <ConceptFooter>
                    <DifficultyBadge $difficulty={concept.difficulty || 'intermediate'}>
                      {concept.difficulty || 'intermediate'}
                    </DifficultyBadge>
                    {progress?.score && (
                      <ScoreBadge>Score: {progress.score}%</ScoreBadge>
                    )}
                  </ConceptFooter>
                </ConceptCard>
              );
            })}
          </ConceptList>
        )}
      </ProgressDashboard>
    );
  };

  const renderBookCard = (book: Book) => (
    <BookCard
      key={book.id}
      $primaryColor={book.colors.primary}
      $secondaryColor={book.colors.secondary}
      onClick={() => openModal(book)}
    >
      <IconContainer>{getBookIcon(book.mainCategory)}</IconContainer>
      <BookTitle>{book.title}</BookTitle>
      <BookYear>Edition {book.year}</BookYear>
      <CategoryBadge>{book.subCategory.toUpperCase()}</CategoryBadge>
      {portfolioIntegration.hasPortfolio && (
        <ProgressIndicator>
          {/* Show book-level progress if available */}
        </ProgressIndicator>
      )}
    </BookCard>
  );

  const renderConceptCard = (concept: BaseConcept) => {
    const progress = portfolioIntegration.conceptProgress.get(concept.id);
    const isInPortfolio = progress !== undefined;

    return (
      <ConceptItemCard key={concept.id} $hasProgress={isInPortfolio}>
        <ConceptItemHeader>
          <ConceptItemTitle>{concept.title || 'Untitled Concept'}</ConceptItemTitle>
          {!isInPortfolio && portfolioIntegration.hasPortfolio && (
            <AddToPortfolioButton
              onClick={(e) => {
                e.stopPropagation();
                addConceptToPortfolio(concept.id);
              }}
            >
              <Plus size={16} />
            </AddToPortfolioButton>
          )}
        </ConceptItemHeader>
        <ConceptItemDescription>{concept.summary || 'No description available'}</ConceptItemDescription>
        <ConceptItemMeta>
          <MetaItem>
            <Clock size={14} />
            {concept.estimatedMinutes || 30} min
          </MetaItem>
          <DifficultyBadge $difficulty={concept.difficulty || 'intermediate'}>
            {concept.difficulty || 'intermediate'}
          </DifficultyBadge>
        </ConceptItemMeta>
        {progress && (
          <ConceptProgress>
            <StatusBadge $status={progress.status}>
              {progress.status === 'completed' && <CheckCircle size={14} />}
              {progress.status}
            </StatusBadge>
            {progress.score && <span>Score: {progress.score}%</span>}
          </ConceptProgress>
        )}
      </ConceptItemCard>
    );
  };

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

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <TitleSection>
            <PageTitle>Learning Center</PageTitle>
            <PageSubtitle>
              {viewMode === 'books' && 'Explore educational resources and curriculum'}
              {viewMode === 'concepts' && 'Browse individual learning concepts'}
              {viewMode === 'progress' && 'Track your learning journey'}
              {viewMode === 'achievements' && 'View your educational achievements'}
            </PageSubtitle>
          </TitleSection>
          {portfolioIntegration.hasPortfolio && progressStats && (
            <QuickStats>
              <QuickStatItem>
                <QuickStatValue>{progressStats.completionRate.toFixed(0)}%</QuickStatValue>
                <QuickStatLabel>Complete</QuickStatLabel>
              </QuickStatItem>
              <QuickStatItem>
                <QuickStatValue>{progressStats.streak}</QuickStatValue>
                <QuickStatLabel>Day Streak</QuickStatLabel>
              </QuickStatItem>
            </QuickStats>
          )}
        </HeaderTop>

        <HeaderBottom>
          <ViewModeToggle>
            <ViewModeButton
              $active={viewMode === 'books'}
              onClick={() => setViewMode('books')}
            >
              <BookOpen size={16} />
              Books
            </ViewModeButton>
            <ViewModeButton
              $active={viewMode === 'concepts'}
              onClick={() => setViewMode('concepts')}
            >
              <Brain size={16} />
              Concepts
            </ViewModeButton>
            {portfolioIntegration.isAuthenticated && (
              <>
                <ViewModeButton
                  $active={viewMode === 'progress'}
                  onClick={() => setViewMode('progress')}
                >
                  <TrendingUp size={16} />
                  My Progress
                </ViewModeButton>
                <ViewModeButton
                  $active={viewMode === 'achievements'}
                  onClick={() => setViewMode('achievements')}
                >
                  <Award size={16} />
                  Achievements
                </ViewModeButton>
              </>
            )}
          </ViewModeToggle>

          <ControlsRight>
            {(viewMode === 'concepts' || viewMode === 'progress') && (
              <>
                <SearchInput
                  type="text"
                  placeholder="Search concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FilterButton
                  onClick={() => setShowFilters(!showFilters)}
                  $active={showFilters}
                >
                  <Filter size={18} />
                  <span>Filters</span>
                  {(selectedDifficulty || selectedTags.size > 0) && (
                    <FilterBadge>{selectedTags.size + (selectedDifficulty ? 1 : 0)}</FilterBadge>
                  )}
                </FilterButton>
              </>
            )}
            <DisplayToggle>
              <DisplayButton
                $active={displayMode === 'grid'}
                onClick={() => setDisplayMode('grid')}
              >
                <Grid size={18} />
              </DisplayButton>
              <DisplayButton
                $active={displayMode === 'list'}
                onClick={() => setDisplayMode('list')}
              >
                <List size={18} />
              </DisplayButton>
            </DisplayToggle>
          </ControlsRight>
        </HeaderBottom>

        {showFilters && (viewMode === 'concepts' || viewMode === 'progress') && (
          <FilterPanel>
            <FilterSection>
              <FilterTitle>Difficulty</FilterTitle>
              <FilterOptions>
                {['beginner', 'intermediate', 'advanced'].map(diff => (
                  <FilterChip
                    key={diff}
                    $active={selectedDifficulty === diff}
                    onClick={() => setSelectedDifficulty(
                      selectedDifficulty === diff ? null : diff
                    )}
                  >
                    {diff}
                  </FilterChip>
                ))}
              </FilterOptions>
            </FilterSection>
            <FilterSection>
              <FilterTitle>Tags</FilterTitle>
              <TagCloud>
                {allTags.map((tag: string) => (
                  <TagChip
                    key={tag}
                    $active={selectedTags.has(tag)}
                    onClick={() => {
                      const newTags = new Set(selectedTags);
                      if (newTags.has(tag)) {
                        newTags.delete(tag);
                      } else {
                        newTags.add(tag);
                      }
                      setSelectedTags(newTags);
                    }}
                  >
                    {tag}
                  </TagChip>
                ))}
              </TagCloud>
            </FilterSection>
            <ClearFiltersButton onClick={() => {
              setSelectedDifficulty(null);
              setSelectedTags(new Set());
              setSearchQuery('');
            }}>
              Clear All Filters
            </ClearFiltersButton>
          </FilterPanel>
        )}
      </Header>

      {viewMode === 'books' && (
        <NavigationTabs>
          {sections.map(section => (
            <TabButton
              key={section.key}
              $isActive={activeSection === section.key}
              onClick={() => setActiveSection(section.key)}
              disabled={loadingState === 'loading'}
            >
              {getBookIcon(section.subCategory)}
              {section.title}
            </TabButton>
          ))}
        </NavigationTabs>
      )}

      {loadingState === 'loading' && renderLoading()}
      {loadingState === 'error' && renderError()}
      
      {loadingState === 'success' && (
        <ContentArea>
          {viewMode === 'books' && (
            <BooksGrid $displayMode={displayMode}>
              {filteredBooks.length > 0 ? (
                filteredBooks.map(renderBookCard)
              ) : (
                <EmptyState>
                  <EmptyMessage>No books available in this section.</EmptyMessage>
                </EmptyState>
              )}
            </BooksGrid>
          )}

          {viewMode === 'concepts' && (
            <ConceptsGrid $displayMode={displayMode}>
              {filteredConcepts.length > 0 ? (
                filteredConcepts.map(renderConceptCard)
              ) : (
                <EmptyState>
                  <EmptyMessage>No concepts found matching your filters.</EmptyMessage>
                </EmptyState>
              )}
            </ConceptsGrid>
          )}

          {viewMode === 'progress' && renderProgressDashboard()}

          {viewMode === 'achievements' && (
            <AchievementsSection>
              {/* Achievements UI would go here */}
              <EmptyState>
                <EmptyMessage>Complete concepts to earn achievements!</EmptyMessage>
              </EmptyState>
            </AchievementsSection>
          )}
        </ContentArea>
      )}

      {isModalOpen && selectedBook && (
        <LearningModal 
          book={selectedBook} 
          onClose={closeModal}
        />
      )}
    </PageContainer>
  );
}

// --- Styled Components ---
const PageContainer = styled.div`
  --bg-start: #f8fafc;
  --bg-end: #e2e8f0;
  --primary-color: #2c2c2c;
  --secondary-color: #64748b;
  --accent-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --border-radius: 12px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  background: linear-gradient(135deg, var(--bg-start), var(--bg-end));
  min-height: 100vh;
  font-family: 'Work Sans', sans-serif;
  color: var(--primary-color);
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: var(--shadow-sm);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem;
  
  @media (max-width: 768px) {
    padding: 1rem 1rem 1rem;
  }
`;

const HeaderBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

const ViewModeToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
`;

const ViewModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--accent-color)' : 'var(--secondary-color)'};
  font-weight: ${({ $active }) => $active ? '500' : '400'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ $active }) => $active ? 'var(--shadow-sm)' : 'none'};
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#e5e7eb'};
  }
`;

const ControlsRight = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: ${({ $active }) => $active ? 'var(--accent-color)' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  border: 1px solid ${({ $active }) => $active ? 'var(--accent-color)' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    background: ${({ $active }) => $active ? '#2563eb' : '#f9fafb'};
    border-color: ${({ $active }) => $active ? '#2563eb' : '#d1d5db'};
  }
`;

const FilterBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--error-color);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 18px;
  text-align: center;
`;

const DisplayToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
`;

const DisplayButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--secondary-color)'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#e5e7eb'};
  }
`;

const FilterPanel = styled.div`
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FilterSection = styled.div``;

const FilterTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
`;

const FilterOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterChip = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid ${({ $active }) => $active ? 'var(--accent-color)' : '#e5e7eb'};
  background: ${({ $active }) => $active ? 'var(--accent-color)' : 'white'};
  color: ${({ $active }) => $active ? 'white' : 'var(--secondary-color)'};
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: capitalize;
  
  &:hover {
    background: ${({ $active }) => $active ? '#2563eb' : '#f3f4f6'};
  }
`;

const TagCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TagChip = styled(FilterChip)`
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
`;

const ClearFiltersButton = styled.button`
  grid-column: 1 / -1;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: var(--secondary-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const NavigationTabs = styled.nav`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 2rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  border: 2px solid ${({ $isActive }) => ($isActive ? 'var(--accent-color)' : 'var(--primary-color)')};
  border-radius: var(--border-radius);
  background: ${({ $isActive }) => ($isActive ? 'var(--accent-color)' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? 'white' : 'var(--primary-color)')};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  &:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

const ContentArea = styled.div`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BooksGrid = styled.div<{ $displayMode: DisplayMode }>`
  display: grid;
  grid-template-columns: ${({ $displayMode }) => 
    $displayMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))'};
  gap: 1.5rem;
`;

const BookCard = styled.div<{ $primaryColor: string; $secondaryColor: string }>`
  --icon-color: ${({ $primaryColor }) => $primaryColor};
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ $primaryColor }) => $primaryColor}, ${({ $secondaryColor }) => $secondaryColor});
  }
`;

const IconContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;

const BookTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0.5rem 0;
  color: var(--primary-color);
`;

const BookYear = styled.span`
  font-size: 0.875rem;
  color: var(--secondary-color);
`;

const CategoryBadge = styled.span`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: var(--secondary-color);
  border-radius: 999px;
  font-size: 0.75rem;
`;

const ProgressIndicator = styled.div`
  margin-top: 1rem;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
`;

const ConceptsGrid = styled.div<{ $displayMode: DisplayMode }>`
  display: grid;
  grid-template-columns: ${({ $displayMode }) => 
    $displayMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))'};
  gap: 1.5rem;
`;

const ConceptItemCard = styled.div<{ $hasProgress: boolean }>`
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid ${({ $hasProgress }) => $hasProgress ? 'var(--accent-color)' : '#e2e8f0'};
  transition: all 0.2s;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const ConceptItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const ConceptItemTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
  flex: 1;
`;

const AddToPortfolioButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
    transform: scale(1.1);
  }
`;

const ConceptItemDescription = styled.p`
  font-size: 0.875rem;
  color: var(--secondary-color);
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const ConceptItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.813rem;
  color: var(--secondary-color);
`;

const DifficultyBadge = styled.span<{ $difficulty: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ $difficulty }) => 
    $difficulty === 'beginner' ? '#dbeafe' :
    $difficulty === 'intermediate' ? '#fef3c7' :
    $difficulty === 'advanced' ? '#fee2e2' : '#f3f4f6'};
  color: ${({ $difficulty }) => 
    $difficulty === 'beginner' ? '#1e40af' :
    $difficulty === 'intermediate' ? '#92400e' :
    $difficulty === 'advanced' ? '#991b1b' : '#374151'};
`;

const ConceptProgress = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.813rem;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ $status }) => 
    $status === 'completed' ? '#d1fae5' :
    $status === 'in-progress' ? '#fef3c7' :
    '#f3f4f6'};
  color: ${({ $status }) => 
    $status === 'completed' ? '#065f46' :
    $status === 'in-progress' ? '#92400e' :
    '#6b7280'};
`;

const ScoreBadge = styled.span`
  font-weight: 600;
  color: var(--success-color);
`;

// Progress Dashboard Components
const ProgressDashboard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid #e5e7eb;
  text-align: center;
`;

const StatIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: var(--accent-color);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--secondary-color);
`;

const ProgressBar = styled.div`
  position: relative;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: linear-gradient(90deg, var(--accent-color), var(--success-color));
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
`;

const ConceptList = styled.div<{ $displayMode: DisplayMode }>`
  display: ${({ $displayMode }) => $displayMode === 'list' ? 'flex' : 'grid'};
  ${({ $displayMode }) => $displayMode === 'list' 
    ? 'flex-direction: column; gap: 1rem;' 
    : 'grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;'};
`;

const ConceptCard = styled.div<{ $status?: string }>`
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid ${({ $status }) => 
    $status === 'completed' ? 'var(--success-color)' :
    $status === 'in-progress' ? 'var(--warning-color)' :
    '#e5e7eb'};
  transition: all 0.2s;
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const ConceptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ConceptTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
`;

const ConceptDescription = styled.p`
  font-size: 0.875rem;
  color: var(--secondary-color);
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const ConceptFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AchievementsSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Loading and Error States
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: var(--secondary-color);
  svg {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
`;

const ErrorIcon = styled.div`
  color: var(--error-color);
`;

const ErrorTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
`;

const ErrorMessage = styled.p`
  color: var(--secondary-color);
  max-width: 400px;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 1rem;
  &:hover {
    opacity: 0.9;
  }
  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
`;

const EmptyMessage = styled.p`
  color: var(--secondary-color);
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
`;

const CreatePortfolioButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 0.5rem 0;
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: var(--secondary-color);
  margin: 0;
`;

const QuickStats = styled.div`
  display: flex;
  gap: 2rem;
`;

const QuickStatItem = styled.div`
  text-align: center;
`;

const QuickStatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--accent-color);
`;

const QuickStatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--secondary-color);
`;