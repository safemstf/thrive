// src\app\dashboard\gallery\page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { 
  Grid3x3, LayoutGrid, List, Filter, Search, Upload, 
  Eye, EyeOff, Download, Trash2, Edit, Share2, Heart,
  Calendar, Tag, DollarSign, ChevronDown, X, Check,
  Image as ImageIcon, Loader2, AlertCircle, Plus
} from 'lucide-react';

// Mock data and types
interface GalleryPiece {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  artist: string;
  portfolioId: string;
  description?: string;
  category: 'digital' | 'traditional' | 'photography' | 'mixed';
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  price?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

type ViewLayout = 'grid' | 'masonry' | 'list';
type GalleryMode = 'public' | 'private';
type SortOption = 'newest' | 'oldest' | 'popular' | 'name';

// Mock gallery component for demo
const MockGallery = ({ mode, viewConfig }: { mode: GalleryMode; viewConfig: any }) => {
  const mockPieces: GalleryPiece[] = [
    {
      id: '1',
      title: 'Abstract Composition #1',
      imageUrl: 'https://picsum.photos/400/600?random=1',
      artist: 'Jane Doe',
      portfolioId: 'portfolio-1',
      category: 'digital',
      tags: ['abstract', 'colorful', 'modern'],
      visibility: 'public',
      price: 299,
      currency: 'USD',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      views: 342,
      likes: 48,
      dimensions: { width: 400, height: 600 }
    },
    {
      id: '2',
      title: 'Nature\'s Whisper',
      imageUrl: 'https://picsum.photos/600/400?random=2',
      artist: 'John Smith',
      portfolioId: 'portfolio-2',
      category: 'photography',
      tags: ['nature', 'landscape', 'serene'],
      visibility: mode === 'private' ? 'private' : 'public',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      views: 567,
      likes: 89,
      dimensions: { width: 600, height: 400 }
    },
    // Add more mock pieces...
  ];

  const filteredPieces = mode === 'private' 
    ? mockPieces.filter(p => p.portfolioId === 'portfolio-1')
    : mockPieces;

  return (
    <GalleryGrid $layout={viewConfig.layout}>
      {filteredPieces.map(piece => (
        <GalleryItem key={piece.id} $layout={viewConfig.layout}>
          <ImageContainer>
            <img src={piece.imageUrl} alt={piece.title} />
            {mode === 'private' && (
              <VisibilityBadge $visibility={piece.visibility}>
                {piece.visibility === 'private' ? <EyeOff size={14} /> : <Eye size={14} />}
                {piece.visibility}
              </VisibilityBadge>
            )}
            <QuickActions>
              <ActionButton><Eye size={16} /></ActionButton>
              <ActionButton><Heart size={16} /></ActionButton>
              {mode === 'private' && (
                <>
                  <ActionButton><Edit size={16} /></ActionButton>
                  <ActionButton><Trash2 size={16} /></ActionButton>
                </>
              )}
            </QuickActions>
          </ImageContainer>
          <ItemInfo>
            <ItemTitle>{piece.title}</ItemTitle>
            <ItemMeta>
              <span>{piece.artist}</span>
              {piece.price && <span>${piece.price}</span>}
            </ItemMeta>
          </ItemInfo>
        </GalleryItem>
      ))}
    </GalleryGrid>
  );
};

export default function EnhancedGalleryPage() {
  const [galleryMode, setGalleryMode] = useState<GalleryMode>('public');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('masonry');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPieces, setSelectedPieces] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  const isAuthenticated = true; // Mock auth state
  const hasPortfolio = true; // Mock portfolio state

  const galleryConfig = useMemo(() => ({
    layout: viewLayout,
    itemsPerPage: 24,
    showPrivateIndicator: galleryMode === 'private',
    enableSelection: bulkActionMode,
    enableQuickEdit: galleryMode === 'private'
  }), [viewLayout, galleryMode, bulkActionMode]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic
    console.log('Searching for:', searchQuery);
  }, [searchQuery]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  };

  const handleBulkAction = (action: 'delete' | 'visibility' | 'download') => {
    console.log(`Bulk ${action} for pieces:`, Array.from(selectedPieces));
    // Implement bulk action logic
    setBulkActionMode(false);
    setSelectedPieces(new Set());
  };

  return (
    <PageWrapper>
      <Header>
        <HeaderTop>
          <TitleSection>
            <PageTitle>
              {galleryMode === 'public' ? 'Creative Gallery' : 'My Artwork'}
            </PageTitle>
            <PageSubtitle>
              {galleryMode === 'public' 
                ? 'Discover inspiring works from our creative community'
                : `Managing ${12} pieces in your portfolio`}
            </PageSubtitle>
          </TitleSection>

          <HeaderStats>
            {galleryMode === 'private' && (
              <>
                <StatItem>
                  <StatValue>12</StatValue>
                  <StatLabel>Total Pieces</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>8.4k</StatValue>
                  <StatLabel>Total Views</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>342</StatValue>
                  <StatLabel>Total Likes</StatLabel>
                </StatItem>
              </>
            )}
          </HeaderStats>
        </HeaderTop>

        <HeaderBottom>
          <ControlsLeft>
            {isAuthenticated && (
              <ModeToggle>
                <ModeButton 
                  $active={galleryMode === 'public'}
                  onClick={() => setGalleryMode('public')}
                >
                  <ImageIcon size={16} />
                  Discover
                </ModeButton>
                <ModeButton 
                  $active={galleryMode === 'private'}
                  onClick={() => setGalleryMode('private')}
                >
                  <Eye size={16} />
                  My Gallery
                </ModeButton>
              </ModeToggle>
            )}

            <SearchForm onSubmit={handleSearch}>
              <SearchInput
                type="text"
                placeholder="Search artwork, artists, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchButton type="submit">
                <Search size={18} />
              </SearchButton>
            </SearchForm>
          </ControlsLeft>

          <ControlsRight>
            <ViewToggle>
              <ViewButton
                $active={viewLayout === 'grid'}
                onClick={() => setViewLayout('grid')}
                title="Grid view"
              >
                <Grid3x3 size={18} />
              </ViewButton>
              <ViewButton
                $active={viewLayout === 'masonry'}
                onClick={() => setViewLayout('masonry')}
                title="Masonry view"
              >
                <LayoutGrid size={18} />
              </ViewButton>
              <ViewButton
                $active={viewLayout === 'list'}
                onClick={() => setViewLayout('list')}
                title="List view"
              >
                <List size={18} />
              </ViewButton>
            </ViewToggle>

            <FilterButton 
              onClick={() => setShowFilters(!showFilters)}
              $active={showFilters}
            >
              <Filter size={18} />
              <span>Filters</span>
              {(selectedCategory || selectedTags.size > 0) && (
                <FilterBadge>{selectedTags.size + (selectedCategory ? 1 : 0)}</FilterBadge>
              )}
            </FilterButton>

            {galleryMode === 'private' && (
              <>
                <ActionButton
                  onClick={() => setBulkActionMode(!bulkActionMode)}
                  $active={bulkActionMode}
                >
                  <Check size={18} />
                  <span>Select</span>
                </ActionButton>
                
                <UploadButton onClick={() => setShowUploadModal(true)}>
                  <Upload size={18} />
                  <span>Upload</span>
                </UploadButton>
              </>
            )}

            {!isAuthenticated && (
              <SignInButton>
                Sign In to Upload
              </SignInButton>
            )}
          </ControlsRight>
        </HeaderBottom>

        {showFilters && (
          <FilterPanel>
            <FilterSection>
              <FilterTitle>Categories</FilterTitle>
              <CategoryGrid>
                {['digital', 'traditional', 'photography', 'mixed'].map(category => (
                  <CategoryChip
                    key={category}
                    $active={selectedCategory === category}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category ? null : category
                    )}
                  >
                    {category}
                  </CategoryChip>
                ))}
              </CategoryGrid>
            </FilterSection>

            <FilterSection>
              <FilterTitle>Popular Tags</FilterTitle>
              <TagCloud>
                {['abstract', 'landscape', 'portrait', 'modern', 'vintage', 'nature', 'urban', 'minimal'].map(tag => (
                  <TagChip
                    key={tag}
                    $active={selectedTags.has(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag size={12} />
                    {tag}
                  </TagChip>
                ))}
              </TagCloud>
            </FilterSection>

            <FilterSection>
              <FilterTitle>Sort By</FilterTitle>
              <SortDropdown>
                <SortButton>
                  {sortBy === 'newest' ? 'Newest First' :
                   sortBy === 'oldest' ? 'Oldest First' :
                   sortBy === 'popular' ? 'Most Popular' : 'Name A-Z'}
                  <ChevronDown size={16} />
                </SortButton>
              </SortDropdown>
            </FilterSection>

            <FilterSection>
              <FilterTitle>Price Range</FilterTitle>
              <PriceInputs>
                <PriceInput
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                />
                <span>to</span>
                <PriceInput
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                />
              </PriceInputs>
            </FilterSection>

            <FilterActions>
              <ClearButton onClick={() => {
                setSelectedCategory(null);
                setSelectedTags(new Set());
                setPriceRange({ min: 0, max: 10000 });
                setSortBy('newest');
              }}>
                Clear All
              </ClearButton>
              <ApplyButton>Apply Filters</ApplyButton>
            </FilterActions>
          </FilterPanel>
        )}
      </Header>

      {bulkActionMode && selectedPieces.size > 0 && (
        <BulkActionBar>
          <BulkInfo>
            {selectedPieces.size} item{selectedPieces.size !== 1 ? 's' : ''} selected
          </BulkInfo>
          <BulkActions>
            <BulkButton onClick={() => handleBulkAction('visibility')}>
              <Eye size={16} />
              Change Visibility
            </BulkButton>
            <BulkButton onClick={() => handleBulkAction('download')}>
              <Download size={16} />
              Download
            </BulkButton>
            <BulkButton onClick={() => handleBulkAction('delete')} $danger>
              <Trash2 size={16} />
              Delete
            </BulkButton>
          </BulkActions>
        </BulkActionBar>
      )}

      <GalleryContainer>
        {!hasPortfolio && galleryMode === 'private' ? (
          <EmptyState>
            <EmptyIcon>
              <ImageIcon size={64} />
            </EmptyIcon>
            <EmptyTitle>Start Your Creative Journey</EmptyTitle>
            <EmptyDescription>
              Upload your first artwork to build your portfolio and share your talent with the world.
            </EmptyDescription>
            <EmptyActions>
              <PrimaryButton onClick={() => setShowUploadModal(true)}>
                <Upload size={18} />
                Upload Your First Artwork
              </PrimaryButton>
              <SecondaryButton>
                Create Portfolio
              </SecondaryButton>
            </EmptyActions>
          </EmptyState>
        ) : (
          <MockGallery mode={galleryMode} viewConfig={galleryConfig} />
        )}
      </GalleryContainer>

      {isAuthenticated && galleryMode === 'private' && (
        <FloatingActionButton onClick={() => setShowUploadModal(true)}>
          <Plus size={24} />
        </FloatingActionButton>
      )}
    </PageWrapper>
  );
}

// Styled Components
const PageWrapper = styled.main`
  min-height: 100vh;
  background-color: #fafafa;
  padding-bottom: 4rem;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 1rem 0.75rem;
  }
`;

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
`;

const StatLabel = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
  margin-top: 0.125rem;
`;

const HeaderBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 0 1rem 1rem;
  }
`;

const ControlsLeft = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ControlsRight = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const ModeToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? '#111827' : '#6b7280'};
  font-weight: ${({ $active }) => $active ? '500' : '400'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ $active }) => $active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#e5e7eb'};
  }
`;

const SearchForm = styled.form`
  display: flex;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-right: none;
  border-radius: 8px 0 0 8px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SearchButton = styled.button`
  padding: 0 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? '#111827' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#e5e7eb'};
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: ${({ $active }) => $active ? '#3b82f6' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  border: 1px solid ${({ $active }) => $active ? '#3b82f6' : '#e5e7eb'};
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
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 18px;
  text-align: center;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem;
    
    span {
      display: none;
    }
  }
`;

const SignInButton = styled(UploadButton)`
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  
  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

const FilterPanel = styled.div`
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    grid-template-columns: 1fr;
  }
`;

const FilterSection = styled.div``;

const FilterTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
`;

const CategoryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CategoryChip = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid ${({ $active }) => $active ? '#3b82f6' : '#e5e7eb'};
  background: ${({ $active }) => $active ? '#3b82f6' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#6b7280'};
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

const TagChip = styled(CategoryChip)`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
`;

const SortDropdown = styled.div`
  position: relative;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  min-width: 150px;
  
  &:hover {
    background: #f9fafb;
  }
`;

const PriceInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PriceInput = styled.input`
  width: 100px;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
`;

const ClearButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ApplyButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const BulkActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #fef3c7;
  border-bottom: 1px solid #fde68a;
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const BulkInfo = styled.div`
  font-weight: 500;
  color: #92400e;
`;

const BulkActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const BulkButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid ${({ $danger }) => $danger ? '#ef4444' : '#e5e7eb'};
  border-radius: 6px;
  color: ${({ $danger }) => $danger ? '#ef4444' : '#374151'};
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $danger }) => $danger ? '#fef2f2' : '#f9fafb'};
    border-color: ${({ $danger }) => $danger ? '#dc2626' : '#d1d5db'};
  }
`;

const GalleryContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// Gallery Grid Components
const GalleryGrid = styled.div<{ $layout: ViewLayout }>`
  ${({ $layout }) => {
    switch ($layout) {
      case 'grid':
        return `
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        `;
      case 'masonry':
        return `
          column-count: 4;
          column-gap: 1.5rem;
          
          @media (max-width: 1200px) {
            column-count: 3;
          }
          
          @media (max-width: 768px) {
            column-count: 2;
          }
          
          @media (max-width: 480px) {
            column-count: 1;
          }
        `;
      case 'list':
        return `
          display: flex;
          flex-direction: column;
          gap: 1rem;
        `;
    }
  }}
`;

const GalleryItem = styled.div<{ $layout: ViewLayout }>`
  ${({ $layout }) => {
    if ($layout === 'masonry') {
      return `
        break-inside: avoid;
        margin-bottom: 1.5rem;
      `;
    }
    return '';
  }}
  
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${({ $layout }) => $layout !== 'list' ? 'translateY(-4px)' : 'none'};
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  
  ${({ $layout }) => $layout === 'list' && `
    display: flex;
    height: 120px;
  `}
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    img {
      transform: scale(1.05);
    }
    
    > div:last-child {
      opacity: 1;
    }
  }
`;

const VisibilityBadge = styled.div<{ $visibility: string }>`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: ${({ $visibility }) => 
    $visibility === 'private' ? 'rgba(239, 68, 68, 0.9)' : 
    $visibility === 'unlisted' ? 'rgba(251, 146, 60, 0.9)' : 
    'rgba(34, 197, 94, 0.9)'};
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
`;

const QuickActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $active }) => $active ? '#e0f2fe' : 'rgba(255, 255, 255, 0.9)'};
  border: ${({ $active }) => $active ? '1px solid #3b82f6' : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }

  svg {
    color: #374151;
  }
`;


const ItemInfo = styled.div`
  padding: 1rem;
`;

const ItemTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const EmptyIcon = styled.div`
  margin: 0 auto 2rem;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

const EmptyTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`;

const EmptyDescription = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const EmptyActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  
  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 100;
  
  &:hover {
    background: #2563eb;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;