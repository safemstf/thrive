// ==================== Portfolio Discovery Page ====================
// src/pages/portfolio/discover.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { Search, Filter, TrendingUp, Star } from 'lucide-react';
import { usePaginatedDiscoverPortfolios, useFeaturedPortfolios } from '@/hooks/usePortfolioQueries';
import { PortfolioFilters, PortfolioListResponse } from '@/types/portfolio.types';

export function PortfolioDiscoverPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PortfolioFilters>({
    visibility: 'public',
    sortBy: 'recent'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Use paginated discovery hook
  const {
    data: portfolioData,
    nextPage,
    isFetching,
    reset
  } = usePaginatedDiscoverPortfolios(filters);

  const { data: featuredPortfolios } = useFeaturedPortfolios(6);

  // Use portfolioData directly
  const portfolios = portfolioData?.portfolios ?? [];
  const hasMore = portfolioData?.hasMore ?? false;

  // Reset pagination when filters change
  useEffect(() => {
    reset();
  }, [filters, reset]);

  return (
    <DiscoverContainer>
      <DiscoverHeader>
        <HeaderContent>
          <Title>Discover Portfolios</Title>
          <Subtitle>Explore amazing work from talented artists</Subtitle>
        </HeaderContent>
        
        <SearchBar>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search portfolios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>
      </DiscoverHeader>

      {featuredPortfolios && featuredPortfolios.length > 0 && (
        <FeaturedSection>
          <SectionTitle>
            <Star size={20} />
            Featured Portfolios
          </SectionTitle>
          <FeaturedGrid>
            {featuredPortfolios.map(portfolio => (
              <PortfolioCard
                key={portfolio.id}
                onClick={() => router.push(`/portfolio/${portfolio.userId}`)}
              >
                <CardCover src={portfolio.coverImage || '/default-cover.jpg'} alt="" />
                <CardInfo>
                  <CardAvatar src={portfolio.profileImage || '/default-avatar.png'} alt="" />
                  <CardDetails>
                    <CardTitle>{portfolio.title}</CardTitle>
                    <CardMeta>
                      {portfolio.stats.totalPieces} artworks • 
                      {portfolio.stats.averageRating && (
                        <> <Star size={14} fill="currentColor" /> {portfolio.stats.averageRating.toFixed(1)}</>
                      )}
                    </CardMeta>
                  </CardDetails>
                </CardInfo>
              </PortfolioCard>
            ))}
          </FeaturedGrid>
        </FeaturedSection>
      )}

      <MainSection>
        <FilterBar>
          <FilterButton>
            <Filter size={18} />
            Filters
          </FilterButton>
          <SortSelect
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
          >
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rated</option>
            <option value="views">Most Viewed</option>
            <option value="reviews">Most Reviewed</option>
          </SortSelect>
        </FilterBar>

        <PortfolioGrid>
          {portfolios.map(portfolio => (
            <PortfolioTile
              key={portfolio.id}
              onClick={() => router.push(`/portfolio/${portfolio.userId}`)}
            >
              <TileCover>
                <img src={portfolio.coverImage || '/default-cover.jpg'} alt="" />
                <TileOverlay>
                  <ViewButton>View Portfolio</ViewButton>
                </TileOverlay>
              </TileCover>
              <TileInfo>
                <TileHeader>
                  <TileAvatar src={portfolio.profileImage || '/default-avatar.png'} alt="" />
                  <div>
                    <TileTitle>{portfolio.title}</TileTitle>
                    {portfolio.location && <TileLocation>{portfolio.location}</TileLocation>}
                  </div>
                </TileHeader>
                <TileStats>
                  <StatItem>{portfolio.stats.totalPieces} works</StatItem>
                  <StatItem>{portfolio.stats.totalViews} views</StatItem>
                  {portfolio.stats.averageRating && (
                    <StatItem>
                      <Star size={12} fill="currentColor" />
                      {portfolio.stats.averageRating.toFixed(1)}
                    </StatItem>
                  )}
                </TileStats>
              </TileInfo>
            </PortfolioTile>
          ))}
        </PortfolioGrid>

        {hasMore && (
          <LoadMoreButton
            onClick={nextPage}
            disabled={isFetching}
          >
            {isFetching ? 'Loading...' : 'Load More'}
          </LoadMoreButton>
        )}
      </MainSection>
    </DiscoverContainer>
  );
}

// ==================== Styled Components for Discovery Page ====================
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

const SearchBar = styled.div`
  max-width: 600px;
  margin: 0 auto;
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

const FeaturedSection = styled.section`
  max-width: 1200px;
  margin: -2rem auto 3rem;
  padding: 0 2rem;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const PortfolioCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

const CardCover = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardInfo = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
`;

const CardAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const CardDetails = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem;
`;

const CardMeta = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MainSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }
`;

const SortSelect = styled.select`
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const TileTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const TileLocation = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.125rem 0 0;
`;

const TileStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 0 auto;
  padding: 0.75rem 2rem;
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