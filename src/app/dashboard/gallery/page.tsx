// src/app/dashboard/gallery/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { 
  Grid3x3, LayoutGrid, List, Filter, Search, Upload, 
  Eye, EyeOff, Download, Trash2, Edit, Share2, Heart,
  Calendar, Tag, DollarSign, ChevronDown, X, Check,
  Image as ImageIcon, Loader2, AlertCircle, Plus,
  BookOpen, Brain, FolderOpen, Move, Copy, Settings,
  TrendingUp, Award, Clock, Star, MessageSquare, RefreshCw
} from 'lucide-react';
import { useApiClient } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';
import type { Portfolio } from '@/types/portfolio.types';


// Gallery-focused types - only for visual artwork
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

  // ✅ Add these to fix errors
  displayOrder: number;
  alt?: string;
  year?: number; // Optional, or compute from createdAt
}


interface Collection {
  id: string;
  name: string;
  description?: string;
  type: 'artwork';
  visibility: 'public' | 'private' | 'unlisted';
  itemCount: number;
  coverImage?: string;
  createdAt: Date;
  portfolioId?: string;
}

// Type returned from gallery.getCollections()
interface GalleryCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  createdAt?: Date;
}

type ViewLayout = 'grid' | 'masonry' | 'list';
type GalleryMode = 'public' | 'portfolio';
type SortOption = 'newest' | 'oldest' | 'popular' | 'name';

// Import the actual Portfolio type from portfolio.types
interface PortfolioData {
  id: string;
  username: string;
  name?: string;
  type?: 'creative' | 'educational' | 'hybrid';
  bio?: string;
  stats?: {
    totalItems: number;
    totalViews: number;
    totalLikes: number;
  };
  visibility?: 'public' | 'private' | 'unlisted';
}

export default function EnhancedGalleryPage() {
  // Core state
  const [galleryMode, setGalleryMode] = useState<GalleryMode>('public');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('masonry');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  
  // Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  
  // Selection state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  
  // Data state
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [hasPortfolio, setHasPortfolio] = useState(true);
  
  const apiClient = useApiClient();

  // Fetch data based on mode
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (galleryMode === 'portfolio' && isAuthenticated) {
        // Fetch portfolio data
        const portfolioData = await apiClient.portfolio.getMyPortfolio();
        setPortfolio(portfolioData);
        setHasPortfolio(!!portfolioData);

        if (portfolioData) {
          // Fetch portfolio artwork
          // TODO: Implement getMyGalleryPieces in PortfolioApiClient
          // For now, use gallery API to get pieces
          const piecesResponse = await apiClient.gallery.getPieces({
            limit: 50
          });
          // Filter pieces by ownerId if the response includes all pieces
          const pieces = Array.isArray(piecesResponse) ? piecesResponse : [];
          const myPieces = pieces.filter(p => p.ownerId === portfolioData.userId);
          setGalleryPieces(myPieces);

          // Fetch collections
          // TODO: Implement getMyCollections in PortfolioApiClient
          const collectionsData = await apiClient.gallery.getCollections();
          // Transform GalleryCollection to Collection format
          const transformedCollections: Collection[] = collectionsData.map(gc => ({
            id: gc.id,
            name: gc.name,
            description: gc.description,
            type: 'artwork' as const,
            visibility: 'public' as const, // Default visibility
            itemCount: 0, // Default count
            coverImage: gc.coverImage,
            createdAt: gc.createdAt || new Date(),
            portfolioId: portfolioData.id
          }));
          setCollections(transformedCollections);
        }
      } else {
        // Fetch public gallery
        const publicPiecesResponse = await apiClient.gallery.getPieces({
          visibility: 'public',
          limit: 50
        });
        // Handle the response - it might be an array or an object with items
        const publicPieces = Array.isArray(publicPiecesResponse) ? publicPiecesResponse : [];
        setGalleryPieces(publicPieces);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load gallery content');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [galleryMode]);

  // Filter and sort artwork pieces
  const filteredItems = useMemo(() => {
    let items = galleryPieces;

    // Apply search filter
    if (searchQuery) {
      items = items.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Apply tag filter
    if (selectedTags.size > 0) {
      items = items.filter(item =>
        item.tags?.some(tag => selectedTags.has(tag))
      );
    }

    // Apply price filter
    items = items.filter(item => {
      if (item.price) {
        return item.price >= priceRange.min && item.price <= priceRange.max;
      }
      return true;
    });

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'popular':
          return b.displayOrder - a.displayOrder; // Higher display order = more popular
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return items;
  }, [galleryPieces, searchQuery, selectedCategory, selectedTags, priceRange, sortBy]);

  // Handlers
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

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

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      return newSelection;
    });
  };

  const handleBulkAction = async (action: 'delete' | 'visibility' | 'download' | 'collection') => {
    if (selectedItems.size === 0) return;

    try {
      switch (action) {
        case 'delete':
          if (confirm(`Delete ${selectedItems.size} items?`)) {
            await apiClient.portfolio.batchDeleteGalleryPieces(Array.from(selectedItems));
            await fetchData();
          }
          break;
        case 'visibility':
          // Show visibility modal
          break;
        case 'collection':
          setShowCollectionModal(true);
          break;
      }
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
    }

    setBulkActionMode(false);
    setSelectedItems(new Set());
  };

  const handleCreateCollection = async (name: string, type: 'artwork') => {
    try {
      // TODO: Implement createCollection in PortfolioApiClient
      // For now, create a collection object
      const newCollection: Collection = {
        id: Date.now().toString(), // temporary ID
        name,
        type,
        visibility: 'public',
        portfolioId: portfolio?.id,
        itemCount: 0,
        createdAt: new Date()
      };
      
      // Since createCollection doesn't exist in the API yet,
      // we'll just add it to the local state
      setCollections([...collections, newCollection]);
      setShowCollectionModal(false);
      
      // TODO: Replace with actual API call when available
      console.log('Collection creation not yet implemented in API');
    } catch (err) {
      console.error('Error creating collection:', err);
    }
  };

  const handleCreatePortfolio = async (type: 'creative' | 'educational' | 'hybrid') => {
    try {
      // Use the create method from PortfolioApiClient
      // The 'kind' field in Portfolio is used instead of 'type'
      const newPortfolio = await apiClient.portfolio.create({
        title: 'My Portfolio',
        bio: '',
        visibility: 'public',
        specializations: [],
        tags: []
      });
      
      // After creation, you might need to update the portfolio kind separately
      // or handle it through backend logic based on user role
      console.log('Created portfolio for type:', type);
      
      await fetchData();
    } catch (err) {
      console.error('Error creating portfolio:', err);
    }
  };

  // Render artwork item
  const renderItem = (item: GalleryPiece) => {
    const isSelected = selectedItems.has(item.id);

    return (
      <GalleryItemCard key={item.id} $layout={viewLayout} $selected={isSelected}>
        {bulkActionMode && (
          <SelectionCheckbox
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleItemSelection(item.id)}
          />
        )}
        <ImageContainer>
          <img src={item.imageUrl} alt={item.alt} />
          {galleryMode === 'portfolio' && (
            <VisibilityBadge $visibility={item.visibility}>
              {item.visibility === 'private' ? <EyeOff size={14} /> : <Eye size={14} />}
              {item.visibility}
            </VisibilityBadge>
          )}
          <QuickActions>
            <ActionButtonSmall><Eye size={16} /> {item.year || 'N/A'}</ActionButtonSmall>
            <ActionButtonSmall><DollarSign size={16} /> {item.price || 'N/A'}</ActionButtonSmall>
            {galleryMode === 'portfolio' && (
              <>
                <ActionButtonSmall><Edit size={16} /></ActionButtonSmall>
                <ActionButtonSmall><Share2 size={16} /></ActionButtonSmall>
              </>
            )}
          </QuickActions>
        </ImageContainer>
        <ItemInfo>
          <ItemTitle>{item.title}</ItemTitle>
          <ItemMeta>
            <span>{item.artist}</span>
            {item.price && <span>${item.price}</span>}
          </ItemMeta>
          {item.tags && item.tags.length > 0 && (
            <TagList>
              {item.tags.slice(0, 3).map(tag => (
                <TagBadge key={tag}>{tag}</TagBadge>
              ))}
            </TagList>
          )}
        </ItemInfo>
      </GalleryItemCard>
    );
  };

  return (
    <PageWrapper>
      <Header>
        <HeaderTop>
          <TitleSection>
            <PageTitle>
              {galleryMode === 'public' ? 'Creative Gallery' : 
               portfolio ? `${portfolio.title || portfolio.username}'s Portfolio` : 'My Portfolio'}
            </PageTitle>
            <PageSubtitle>
              {galleryMode === 'public' 
                ? 'Discover inspiring works from our creative community'
                : portfolio
                  ? `Managing ${portfolio.stats?.totalPieces || 0} creative pieces`
                  : 'Your creative portfolio'}
            </PageSubtitle>
          </TitleSection>

          {portfolio && portfolio.stats && (
            <HeaderStats>
              <StatItem>
                <StatValue>{portfolio.stats.totalPieces}</StatValue>
                <StatLabel>Total Items</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{(portfolio.stats.totalViews / 1000).toFixed(1)}k</StatValue>
                <StatLabel>Total Views</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{(portfolio.stats.totalPieces / 1000).toFixed(1)}k</StatValue>
                <StatLabel>Total Likes</StatLabel>
              </StatItem>
            </HeaderStats>
          )}
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
                  $active={galleryMode === 'portfolio'}
                  onClick={() => setGalleryMode('portfolio')}
                >
                  <FolderOpen size={16} />
                  My Portfolio
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

            <SortDropdown>
              <SortButton onClick={() => {}}>
                {sortBy === 'newest' ? 'Newest First' :
                 sortBy === 'oldest' ? 'Oldest First' :
                 sortBy === 'popular' ? 'Most Popular' : 'Name A-Z'}
                <ChevronDown size={16} />
              </SortButton>
            </SortDropdown>

            <FilterButton 
              onClick={() => setShowFilters(!showFilters)}
              $active={showFilters}
            >
              <Filter size={18} />
              <span>Filters</span>
              {(selectedCategory || selectedTags.size > 0) && (
                <FilterBadge>
                  {selectedTags.size + (selectedCategory ? 1 : 0)}
                </FilterBadge>
              )}
            </FilterButton>

            {galleryMode === 'portfolio' && (
              <>
                <ActionButton
                  onClick={() => setBulkActionMode(!bulkActionMode)}
                  $active={bulkActionMode}
                >
                  <Check size={18} />
                  <span>Select</span>
                </ActionButton>

                {collections.length > 0 && (
                  <CollectionsButton onClick={() => setShowCollectionModal(true)}>
                    <FolderOpen size={18} />
                    <span>Collections ({collections.length})</span>
                  </CollectionsButton>
                )}
                
                <UploadButton onClick={() => setShowUploadModal(true)}>
                  <Upload size={18} />
                  <span>Upload</span>
                </UploadButton>

                <SettingsButton>
                  <Settings size={18} />
                </SettingsButton>
              </>
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
                {Array.from(new Set(galleryPieces.flatMap(item => item.tags || []))).slice(0, 12).map(tag => (
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

      {bulkActionMode && selectedItems.size > 0 && (
        <BulkActionBar>
          <BulkInfo>
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
          </BulkInfo>
          <BulkActions>
            <BulkButton onClick={() => handleBulkAction('collection')}>
              <FolderOpen size={16} />
              Add to Collection
            </BulkButton>
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
        {loading ? (
          <LoadingContainer>
            <Loader2 className="animate-spin" size={48} />
            <LoadingText>Loading portfolio content...</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <AlertCircle size={48} />
            <ErrorText>{error}</ErrorText>
            <RetryButton onClick={fetchData}>
              <RefreshCw size={16} />
              Try Again
            </RetryButton>
          </ErrorContainer>
        ) : !hasPortfolio && galleryMode === 'portfolio' ? (
          <EmptyState>
            <EmptyIcon>
              <ImageIcon size={64} />
            </EmptyIcon>
            <EmptyTitle>Create Your Portfolio</EmptyTitle>
            <EmptyDescription>
              Choose the type of portfolio that best represents your journey
            </EmptyDescription>
            <PortfolioTypeGrid>
              <PortfolioTypeCard>
                <PortfolioTypeIcon>
                  <ImageIcon size={48} />
                </PortfolioTypeIcon>
                <PortfolioTypeTitle>Creative Portfolio</PortfolioTypeTitle>
                <PortfolioTypeDesc>
                  Showcase your artwork, designs, and creative projects
                </PortfolioTypeDesc>
                <CreateButton onClick={() => handleCreatePortfolio('creative')}>
                  Create Creative Portfolio
                </CreateButton>
              </PortfolioTypeCard>
              
              <PortfolioTypeCard>
                <PortfolioTypeIcon>
                  <Brain size={48} />
                </PortfolioTypeIcon>
                <PortfolioTypeTitle>Educational Portfolio</PortfolioTypeTitle>
                <PortfolioTypeDesc>
                  Track your learning progress and academic achievements
                </PortfolioTypeDesc>
                <CreateButton onClick={() => handleCreatePortfolio('educational')}>
                  Create Educational Portfolio
                </CreateButton>
              </PortfolioTypeCard>
              
              <PortfolioTypeCard>
                <PortfolioTypeIcon>
                  <Grid3x3 size={48} />
                </PortfolioTypeIcon>
                <PortfolioTypeTitle>Hybrid Portfolio</PortfolioTypeTitle>
                <PortfolioTypeDesc>
                  Combine creative works with educational progress
                </PortfolioTypeDesc>
                <CreateButton onClick={() => handleCreatePortfolio('hybrid')}>
                  Create Hybrid Portfolio
                </CreateButton>
              </PortfolioTypeCard>
            </PortfolioTypeGrid>
          </EmptyState>
        ) : filteredItems.length === 0 ? (
          <EmptyState>
            <EmptyMessage>
              {searchQuery || selectedTags.size > 0 || selectedCategory
                ? 'No items match your filters. Try adjusting your search criteria.'
                : galleryMode === 'portfolio'
                  ? 'Upload your first artwork to get started!'
                  : 'No public gallery items available.'}
            </EmptyMessage>
          </EmptyState>
        ) : (
          <ItemsGrid $layout={viewLayout}>
            {filteredItems.map(renderItem)}
          </ItemsGrid>
        )}
      </GalleryContainer>

      {isAuthenticated && galleryMode === 'portfolio' && hasPortfolio && (
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
    gap: 1rem;
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
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const HeaderBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

const ControlsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const ControlsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModeToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#111827' : '#6b7280'};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    color: #111827;
  }
`;

const SearchForm = styled.form`
  display: flex;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-right: none;
  border-radius: 0.375rem 0 0 0.375rem;
  font-size: 0.875rem;
  outline: none;

  &:focus {
    border-color: #3b82f6;
  }
`;

const SearchButton = styled.button`
  padding: 0.5rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0 0.375rem 0.375rem 0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 0.375rem;
  padding: 0.25rem;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 0.375rem 0.5rem;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#111827' : '#6b7280'};
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'};

  &:hover {
    color: #111827;
  }
`;

const SortDropdown = styled.div`
  position: relative;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  color: ${props => props.$active ? '#3b82f6' : '#374151'};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    border-color: ${props => props.$active ? '#3b82f6' : '#d1d5db'};
  }
`;

const FilterBadge = styled.span`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  text-align: center;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  color: ${props => props.$active ? '#3b82f6' : '#374151'};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$active ? '#3b82f6' : '#d1d5db'};
  }
`;

const CollectionsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const SettingsButton = styled.button`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    color: #374151;
  }
`;

const FilterPanel = styled.div`
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
`;

const CategoryGrid = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const CategoryChip = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  color: ${props => props.$active ? '#3b82f6' : '#374151'};
  border-radius: 9999px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: capitalize;

  &:hover {
    border-color: ${props => props.$active ? '#3b82f6' : '#d1d5db'};
  }
`;

const TagCloud = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const TagChip = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  color: ${props => props.$active ? '#3b82f6' : '#374151'};
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$active ? '#3b82f6' : '#d1d5db'};
  }
`;

const PriceInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PriceInput = styled.input`
  width: 120px;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;

  &:focus {
    border-color: #3b82f6;
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const ClearButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }
`;

const ApplyButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
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
  border-bottom: 1px solid #fcd34d;
`;

const BulkInfo = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #92400e;
`;

const BulkActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const BulkButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.$danger ? '#ef4444' : '#e5e7eb'};
  background: ${props => props.$danger ? '#fef2f2' : 'white'};
  color: ${props => props.$danger ? '#dc2626' : '#374151'};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$danger ? '#dc2626' : '#d1d5db'};
    background: ${props => props.$danger ? '#fee2e2' : '#f9fafb'};
  }
`;

const GalleryContainer = styled.div`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  font-size: 0.875rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #dc2626;
`;

const ErrorText = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 500;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  color: #d1d5db;
  margin-bottom: 1.5rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 500px;
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  color: #6b7280;
`;

const PortfolioTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1000px;
  margin-top: 2rem;
`;

const PortfolioTypeCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const PortfolioTypeIcon = styled.div`
  color: #3b82f6;
  margin-bottom: 1rem;
`;

const PortfolioTypeTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const PortfolioTypeDesc = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const ItemsGrid = styled.div<{ $layout: ViewLayout }>`
  display: grid;
  gap: 1.5rem;
  
  ${props => {
    switch (props.$layout) {
      case 'grid':
        return `
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        `;
      case 'masonry':
        return `
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          grid-auto-rows: 10px;
        `;
      case 'list':
        return `
          grid-template-columns: 1fr;
          gap: 1rem;
        `;
      default:
        return '';
    }
  }}
`;

const GalleryItemCard = styled.div<{ $layout: ViewLayout; $selected: boolean }>`
  background: white;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
  
  ${props => props.$layout === 'masonry' && `
    grid-row-end: span auto;
  `}
  
  ${props => props.$layout === 'list' && `
    display: flex;
    gap: 1rem;
  `}

  &:hover {
    border-color: ${props => props.$selected ? '#3b82f6' : '#d1d5db'};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const SelectionCheckbox = styled.input`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  z-index: 10;
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  background: #f3f4f6;

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

const VisibilityBadge = styled.div<{ $visibility: string }>`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${props => 
    props.$visibility === 'private' ? 'rgba(239, 68, 68, 0.9)' : 
    props.$visibility === 'unlisted' ? 'rgba(251, 146, 60, 0.9)' : 
    'rgba(34, 197, 94, 0.9)'
  };
  color: white;
  border-radius: 0.375rem;
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
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  opacity: 0;
  transition: opacity 0.2s;

  ${GalleryItemCard}:hover & {
    opacity: 1;
  }
`;

const ActionButtonSmall = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #111827;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: white;
  }
`;

const ItemInfo = styled.div`
  padding: 1rem;
`;

const ItemTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
`;

const TagList = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
`;

const TagBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.75rem;
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
    transform: scale(1.05);
  }
`;