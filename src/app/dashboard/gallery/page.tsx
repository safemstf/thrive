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
  TrendingUp, Award, Clock, Star, MessageSquare, RefreshCw,
  ArrowLeft, ExternalLink, User
} from 'lucide-react';
import { useApiClient } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import type { Portfolio } from '@/types/portfolio.types';
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';

// Enhanced Gallery-focused types
interface GalleryPiece {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  artist: string;
  portfolioId: string;
  ownerId?: string;
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
  displayOrder: number;
  alt?: string;
  year?: number;
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

interface PortfolioData {
  id: string;
  username: string;
  name?: string;
  kind?: 'creative' | 'educational' | 'hybrid';
  bio?: string;
  stats?: {
    totalPieces: number;
    totalViews: number;
    totalLikes: number;
  };
  visibility?: 'public' | 'private' | 'unlisted';
}

export default function EnhancedGalleryPage() {
  // Core state
  const [galleryMode, setGalleryMode] = useState<GalleryMode>('portfolio');
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
  
  const { user, isAuthenticated } = useAuth();
  const apiClient = useApiClient();
  const router = useRouter();

  // Auto-detect portfolio mode if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setGalleryMode('portfolio');
    } else {
      setGalleryMode('public');
    }
  }, [isAuthenticated]);

  // Fetch data based on mode
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (galleryMode === 'portfolio' && isAuthenticated) {
        // Fetch portfolio data
        try {
          const portfolioData = await apiClient.portfolio.getMyPortfolio();
          setPortfolio(portfolioData);

          if (portfolioData && (portfolioData.kind === 'creative' || portfolioData.kind === 'hybrid')) {
            // Fetch portfolio artwork
            const piecesResponse = await apiClient.gallery.getPieces({ limit: 50 });
            const pieces = Array.isArray(piecesResponse) ? piecesResponse : [];
            const myPieces = pieces.filter(p => p.ownerId === user?.id || p.portfolioId === portfolioData.id);
            setGalleryPieces(myPieces);

            // Fetch collections
            const collectionsData = await apiClient.gallery.getCollections();
            const transformedCollections: Collection[] = collectionsData.map(gc => ({
              id: gc.id,
              name: gc.name,
              description: gc.description,
              type: 'artwork' as const,
              visibility: 'public' as const,
              itemCount: 0,
              coverImage: gc.coverImage,
              createdAt: gc.createdAt || new Date(),
              portfolioId: portfolioData.id
            }));
            setCollections(transformedCollections);
          } else if (portfolioData && portfolioData.kind === 'educational') {
            // Educational portfolios don't have galleries
            setGalleryPieces([]);
            setError('Educational portfolios focus on learning progress. Switch to Creative or Hybrid to manage artwork.');
          } else {
            setGalleryPieces([]);
          }
        } catch (portfolioError: any) {
          if (portfolioError?.status === 404) {
            // No portfolio exists
            setPortfolio(null);
            setGalleryPieces([]);
          } else {
            throw portfolioError;
          }
        }
      } else {
        // Fetch public gallery
        const publicPiecesResponse = await apiClient.gallery.getPieces({
          visibility: 'public',
          limit: 50
        });
        const publicPieces = Array.isArray(publicPiecesResponse) ? publicPiecesResponse : [];
        setGalleryPieces(publicPieces);
        setPortfolio(null);
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
  }, [galleryMode, isAuthenticated, user?.id]);

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
          return (b.views + b.likes) - (a.views + a.likes);
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
            // Implement bulk delete when API supports it
            console.log('Bulk delete not yet implemented');
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

  const handleCreatePortfolio = async (type: 'creative' | 'hybrid') => {
    try {
      const newPortfolio = await apiClient.portfolio.create({
        title: `${user?.name || 'My'} Portfolio`,
        bio: '',
        visibility: 'public',
        specializations: [],
        tags: []
      });
      
      setPortfolio(newPortfolio);
      await fetchData();
    } catch (err) {
      console.error('Error creating portfolio:', err);
    }
  };

  const hasCreativeCapability = portfolio && (portfolio.kind === 'creative' || portfolio.kind === 'hybrid');

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
          <img src={item.thumbnailUrl || item.imageUrl} alt={item.alt || item.title} />
          {galleryMode === 'portfolio' && (
            <VisibilityBadge $visibility={item.visibility}>
              {item.visibility === 'private' ? <EyeOff size={14} /> : <Eye size={14} />}
              {item.visibility}
            </VisibilityBadge>
          )}
          <QuickActions>
            <ActionButtonSmall>
              <Eye size={16} /> {item.views || 0}
            </ActionButtonSmall>
            <ActionButtonSmall>
              <Heart size={16} /> {item.likes || 0}
            </ActionButtonSmall>
            {item.price && (
              <ActionButtonSmall>
                <DollarSign size={16} /> {item.price}
              </ActionButtonSmall>
            )}
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
            {item.year && <span>{item.year}</span>}
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

  const renderNoPortfolioState = () => (
    <EmptyState>
      <EmptyIcon>
        <User size={64} />
      </EmptyIcon>
      <EmptyTitle>Create Your Creative Portfolio</EmptyTitle>
      <EmptyDescription>
        Get started by creating a portfolio to showcase your artwork and creative projects
      </EmptyDescription>
      <PortfolioTypeGrid>
        <PortfolioTypeCard>
          <PortfolioTypeIcon>
            <ImageIcon size={48} />
          </PortfolioTypeIcon>
          <PortfolioTypeTitle>Creative Portfolio</PortfolioTypeTitle>
          <PortfolioTypeDesc>
            Perfect for artists, designers, and creators who want to showcase visual work
          </PortfolioTypeDesc>
          <PortfolioTypeFeatures>
            <FeatureItem>• Upload and organize artwork</FeatureItem>
            <FeatureItem>• Create collections</FeatureItem>
            <FeatureItem>• Share with the community</FeatureItem>
          </PortfolioTypeFeatures>
          <CreateButton onClick={() => handleCreatePortfolio('creative')}>
            Create Creative Portfolio
          </CreateButton>
        </PortfolioTypeCard>
        
        <PortfolioTypeCard>
          <PortfolioTypeIcon>
            <Brain size={48} />
          </PortfolioTypeIcon>
          <PortfolioTypeTitle>Hybrid Portfolio</PortfolioTypeTitle>
          <PortfolioTypeDesc>
            Combine creative work with educational progress for a complete profile
          </PortfolioTypeDesc>
          <PortfolioTypeFeatures>
            <FeatureItem>• Showcase artwork</FeatureItem>
            <FeatureItem>• Track learning progress</FeatureItem>
            <FeatureItem>• Unified dashboard</FeatureItem>
          </PortfolioTypeFeatures>
          <CreateButton onClick={() => handleCreatePortfolio('hybrid')}>
            Create Hybrid Portfolio
          </CreateButton>
        </PortfolioTypeCard>
      </PortfolioTypeGrid>
      <BackToProfile>
        <BackButton onClick={() => router.push('/dashboard/profile')}>
          <ArrowLeft size={16} />
          Back to Profile
        </BackButton>
      </BackToProfile>
    </EmptyState>
  );

  const renderEducationalPortfolioState = () => (
    <EmptyState>
      <EmptyIcon>
        <BookOpen size={64} />
      </EmptyIcon>
      <EmptyTitle>Educational Portfolio</EmptyTitle>
      <EmptyDescription>
        Your portfolio is focused on learning and educational progress. To manage artwork, 
        consider upgrading to a Hybrid portfolio or visit the Learning Center.
      </EmptyDescription>
      <ActionGrid>
        <ActionCard onClick={() => router.push('/writing')}>
          <BookOpen size={32} />
          <ActionTitle>Learning Center</ActionTitle>
          <ActionDesc>Continue your educational journey</ActionDesc>
        </ActionCard>
        <ActionCard onClick={() => router.push('/dashboard/profile')}>
          <Settings size={32} />
          <ActionTitle>Portfolio Settings</ActionTitle>
          <ActionDesc>Upgrade to Hybrid portfolio</ActionDesc>
        </ActionCard>
      </ActionGrid>
    </EmptyState>
  );

  return (
    <PageWrapper>
      <Header>
        <HeaderTop>
          <TitleSection>
            <BackButton onClick={() => router.push('/dashboard/profile')}>
              <ArrowLeft size={20} />
            </BackButton>
            <div>
              <PageTitle>
                {galleryMode === 'public' ? 'Creative Gallery' : 
                 portfolio ? `${portfolio.title || 'My Gallery'}` : 'Gallery'}
              </PageTitle>
              <PageSubtitle>
                {galleryMode === 'public' 
                  ? 'Discover inspiring works from our creative community'
                  : portfolio && hasCreativeCapability
                    ? `Managing ${filteredItems.length} creative pieces`
                    : 'Creative portfolio management'}
              </PageSubtitle>
            </div>
          </TitleSection>

          {portfolio && portfolio.stats && (
            <HeaderStats>
              <StatItem>
                <StatValue>{portfolio.stats.totalPieces || filteredItems.length}</StatValue>
                <StatLabel>Total Items</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{Math.floor((portfolio.stats.totalViews || 0) / 1000)}k</StatValue>
                <StatLabel>Total Views</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{Math.floor((portfolio.stats.totalReviews || 0) / 1000)}k</StatValue>
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
                <FilterBadge>
                  {selectedTags.size + (selectedCategory ? 1 : 0)}
                </FilterBadge>
              )}
            </FilterButton>

            {galleryMode === 'portfolio' && hasCreativeCapability && (
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

            <FilterActions>
              <ClearButton onClick={() => {
                setSelectedCategory(null);
                setSelectedTags(new Set());
                setPriceRange({ min: 0, max: 10000 });
                setSortBy('newest');
              }}>
                Clear All
              </ClearButton>
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
            <LoadingText>Loading gallery content...</LoadingText>
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
        ) : galleryMode === 'portfolio' && !portfolio ? (
          renderNoPortfolioState()
        ) : galleryMode === 'portfolio' && portfolio?.kind === 'educational' ? (
          renderEducationalPortfolioState()
        ) : filteredItems.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <ImageIcon size={64} />
            </EmptyIcon>
            <EmptyTitle>
              {galleryMode === 'portfolio' ? 'No Artwork Yet' : 'No Results Found'}
            </EmptyTitle>
            <EmptyMessage>
              {searchQuery || selectedTags.size > 0 || selectedCategory
                ? 'No items match your filters. Try adjusting your search criteria.'
                : galleryMode === 'portfolio'
                  ? 'Upload your first artwork to get started!'
                  : 'No public gallery items available.'}
            </EmptyMessage>
            {galleryMode === 'portfolio' && hasCreativeCapability && !searchQuery && (
              <EmptyActions>
                <UploadButton onClick={() => setShowUploadModal(true)}>
                  <Upload size={18} />
                  Upload First Artwork
                </UploadButton>
              </EmptyActions>
            )}
          </EmptyState>
        ) : (
          <ItemsGrid $layout={viewLayout}>
            {filteredItems.map(renderItem)}
          </ItemsGrid>
        )}
      </GalleryContainer>

      {galleryMode === 'portfolio' && hasCreativeCapability && (
        <FloatingActionButton onClick={() => setShowUploadModal(true)}>
          <Plus size={24} />
        </FloatingActionButton>
      )}

      {/* Upload Modal */}
      {showUploadModal && portfolio && (
        <ArtworkUploadModal
          portfolioId={portfolio.id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchData(); // Refresh the gallery
          }}
        />
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

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    color: #374151;
    background: #f9fafb;
  }
`;

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
  max-width: 500px;
  line-height: 1.6;
`;

const EmptyActions = styled.div`
  margin-top: 1.5rem;
`;

const PortfolioTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  margin: 2rem 0;
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
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const PortfolioTypeFeatures = styled.div`
  text-align: left;
  margin-bottom: 1.5rem;
`;

const FeatureItem = styled.div`
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.25rem;
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
  width: 100%;

  &:hover {
    background: #2563eb;
  }
`;

const BackToProfile = styled.div`
  margin-top: 2rem;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const ActionCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
  }
`;

const ActionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ActionDesc = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
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
  aspect-ratio: 4/3;

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