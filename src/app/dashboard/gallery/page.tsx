'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Eye, EyeOff, Search, X, Check, Image, 
  Loader, Heart, LayoutGrid, Columns, List,
  Wifi, WifiOff, RefreshCw, AlertCircle, Sparkles,
  Edit3, Settings, Upload, Globe, Lock, Zap,
  TrendingUp, Users, Calendar
} from 'lucide-react';

import { useOffline } from '@/hooks/useOffline';
import type { 
  GalleryPiece, 
  GalleryVisibility, 
  GalleryLayout,
  ArtworkCategory
} from '@/types/gallery.types';
import type { Portfolio } from '@/types/portfolio.types';

import {
  PageContainer, Card, BaseButton, Badge, LoadingContainer, LoadingSpinner,
  Input, Header, Container, EmptyState, MessageContainer, responsive
} from '@/styles/styled-components';
import styled from 'styled-components';

// ===========================================
// EFFICIENT STYLED COMPONENTS
// ===========================================

const StudioContainer = styled(PageContainer)`
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at 38% 62%, rgba(139, 92, 246, 0.03), transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const StudioHeader = styled(Header)`
  padding: var(--spacing-lg) 0;
  ${responsive.below.md} { padding: var(--spacing-md) 0; }
`;

const HeaderGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--spacing-lg);
  align-items: center;
  
  ${responsive.below.lg} {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    text-align: center;
  }
`;

const StudioBranding = styled.div`
  h1 {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 300;
    background: linear-gradient(135deg, var(--color-text-primary), var(--color-primary-600));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
  }
`;

const QuickStats = styled.div`
  display: flex;
  gap: var(--spacing-md);
  
  .stat {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-background-tertiary);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
    }
    
    .value {
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }
`;

const PortfolioActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
`;

const StatusBadge = styled.div<{ $online: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: ${p => p.$online ? 'var(--color-success-50)' : 'var(--color-warning-50)'};
  color: ${p => p.$online ? 'var(--color-success-600)' : 'var(--color-warning-600)'};
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
`;

const ControlBar = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr auto;
  gap: var(--spacing-lg);
  align-items: center;
  margin-top: var(--spacing-lg);
  
  ${responsive.below.md} {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

const SearchBox = styled.div`
  position: relative;
  
  .search-icon {
    position: absolute;
    left: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-secondary);
  }
  
  input {
    padding-left: 3rem;
  }
  
  .clear {
    position: absolute;
    right: var(--spacing-xs);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--spacing-xs);
    color: var(--color-text-secondary);
    border-radius: var(--radius-xs);
    
    &:hover {
      background: var(--color-background-tertiary);
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  
  select {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--color-border-medium);
    border-radius: var(--radius-xs);
    background: var(--color-background-secondary);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    
    &:focus {
      outline: none;
      border-color: var(--color-primary-500);
    }
  }
  
  .count {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-background-tertiary);
    border-radius: var(--radius-xs);
  }
`;

const LayoutSwitcher = styled.div`
  display: flex;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-sm);
  padding: 0.25rem;
  
  button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    border-radius: var(--radius-xs);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    
    &.active {
      background: var(--color-primary-500);
      color: white;
    }
    
    &:hover:not(.active) {
      background: var(--color-primary-100);
      color: var(--color-primary-700);
    }
  }
`;

const WorksGrid = styled.div<{ $layout: GalleryLayout }>`
  ${({ $layout }) => {
    switch ($layout) {
      case 'grid': return 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-md);';
      case 'masonry': return 'columns: auto; column-width: 300px; column-gap: var(--spacing-md);';
      case 'list': return 'display: flex; flex-direction: column; gap: var(--spacing-sm);';
    }
  }}
`;

const ArtworkCard = styled(Card)<{ $layout: GalleryLayout }>`
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  ${({ $layout }) => $layout === 'masonry' && 'break-inside: avoid; margin-bottom: var(--spacing-md);'}
  ${({ $layout }) => $layout === 'list' && 'display: flex; align-items: center; padding: var(--spacing-md);'}
  
  &:hover {
    transform: ${({ $layout }) => $layout !== 'list' ? 'translateY(-4px)' : 'none'};
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary-500);
  }
`;

const ArtworkImage = styled.div<{ $layout: GalleryLayout }>`
  position: relative;
  background: var(--color-background-tertiary);
  overflow: hidden;
  
  ${({ $layout }) => {
    switch ($layout) {
      case 'grid': return 'aspect-ratio: 1.618/1; height: 240px;';
      case 'list': return 'width: 120px; height: 120px; flex-shrink: 0; border-radius: var(--radius-xs);';
      case 'masonry': return 'min-height: 200px;';
    }
  }}
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img { transform: scale(1.05); }
`;

const QuickActions = styled.div`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ArtworkCard}:hover & { opacity: 1; }
  
  button {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-xs);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--color-primary-500);
      color: white;
      transform: scale(1.1);
    }
  }
`;

const ArtworkContent = styled.div<{ $layout: GalleryLayout }>`
  padding: var(--spacing-md);
  
  ${({ $layout }) => $layout === 'list' && `
    flex: 1;
    padding: 0 0 0 var(--spacing-md);
  `}
  
  h3 {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--color-border-light);
    font-size: 0.75rem;
  }
  
  .stats {
    display: flex;
    gap: var(--spacing-md);
    color: var(--color-text-secondary);
    
    span {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      
      .value {
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }
  }
`;

const VisibilityBadge = styled(Badge)<{ $visibility: GalleryVisibility }>`
  ${({ $visibility }) => {
    switch ($visibility) {
      case 'public': return 'background: var(--color-success-50); color: var(--color-success-600);';
      case 'private': return 'background: var(--color-warning-50); color: var(--color-warning-600);';
      default: return 'background: var(--color-background-tertiary); color: var(--color-text-secondary);';
    }
  }}
  font-size: 0.75rem;
  text-transform: capitalize;
`;

const Toast = styled(MessageContainer)<{ $visible: boolean }>`
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 1000;
  transform: translateX(${({ $visible }) => $visible ? '0' : '100%'});
  transition: transform 0.3s ease;
  box-shadow: var(--shadow-xl);
`;

// ===========================================
// MAIN COMPONENT
// ===========================================
export default function CreativeStudio() {
  const router = useRouter();
  const { isOffline, hasOfflineData, getOfflineData, syncData } = useOffline();

  // State - optimized for performance
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<GalleryLayout>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ArtworkCategory | 'all'>('all');
  const [filterVisibility, setFilterVisibility] = useState<GalleryVisibility | 'all'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      if (hasOfflineData) {
        const data = getOfflineData();
        if (data) {
          setGalleryPieces(data.galleryPieces || []);
          setPortfolio(data.portfolio);
        }
      }
      setLoading(false);
    };
    init();
  }, [hasOfflineData, getOfflineData]);

  // Filtered pieces - memoized for performance
  const filteredPieces = useMemo(() => {
    return galleryPieces.filter(piece => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!piece.title.toLowerCase().includes(query) &&
            !piece.description?.toLowerCase().includes(query) &&
            !piece.tags?.some(tag => tag.toLowerCase().includes(query))) {
          return false;
        }
      }
      if (filterCategory !== 'all' && piece.category !== filterCategory) return false;
      if (filterVisibility !== 'all' && piece.visibility !== filterVisibility) return false;
      return true;
    });
  }, [galleryPieces, searchQuery, filterCategory, filterVisibility]);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const handleEditArtwork = useCallback((pieceId: string) => {
    router.push(`/dashboard/gallery/edit/${pieceId}`);
  }, [router]);

  const toggleVisibility = useCallback((pieceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryPieces(prev => prev.map(piece => 
      (piece.id === pieceId || piece._id === pieceId)
        ? { ...piece, visibility: piece.visibility === 'public' ? 'private' : 'public' }
        : piece
    ));
    showNotification('success', 'Visibility updated');
  }, [showNotification]);

  if (loading) {
    return (
      <StudioContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading your creative studio...</p>
        </LoadingContainer>
      </StudioContainer>
    );
  }

  const stats = portfolio?.stats;
  const publicCount = galleryPieces.filter(p => p.visibility === 'public').length;

  return (
    <StudioContainer>
      <StudioHeader>
        <Container>
          <HeaderGrid>
            <StudioBranding>
              <h1>Professional Portfolio</h1>
              <p>Curate and showcase your creative work</p>
              {stats && (
                <QuickStats>
                  <div className="stat">
                    <Image size={14} />
                    <span className="value">{stats.totalPieces}</span>
                    <span>works</span>
                  </div>
                  <div className="stat">
                    <Globe size={14} />
                    <span className="value">{publicCount}</span>
                    <span>public</span>
                  </div>
                  <div className="stat">
                    <TrendingUp size={14} />
                    <span className="value">{stats.totalViews?.toLocaleString() || 0}</span>
                    <span>views</span>
                  </div>
                </QuickStats>
              )}
            </StudioBranding>

            <PortfolioActions>
              <BaseButton onClick={() => showNotification('info', 'Upload coming soon')} disabled={isOffline}>
                <Upload size={16} />
                Upload
              </BaseButton>
              <BaseButton $variant="ghost" onClick={() => window.location.reload()}>
                <RefreshCw size={16} />
              </BaseButton>
            </PortfolioActions>

            <StatusBadge $online={!isOffline}>
              {isOffline ? <WifiOff size={12} /> : <Wifi size={12} />}
              {isOffline ? 'Offline' : 'Live'}
            </StatusBadge>
          </HeaderGrid>

          <ControlBar>
            <SearchBox>
              <Search size={16} className="search-icon" />
              <Input
                type="text"
                placeholder="Search artwork..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="clear">
                  <X size={14} />
                </button>
              )}
            </SearchBox>

            <FilterGroup>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as any)}>
                <option value="all">All Categories</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
                <option value="abstract">Abstract</option>
                <option value="mixed-media">Mixed Media</option>
                <option value="Digital">Digital</option>
                <option value="Design">Design</option>
              </select>
              <select value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value as any)}>
                <option value="all">All Status</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <div className="count">{filteredPieces.length} of {galleryPieces.length}</div>
            </FilterGroup>

            <LayoutSwitcher>
              {(['grid', 'masonry', 'list'] as const).map((type) => (
                <button 
                  key={type}
                  className={layout === type ? 'active' : ''}
                  onClick={() => setLayout(type)}
                >
                  {type === 'grid' && <LayoutGrid size={16} />}
                  {type === 'masonry' && <Columns size={16} />}
                  {type === 'list' && <List size={16} />}
                  {type}
                </button>
              ))}
            </LayoutSwitcher>
          </ControlBar>
        </Container>
      </StudioHeader>

      <Container style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
        {filteredPieces.length === 0 ? (
          <EmptyState style={{ minHeight: '60vh' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-purple-600))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <Sparkles size={48} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: 'var(--spacing-md)' }}>
              {searchQuery || filterCategory !== 'all' ? 'No matches found' : 'Start your portfolio'}
            </h2>
            <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
              {searchQuery || filterCategory !== 'all' 
                ? 'Try adjusting your filters or search terms.'
                : 'Upload your first artwork to begin building your professional portfolio.'}
            </p>
            {!searchQuery && filterCategory === 'all' && (
              <BaseButton onClick={() => showNotification('info', 'Upload feature coming soon')}>
                <Plus size={16} />
                Upload First Work
              </BaseButton>
            )}
          </EmptyState>
        ) : (
          <WorksGrid $layout={layout}>
            {filteredPieces.map((piece) => (
              <ArtworkCard 
                key={piece.id || piece._id} 
                $layout={layout}
                onClick={() => handleEditArtwork(piece.id || piece._id)}
              >
                <ArtworkImage $layout={layout}>
                  <img 
                    src={piece.thumbnailUrl || piece.imageUrl}
                    alt={piece.alt || piece.title}
                    loading="lazy"
                  />
                  
                  <QuickActions>
                    <button 
                      onClick={(e) => toggleVisibility(piece.id || piece._id, e)}
                      title={piece.visibility === 'public' ? 'Make Private' : 'Make Public'}
                    >
                      {piece.visibility === 'public' ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEditArtwork(piece.id || piece._id); }}
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                  </QuickActions>
                </ArtworkImage>
                
                <ArtworkContent $layout={layout}>
                  <h3>{piece.title}</h3>
                  
                  <div className="meta">
                    <div className="stats">
                      <span>
                        <Eye size={12} />
                        <span className="value">{piece.views || 0}</span>
                      </span>
                      <span>
                        <Heart size={12} />
                        <span className="value">{piece.likes || 0}</span>
                      </span>
                    </div>
                    
                    <VisibilityBadge $visibility={piece.visibility}>
                      {piece.visibility}
                    </VisibilityBadge>
                  </div>
                </ArtworkContent>
              </ArtworkCard>
            ))}
          </WorksGrid>
        )}
      </Container>

      <Toast $type={notification?.type || 'info'} $visible={!!notification}>
        {notification?.type === 'success' && <Check size={16} />}
        {notification?.type === 'error' && <AlertCircle size={16} />}
        {notification?.type === 'info' && <Zap size={16} />}
        {notification?.message}
      </Toast>
    </StudioContainer>
  );
}