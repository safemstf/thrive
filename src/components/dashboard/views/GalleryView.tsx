// src/components/dashboard/views/GalleryView.tsx - Golden Ratio Design
'use client';

import React from 'react';
import { Image, Eye, Heart, ExternalLink, Download, Share, Plus, Grid3X3, List, Filter } from 'lucide-react';
import styled from 'styled-components';

// Use shared components from dashboardStyles
import {
  ViewContainer,
  ViewCard,
  EmptyStateCard,
  EmptyIcon,
  EmptyTitle,
  EmptyMessage,
  Card,
  FlexRow,
  FlexColumn,
  Heading2,
  BaseButton,
  BodyText,
} from '../dashboardStyles';

import {
    responsive
} from '@/styles/styled-components';

// ===========================================
// GOLDEN RATIO GALLERY SYSTEM
// ===========================================
const GOLDEN_RATIO = 1.618;
const GOLDEN_SCALE = {
  xs: `${0.618}rem`,
  sm: `${1}rem`,
  md: `${1.618}rem`,
  lg: `${2.618}rem`,
  xl: `${4.236}rem`,
  xxl: `${6.854}rem`
};

// ===========================================
// GALLERY-SPECIFIC COMPONENTS
// ===========================================

const GalleryHeader = styled(Card).attrs({ $glass: true })`
  padding: ${GOLDEN_SCALE.lg};
  margin-bottom: ${GOLDEN_SCALE.xl};
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  
  .header-content {
    display: grid;
    grid-template-columns: ${GOLDEN_RATIO}fr 1fr;
    align-items: center;
    gap: ${GOLDEN_SCALE.lg};
    
    ${responsive.below.md} {
      grid-template-columns: 1fr;
      gap: ${GOLDEN_SCALE.md};
    }
  }
  
  .title-section {
    h2 {
      margin: 0 0 ${GOLDEN_SCALE.xs} 0;
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 300;
      letter-spacing: -0.01em;
      background: linear-gradient(135deg, var(--color-text-primary), var(--color-primary-600));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 1rem;
      font-weight: 400;
    }
    
    .stats-row {
      display: flex;
      gap: ${GOLDEN_SCALE.md};
      margin-top: ${GOLDEN_SCALE.sm};
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: ${GOLDEN_SCALE.xs};
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        
        .stat-value {
          font-weight: 600;
          color: var(--color-text-primary);
          font-family: var(--font-mono);
        }
      }
    }
  }
  
  .actions-section {
    display: flex;
    flex-direction: column;
    gap: ${GOLDEN_SCALE.sm};
    align-items: flex-end;
    
    ${responsive.below.md} {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    
    .view-controls {
      display: flex;
      gap: ${GOLDEN_SCALE.xs};
      background: var(--color-background-tertiary);
      padding: 0.25rem;
      border-radius: ${GOLDEN_SCALE.xs};
      border: 1px solid var(--color-border-light);
    }
    
    .view-button {
      padding: ${GOLDEN_SCALE.xs};
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      border-radius: calc(${GOLDEN_SCALE.xs} - 0.25rem);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      
      &.active {
        background: var(--color-primary-500);
        color: white;
        box-shadow: var(--shadow-sm);
      }
      
      &:hover:not(.active) {
        background: var(--color-primary-100);
        color: var(--color-primary-700);
      }
    }
  }
`;

const GalleryGrid = styled.div<{ $viewMode: 'grid' | 'masonry' | 'list' }>`
  ${({ $viewMode }) => {
    switch ($viewMode) {
      case 'masonry':
        return `
          columns: auto;
          column-width: 320px;
          column-gap: ${GOLDEN_SCALE.md};
          break-inside: avoid;
        `;
      case 'list':
        return `
          display: flex;
          flex-direction: column;
          gap: ${GOLDEN_SCALE.md};
        `;
      default:
        return `
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: ${GOLDEN_SCALE.md};
        `;
    }
  }}
  
  ${responsive.below.md} {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${GOLDEN_SCALE.sm};
  }
  
  ${responsive.below.sm} {
    grid-template-columns: 1fr;
  }
`;

const GalleryCard = styled(ViewCard)<{ $viewMode: 'grid' | 'masonry' | 'list' }>`
  overflow: hidden;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  break-inside: avoid;
  
  ${({ $viewMode }) => $viewMode === 'list' && `
    display: flex;
    flex-direction: row;
    max-height: 200px;
  `}
  
  &:hover {
    border-color: var(--color-primary-500);
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
`;

const ImageContainer = styled.div<{ $viewMode: 'grid' | 'masonry' | 'list' }>`
  position: relative;
  width: 100%;
  background: var(--color-background-tertiary);
  overflow: hidden;
  
  ${({ $viewMode }) => {
    switch ($viewMode) {
      case 'list':
        return `
          width: 240px;
          height: 200px;
          flex-shrink: 0;
        `;
      case 'masonry':
        return `
          aspect-ratio: auto;
          min-height: 200px;
        `;
      default:
        return `
          aspect-ratio: ${GOLDEN_RATIO}/1; // Golden ratio aspect
          height: 240px;
        `;
    }
  }}
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: linear-gradient(135deg, var(--color-background-tertiary), var(--color-background-secondary));
    
    svg {
      color: var(--color-text-secondary);
      opacity: 0.5;
    }
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${GOLDEN_SCALE.sm};
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${ImageContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: ${GOLDEN_SCALE.xs};
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-text-primary);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: var(--color-primary-500);
    color: white;
    border-color: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
    background: var(--color-primary-600);
  }
`;

const CardContent = styled.div<{ $viewMode: 'grid' | 'masonry' | 'list' }>`
  padding: ${GOLDEN_SCALE.md};
  
  ${({ $viewMode }) => $viewMode === 'list' && `
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `}
`;

const CardTitle = styled.h3`
  margin: 0 0 ${GOLDEN_SCALE.xs} 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
  
  /* Limit to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardDescription = styled.p`
  margin: 0 0 ${GOLDEN_SCALE.sm} 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  
  /* Limit to 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${GOLDEN_SCALE.sm};
  padding-top: ${GOLDEN_SCALE.sm};
  border-top: 1px solid var(--color-border-light);
`;

const StatGroup = styled.div`
  display: flex;
  gap: ${GOLDEN_SCALE.md};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SCALE.xs};
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  
  .value {
    font-weight: 600;
    color: var(--color-text-primary);
    font-family: var(--font-mono);
  }
`;

const CategoryBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  border: 1px solid var(--color-primary-200);
  border-radius: ${GOLDEN_SCALE.xs};
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DateStamp = styled.div`
  font-size: 0.625rem;
  color: var(--color-text-secondary);
  margin-top: ${GOLDEN_SCALE.xs};
  text-align: right;
  font-weight: 500;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${GOLDEN_SCALE.lg};
  padding: ${GOLDEN_SCALE.md};
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: ${GOLDEN_SCALE.sm};
  
  .filter-group {
    display: flex;
    gap: ${GOLDEN_SCALE.sm};
    align-items: center;
  }
  
  .filter-select {
    padding: ${GOLDEN_SCALE.xs} ${GOLDEN_SCALE.sm};
    border: 1px solid var(--color-border-medium);
    border-radius: ${GOLDEN_SCALE.xs};
    background: var(--color-background-primary);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      border-color: var(--color-primary-500);
      background: var(--color-background-secondary);
    }
    
    &:focus {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      background: var(--color-background-secondary);
    }
  }
  
  .results-count {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }
`;

// ===========================================
// COMPONENT
// ===========================================

interface GalleryViewProps {
  galleryItems: any[];
  portfolioId?: string;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ galleryItems, portfolioId }) => {
  const [viewMode, setViewMode] = React.useState<'grid' | 'masonry' | 'list'>('grid');
  const [sortBy, setSortBy] = React.useState('newest');
  const [filterBy, setFilterBy] = React.useState('all');

  // Calculate stats
  const totalViews = galleryItems.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalLikes = galleryItems.reduce((sum, item) => sum + (item.likes || 0), 0);
  const avgEngagement = galleryItems.length > 0 ? Math.round((totalLikes / totalViews) * 100) || 0 : 0;

  // Get unique categories
  const categories = [...new Set(galleryItems.map(item => item.category).filter(Boolean))];

  // Filter and sort items
  const processedItems = React.useMemo(() => {
    let filtered = galleryItems;
    
    if (filterBy !== 'all') {
      filtered = galleryItems.filter(item => item.category === filterBy);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'liked':
          return (b.likes || 0) - (a.likes || 0);
        default: // newest
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [galleryItems, sortBy, filterBy]);

  return (
    <ViewContainer>
      {/* Gallery Header */}
      <GalleryHeader>
        <div className="header-content">
          <div className="title-section">
            <h2>Your Gallery</h2>
            <p className="subtitle">
              {galleryItems.length} {galleryItems.length === 1 ? 'piece' : 'pieces'} in your collection
            </p>
            <div className="stats-row">
              <div className="stat-item">
                <Eye size={14} />
                <span className="stat-value">{totalViews.toLocaleString()}</span>
                <span>views</span>
              </div>
              <div className="stat-item">
                <Heart size={14} />
                <span className="stat-value">{totalLikes}</span>
                <span>likes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{avgEngagement}%</span>
                <span>engagement</span>
              </div>
            </div>
          </div>
          
          <div className="actions-section">
            <BaseButton $variant="primary">
              <Plus size={16} />
              Add New Piece
            </BaseButton>
            
            <div className="view-controls">
              <button 
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid3X3 size={16} />
              </button>
              <button 
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </GalleryHeader>

      {/* Filter Bar */}
      {galleryItems.length > 0 && (
        <FilterBar>
          <div className="filter-group">
            <Filter size={16} color="var(--color-text-secondary)" />
            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Viewed</option>
              <option value="liked">Most Liked</option>
            </select>
            
            {categories.length > 0 && (
              <select 
                className="filter-select"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="results-count">
            {processedItems.length} of {galleryItems.length} pieces
          </div>
        </FilterBar>
      )}

      {/* Gallery Content */}
      {galleryItems.length === 0 ? (
        <EmptyStateCard>
          <EmptyIcon>
            <Image size={48} />
          </EmptyIcon>
          <EmptyTitle>No Gallery Items Yet</EmptyTitle>
          <EmptyMessage>
            Start building your creative portfolio by uploading your first piece.
          </EmptyMessage>
          <BaseButton $variant="primary" style={{ marginTop: GOLDEN_SCALE.md }}>
            <Plus size={16} />
            Upload Your First Piece
          </BaseButton>
        </EmptyStateCard>
      ) : (
        <GalleryGrid $viewMode={viewMode}>
          {processedItems.map((item, index) => (
            <GalleryCard key={item.id || item._id || index} $viewMode={viewMode}>
              {/* Image Container */}
              <ImageContainer $viewMode={viewMode}>
                {item.thumbnailUrl || item.imageUrl ? (
                  <img 
                    src={item.thumbnailUrl || item.imageUrl} 
                    alt={item.title || 'Gallery item'}
                    loading="lazy"
                  />
                ) : (
                  <div className="placeholder">
                    <Image size={32} />
                  </div>
                )}
                
                {/* Overlay Actions */}
                <ImageOverlay>
                  <ActionButton title="View">
                    <Eye size={16} />
                  </ActionButton>
                  <ActionButton title="Share">
                    <Share size={16} />
                  </ActionButton>
                  <ActionButton title="Download">
                    <Download size={16} />
                  </ActionButton>
                  <ActionButton title="Open">
                    <ExternalLink size={16} />
                  </ActionButton>
                </ImageOverlay>
              </ImageContainer>
              
              {/* Card Content */}
              <CardContent $viewMode={viewMode}>
                <CardTitle>
                  {item.title || `Untitled ${index + 1}`}
                </CardTitle>
                
                {item.description && (
                  <CardDescription>
                    {item.description}
                  </CardDescription>
                )}
                
                {/* Stats and Meta */}
                <StatsRow>
                  <StatGroup>
                    <StatItem>
                      <Eye size={12} />
                      <span className="value">{item.views || 0}</span>
                    </StatItem>
                    <StatItem>
                      <Heart size={12} />
                      <span className="value">{item.likes || 0}</span>
                    </StatItem>
                  </StatGroup>
                  
                  {item.category && (
                    <CategoryBadge>
                      {item.category}
                    </CategoryBadge>
                  )}
                </StatsRow>
                
                {item.createdAt && (
                  <DateStamp>
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </DateStamp>
                )}
              </CardContent>
            </GalleryCard>
          ))}
        </GalleryGrid>
      )}
    </ViewContainer>
  );
};