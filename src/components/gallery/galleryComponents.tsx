// src/components/gallery/galleryComponents.tsx
'use client';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  Grid3x3, LayoutGrid, List, Filter, Search, Upload, 
  Eye, EyeOff, Edit, Share2, Heart, Tag, DollarSign, 
  X, Check, Image as ImageIcon, Loader2, AlertCircle, 
  Plus, BookOpen, Brain, FolderOpen, Settings,
  ArrowLeft, User, RefreshCw, Trash2
} from 'lucide-react';

// Use existing types
import type { 
  GalleryPiece, 
  GalleryLayout, 
  GalleryVisibility,
  ArtworkCategory 
} from '@/types/gallery.types';
import type { Portfolio } from '@/types/portfolio.types';

// Local component types
export type ViewLayout = GalleryLayout;
export type GalleryMode = 'public' | 'portfolio';
export type BulkAction = 'delete' | 'visibility' | 'download' | 'collection';

export interface GalleryHeaderProps {
  galleryMode: GalleryMode;
  setGalleryMode: (mode: GalleryMode) => void;
  viewLayout: ViewLayout;
  setViewLayout: (layout: ViewLayout) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedTags: Set<string>;
  toggleTag: (tag: string) => void;
  bulkActionMode: boolean;
  setBulkActionMode: (mode: boolean) => void;
  hasCreativeCapability: boolean;
  onUpload: () => void;
  isAuthenticated: boolean;
  portfolio?: Portfolio | null;
  galleryPieces: GalleryPiece[];
  filteredItemsCount: number;
}

export interface GalleryGridProps {
  items: GalleryPiece[];
  viewLayout: ViewLayout;
  loading: boolean;
  error: string | null;
  galleryMode: GalleryMode;
  bulkActionMode: boolean;
  selectedItems: Set<string>;
  onItemSelect: (itemId: string) => void;
  onRetry: () => void;
  hasCreativeCapability: boolean;
  onUpload: () => void;
  searchQuery: string;
  selectedTags: Set<string>;
  selectedCategory: string | null;
  portfolio?: Portfolio | null;
}

export interface BulkActionBarProps {
  selectedItems: Set<string>;
  onBulkAction: (action: BulkAction) => void;
  onCancel: () => void;
}

// ============= HEADER COMPONENTS =============

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  galleryMode,
  setGalleryMode,
  viewLayout,
  setViewLayout,
  showFilters,
  setShowFilters,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedTags,
  toggleTag,
  bulkActionMode,
  setBulkActionMode,
  hasCreativeCapability,
  onUpload,
  isAuthenticated,
  portfolio,
  galleryPieces,
  filteredItemsCount
}) => {
  const router = useRouter();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  // Show upload button if authenticated and in portfolio mode (regardless of portfolio type)
  const showUploadButton = isAuthenticated && galleryMode === 'portfolio';

  return (
    <Header>
      <HeaderTop>
        <TitleSection>
          <BackButton onClick={() => router.push('/dashboard/profile')}>
            <ArrowLeft size={20} />
          </BackButton>
          <div>
            <PageTitle>
              {galleryMode === 'public' ? 'Creative Gallery' : 
               portfolio ? `${portfolio.title || 'My Gallery'}` : 'My Gallery'}
            </PageTitle>
            <PageSubtitle>
              {galleryMode === 'public' 
                ? 'Discover inspiring works from our creative community'
                : portfolio && hasCreativeCapability
                  ? `Managing ${filteredItemsCount} creative pieces`
                  : 'Build and showcase your creative portfolio'}
            </PageSubtitle>
          </div>
        </TitleSection>

        {/* Always show upload button prominently in portfolio mode */}
        {showUploadButton && (
          <HeaderUploadSection>
            <PrimaryUploadButton onClick={onUpload}>
              <Upload size={20} />
              <span>Add Artwork</span>
            </PrimaryUploadButton>
            {!hasCreativeCapability && (
              <UploadHint>Create or upgrade your portfolio to showcase artwork</UploadHint>
            )}
          </HeaderUploadSection>
        )}

        {portfolio && (portfolio as any).stats && (
          <HeaderStats>
            <StatItem>
              <StatValue>{(portfolio as any).stats.totalPieces || filteredItemsCount}</StatValue>
              <StatLabel>Total Items</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{Math.floor(((portfolio as any).stats.totalViews || 0) / 1000)}k</StatValue>
              <StatLabel>Total Views</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{Math.floor(((portfolio as any).stats.totalReviews || 0) / 1000)}k</StatValue>
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

          {/* Show bulk select only if user has creative capability */}
          {galleryMode === 'portfolio' && hasCreativeCapability && (
            <ActionButton
              onClick={() => setBulkActionMode(!bulkActionMode)}
              $active={bulkActionMode}
            >
              <Check size={18} />
              <span>Select</span>
            </ActionButton>
          )}

          {/* Secondary upload button - always show in portfolio mode */}
          {showUploadButton && (
            <SecondaryUploadButton onClick={onUpload}>
              <Upload size={18} />
              <span className="hidden sm:inline">Upload</span>
            </SecondaryUploadButton>
          )}
        </ControlsRight>
      </HeaderBottom>

      {showFilters && (
        <FilterPanel>
          <FilterSection>
            <FilterTitle>Categories</FilterTitle>
            <CategoryGrid>
              {['portrait', 'landscape', 'abstract', 'series', 'mixed-media'].map(category => (
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
        </FilterPanel>
      )}
    </Header>
  );
};

// Additional styled components for the enhanced upload buttons
const HeaderUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    align-items: stretch;
    width: 100%;
    margin-top: 1rem;
  }
`;

const PrimaryUploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

const SecondaryUploadButton = styled.button`
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
  
  .hidden {
    @media (max-width: 640px) {
      display: none;
    }
  }
  
  .sm\\:inline {
    @media (min-width: 640px) {
      display: inline;
    }
  }
`;

const UploadHint = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  text-align: right;
  max-width: 200px;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;
// ============= GRID COMPONENTS =============

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  items,
  viewLayout,
  loading,
  error,
  galleryMode,
  bulkActionMode,
  selectedItems,
  onItemSelect,
  onRetry,
  hasCreativeCapability,
  onUpload,
  searchQuery,
  selectedTags,
  selectedCategory,
  portfolio
}) => {
  const router = useRouter();

  if (loading) {
    return (
      <LoadingContainer>
        <Loader2 className="animate-spin" size={48} />
        <LoadingText>Loading gallery content...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <AlertCircle size={48} />
        <ErrorText>{error}</ErrorText>
        <RetryButton onClick={onRetry}>
          <RefreshCw size={16} />
          Try Again
        </RetryButton>
      </ErrorContainer>
    );
  }

  if (galleryMode === 'portfolio' && !portfolio) {
    return <NoPortfolioState onCreatePortfolio={(type) => console.log('Create portfolio:', type)} />;
  }

  if (galleryMode === 'portfolio' && portfolio?.kind === 'educational') {
    return <EducationalPortfolioState />;
  }

  if (items.length === 0) {
    return (
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
            <UploadButton onClick={onUpload}>
              <Upload size={18} />
              Upload First Artwork
            </UploadButton>
          </EmptyActions>
        )}
      </EmptyState>
    );
  }

  return (
    <ItemsGrid $layout={viewLayout}>
      {items.map(item => (
        <GalleryItem
          key={item.id}
          item={item}
          layout={viewLayout}
          galleryMode={galleryMode}
          bulkActionMode={bulkActionMode}
          selected={selectedItems.has(item.id)}
          onSelect={() => onItemSelect(item.id)}
        />
      ))}
    </ItemsGrid>
  );
};

// ============= INDIVIDUAL ITEM COMPONENT =============

interface GalleryItemProps {
  item: GalleryPiece;
  layout: ViewLayout;
  galleryMode: 'public' | 'portfolio';
  bulkActionMode: boolean;
  selected: boolean;
  onSelect: () => void;
}

export const GalleryItem: React.FC<GalleryItemProps> = ({
  item,
  layout,
  galleryMode,
  bulkActionMode,
  selected,
  onSelect
}) => {
  return (
    <GalleryItemCard $layout={layout} $selected={selected}>
      {bulkActionMode && (
        <SelectionCheckbox
          type="checkbox"
          checked={selected}
          onChange={onSelect}
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

// ============= BULK ACTION BAR =============

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedItems,
  onBulkAction,
  onCancel
}) => {
  if (selectedItems.size === 0) return null;

  return (
    <BulkActionBarContainer>
      <BulkInfo>
        {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
      </BulkInfo>
      <BulkActions>
        <BulkButton onClick={() => onBulkAction('collection')}>
          <FolderOpen size={16} />
          Add to Collection
        </BulkButton>
        <BulkButton onClick={() => onBulkAction('visibility')}>
          <Eye size={16} />
          Change Visibility
        </BulkButton>
        <BulkButton onClick={() => onBulkAction('delete')} $danger>
          <Trash2 size={16} />
          Delete
        </BulkButton>
        <BulkButton onClick={onCancel}>
          <X size={16} />
          Cancel
        </BulkButton>
      </BulkActions>
    </BulkActionBarContainer>
  );
};

// ============= EMPTY STATES =============

interface NoPortfolioStateProps {
  onCreatePortfolio: (type: 'creative' | 'hybrid') => void;
}

export const NoPortfolioState: React.FC<NoPortfolioStateProps> = ({ onCreatePortfolio }) => {
  const router = useRouter();

  return (
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
          <CreateButton onClick={() => onCreatePortfolio('creative')}>
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
          <CreateButton onClick={() => onCreatePortfolio('hybrid')}>
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
};

export const EducationalPortfolioState: React.FC = () => {
  const router = useRouter();

  return (
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
};

// ============= UPLOAD BUTTON WITH DRAG & DROP =============

interface UploadZoneProps {
  onUpload: () => void;
  onFilesDropped?: (files: File[]) => void;
  className?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onUpload, 
  onFilesDropped,
  className 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0 && onFilesDropped) {
      onFilesDropped(files);
    }
  }, [onFilesDropped]);

  return (
    <DropZone
      className={className}
      $isDragging={isDragging}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={onUpload}
    >
      <Upload size={24} />
      <span>
        {isDragging 
          ? 'Drop your images here' 
          : 'Click to upload or drag & drop images'
        }
      </span>
    </DropZone>
  );
};

// ============= FLOATING ACTION BUTTON =============

export const FloatingActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <FAB onClick={onClick}>
    <Plus size={24} />
  </FAB>
);

// ============= STYLED COMPONENTS =============

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

const BulkActionBarContainer = styled.div`
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

// Grid and Item Styles
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

// Loading and Error States
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

// Empty States
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

// Upload Zone
const DropZone = styled.div<{ $isDragging: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 2px dashed ${props => props.$isDragging ? '#3b82f6' : '#d1d5db'};
  border-radius: 0.75rem;
  background: ${props => props.$isDragging ? '#eff6ff' : '#f9fafb'};
  color: ${props => props.$isDragging ? '#3b82f6' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #3b82f6;
  }
`;

// Floating Action Button
const FAB = styled.button`
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