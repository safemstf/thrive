// src/pages/portfolio/discover.tsx 
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { Search, Filter, TrendingUp, Star, Loader2, AlertCircle } from 'lucide-react';
import { useDiscoverPortfolios } from '@/hooks/usePortfolioQueries';
import { PortfolioFilters } from '@/types/portfolio.types';

export function PortfolioDiscoverPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PortfolioFilters>({
    visibility: 'public',
    sortBy: 'recent'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Use discovery hook with pagination
  const {
    data: portfolioData,
    isLoading,
    error,
    refetch
  } = useDiscoverPortfolios(filters, page, 20);

  // Extract portfolios from response
  const portfolios = portfolioData?.portfolios || portfolioData?.data || [];
  const hasMore = portfolioData?.hasMore || false;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  const handleLoadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery });
  };

  if (isLoading && page === 1) {
    return (
      <LoadingContainer>
        <Loader2 className="animate-spin" size={48} />
        <LoadingText>Loading portfolios...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error && !portfolios.length) {
    return (
      <ErrorContainer>
        <AlertCircle size={48} color="#ef4444" />
        <ErrorTitle>Failed to load portfolios</ErrorTitle>
        <ErrorText>There was an error loading the portfolio discovery page.</ErrorText>
        <RetryButton onClick={() => refetch()}>
          Try Again
        </RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <DiscoverContainer>
      <DiscoverHeader>
        <HeaderContent>
          <Title>Discover Portfolios</Title>
          <Subtitle>Explore amazing work from talented creators</Subtitle>
        </HeaderContent>
        
        <SearchForm onSubmit={handleSearch}>
          <SearchBar>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search portfolios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchButton type="submit">Search</SearchButton>
          </SearchBar>
        </SearchForm>
      </DiscoverHeader>

      <MainSection>
        <FilterBar>
          <FilterSection>
            <FilterButton>
              <Filter size={18} />
              Filters
            </FilterButton>
            
            <FilterGroup>
              <SortSelect
                value={filters.sortBy || 'recent'}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              >
                <option value="recent">Most Recent</option>
                <option value="views">Most Viewed</option>
              </SortSelect>
            </FilterGroup>
          </FilterSection>
          
          <ResultsCount>
            {portfolios.length > 0 && (
              <span>{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} found</span>
            )}
          </ResultsCount>
        </FilterBar>

        {portfolios.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🎨</EmptyIcon>
            <EmptyTitle>No portfolios found</EmptyTitle>
            <EmptyText>
              {searchQuery ? 
                `No portfolios match "${searchQuery}". Try adjusting your search terms.` :
                'No public portfolios are available right now.'
              }
            </EmptyText>
          </EmptyState>
        ) : (
          <>
            <PortfolioGrid>
              {portfolios.map((portfolio: any) => (
                <PortfolioTile
                  key={portfolio.id}
                  onClick={() => router.push(`/portfolio/${portfolio.username || portfolio.userId}`)}
                >
                  <TileCover>
                    <img 
                      src={portfolio.coverImage || '/default-cover.jpg'} 
                      alt={portfolio.title || 'Portfolio cover'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-cover.jpg';
                      }}
                    />
                    <TileOverlay>
                      <ViewButton>View Portfolio</ViewButton>
                    </TileOverlay>
                  </TileCover>
                  
                  <TileInfo>
                    <TileHeader>
                      <TileAvatar 
                        src={portfolio.profileImage || '/default-avatar.png'} 
                        alt={portfolio.title || 'Profile'}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                      <TileDetails>
                        <TileTitle>{portfolio.title || 'Untitled Portfolio'}</TileTitle>
                        {portfolio.location && <TileLocation>{portfolio.location}</TileLocation>}
                        {portfolio.tagline && <TileTagline>{portfolio.tagline}</TileTagline>}
                      </TileDetails>
                    </TileHeader>
                    
                    <TileStats>
                      {portfolio.stats?.totalPieces !== undefined && (
                        <StatItem>{portfolio.stats.totalPieces} work{portfolio.stats.totalPieces !== 1 ? 's' : ''}</StatItem>
                      )}
                      {portfolio.stats?.totalViews !== undefined && (
                        <StatItem>{portfolio.stats.totalViews} view{portfolio.stats.totalViews !== 1 ? 's' : ''}</StatItem>
                      )}
                      {portfolio.stats?.averageRating && (
                        <StatItem>
                          <Star size={12} fill="currentColor" />
                          {portfolio.stats.averageRating.toFixed(1)}
                        </StatItem>
                      )}
                    </TileStats>
                    
                    {portfolio.specializations && portfolio.specializations.length > 0 && (
                      <SpecializationTags>
                        {portfolio.specializations.slice(0, 3).map((spec: string, idx: number) => (
                          <SpecTag key={idx}>{spec}</SpecTag>
                        ))}
                        {portfolio.specializations.length > 3 && (
                          <MoreTag>+{portfolio.specializations.length - 3}</MoreTag>
                        )}
                      </SpecializationTags>
                    )}
                  </TileInfo>
                </PortfolioTile>
              ))}
            </PortfolioGrid>

            {hasMore && (
              <LoadMoreButton
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </LoadMoreButton>
            )}
          </>
        )}
      </MainSection>
    </DiscoverContainer>
  );
}

// ==================== Styled Components ====================
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
  color: #666;
`;

const ErrorContainer = styled(LoadingContainer)`
  text-align: center;
  padding: 2rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ErrorText = styled.p`
  font-size: 1rem;
  color: #6b7280;
  max-width: 500px;
  margin: 0;
`;

const RetryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1a1a1a;
  }
`;

const DiscoverContainer = styled.div`
  min-height: 100vh;
  background: #f8f8f8;
`;

const DiscoverHeader = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem 3rem;
  text-align: center;
`;

const HeaderContent = styled.div`
  max-width: 800px;
  margin: 0 auto 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
`;

const SearchForm = styled.form`
  max-width: 600px;
  margin: 0 auto;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);

  input {
    flex: 1;
    background: none;
    border: none;
    color: white;
    font-size: 1rem;
    outline: none;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;

const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MainSection = styled.section`
  max-width: 1200px;
  margin: -2rem auto 0;
  padding: 0 2rem 4rem;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    background: #f3f4f6;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const SortSelect = styled.select`
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
`;

const ResultsCount = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: #6b7280;
  max-width: 500px;
  margin: 0 auto;
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const PortfolioTile = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

const TileCover = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const TileOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;

  ${PortfolioTile}:hover & {
    opacity: 1;
  }
`;

const ViewButton = styled.div`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #111827;
  border-radius: 8px;
  font-weight: 500;
`;

const TileInfo = styled.div`
  padding: 1.5rem;
`;

const TileHeader = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TileAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const TileDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const TileTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TileLocation = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const TileTagline = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0.25rem 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TileStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const SpecializationTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SpecTag = styled.span`
  padding: 0.25rem 0.5rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const MoreTag = styled(SpecTag)`
  background: #f3f4f6;
  color: #6b7280;
`;

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 auto;
  padding: 1rem 2rem;
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #1a1a1a;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default PortfolioDiscoverPage;