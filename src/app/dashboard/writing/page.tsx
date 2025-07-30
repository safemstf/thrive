// =============================================================================
// src/app/writing/page.tsx
'use client';
import React from 'react';
import {
  BookOpen, PenTool, Calculator, Brain, Loader2, AlertCircle, RefreshCw,
  WifiOff, CheckCircle, Clock, TrendingUp, Award, BookMarked, Users,
  Grid, List, BarChart3, Filter, ChevronDown, Plus, X, Star, Upload
} from 'lucide-react';
import { CategoryIcon } from '@/types/educational.types';
import LearningModal from '@/components/poetry/learningModal';
import { useWritingLogic } from '@/components/writing/writingLogic';
import {
  PageContainer,
  Header,
  HeaderTop,
  HeaderBottom,
  TitleSection,
  PageTitle,
  PageSubtitle,
  QuickStats,
  QuickStatItem,
  QuickStatValue,
  QuickStatLabel,
  ViewModeToggle,
  ViewModeButton,
  ControlsRight,
  SearchInput,
  FilterButton,
  FilterBadge,
  DisplayToggle,
  DisplayButton,
  FilterPanel,
  FilterSection,
  FilterTitle,
  FilterOptions,
  FilterChip,
  TagCloud,
  TagChip,
  ClearFiltersButton,
  NavigationTabs,
  TabButton,
  ContentArea,
  BooksGrid,
  BookCard,
  IconContainer,
  BookTitle,
  BookYear,
  CategoryBadge,
  ProgressIndicator,
  ConceptsGrid,
  ConceptItemCard,
  ConceptItemHeader,
  ConceptItemTitle,
  AddToPortfolioButton,
  ConceptItemDescription,
  ConceptItemMeta,
  MetaItem,
  DifficultyBadge,
  ConceptProgress,
  StatusBadge,
  ScoreBadge,
  ProgressDashboard,
  StatsGrid,
  StatCard,
  StatIcon,
  StatValue,
  StatLabel,
  ProgressBar,
  ProgressFill,
  ProgressText,
  ConceptList,
  ConceptCard,
  ConceptHeader,
  ConceptTitle,
  ConceptDescription,
  ConceptFooter,
  AchievementsSection,
  LoadingContainer,
  LoadingText,
  ErrorContainer,
  ErrorIcon,
  ErrorTitle,
  ErrorMessage,
  RetryButton,
  EmptyState,
  EmptyMessage,
  CreatePortfolioButton
} from '@/components/writing/writingStyles';
import { QuickCreateButton, PortfolioCreation } from '@/components/portfolio/portfolioCreation';


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

export default function EnhancedWritingPage() {
  const {
    // State
    activeSection,
    selectedBook,
    isModalOpen,
    filteredBooks,
    filteredConcepts,
    loadingState,
    error,
    portfolioIntegration,
    viewMode,
    displayMode,
    showFilters,
    selectedDifficulty,
    selectedTags,
    searchQuery,
    progressStats,
    allTags,
    sections,
    
    // Setters
    setActiveSection,
    setViewMode,
    setDisplayMode,
    setShowFilters,
    setSearchQuery,
    
    // Handlers
    addConceptToPortfolio,
    openModal,
    closeModal,
    handleRetry,
    clearFilters,
    toggleTag,
    toggleDifficulty
  } = useWritingLogic();

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
          <QuickCreateButton 
            type="educational"
            size="large"
            onSuccess={(portfolioId) => {
              // Refresh the page data to show the new portfolio
              window.location.reload();
            }}
          />
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


  const renderBookCard = (book: any) => (
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

  const renderConceptCard = (concept: any) => {
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
                    onClick={() => toggleDifficulty(diff)}
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
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </TagChip>
                ))}
              </TagCloud>
            </FilterSection>
            <ClearFiltersButton onClick={clearFilters}>
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