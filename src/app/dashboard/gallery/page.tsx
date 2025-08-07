// src/app/dashboard/gallery/page.tsx - Clean Main Gallery
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  Plus, Grid3X3, List, Search, Edit3, 
  Eye, EyeOff, Trash2, Upload,
  Image as ImageIcon
} from 'lucide-react';

import { useAuth } from '@/providers/authProvider';
import { usePortfolioManager } from '@/services/portfolioService';
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';
import { QuickCreateButton } from '@/components/portfolio/portfolioCreation';
import type { GalleryPiece, GalleryLayout, GalleryVisibility } from '@/types/gallery.types';

export default function GalleryPage() {
  // ============= STATE MANAGEMENT =============
  const [viewLayout, setViewLayout] = useState<GalleryLayout>('masonry');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // ============= USE PORTFOLIO MANAGER =============
  const {
    portfolio,
    galleryPieces,
    loading,
    error,
    refresh: refreshPortfolio,
    hasCreativeCapability
  } = usePortfolioManager();

  // ============= DERIVED STATE =============
  const filteredPieces = galleryPieces?.filter(piece => 
    piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    piece.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    piece.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // ============= ACCESS CONTROL =============
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // ============= HANDLERS =============
  const handleEditPiece = (piece: GalleryPiece) => {
    router.push(`/dashboard/gallery/edit/${piece.id}`);
  };

  const handleUploadSuccess = useCallback(async () => {
    setShowUploadModal(false);
    await refreshPortfolio();
  }, [refreshPortfolio]);

  const handlePortfolioCreated = useCallback((portfolioId: string) => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  // ============= EARLY RETURNS =============
  if (!isAuthenticated) {
    return (
      <LoadingContainer>
        <p>Checking authentication...</p>
      </LoadingContainer>
    );
  }

  if (loading) {
    return (
      <LoadingContainer>
        <p>Loading portfolio...</p>
      </LoadingContainer>
    );
  }

  if (!portfolio) {
    return (
      <PageWrapper>
        <Container>
          <EmptyStateContainer>
            <EmptyStateIcon>🎨</EmptyStateIcon>
            <EmptyStateTitle>Welcome to Your Gallery</EmptyStateTitle>
            <EmptyStateDescription>
              Create a creative portfolio to start showcasing your artwork, photography, and design projects.
            </EmptyStateDescription>
            <QuickCreateButton 
              type="creative"
              size="large"
              onSuccess={handlePortfolioCreated}
            />
          </EmptyStateContainer>
        </Container>
      </PageWrapper>
    );
  }

  if (!hasCreativeCapability) {
    return (
      <PageWrapper>
        <Container>
          <EmptyStateContainer>
            <EmptyStateIcon>📸</EmptyStateIcon>
            <EmptyStateTitle>Upgrade to Creative Portfolio</EmptyStateTitle>
            <EmptyStateDescription>
              Your current portfolio doesn't support gallery features. Upgrade to a creative or hybrid portfolio to access the gallery.
            </EmptyStateDescription>
            <UpgradeButton onClick={() => router.push('/dashboard/profile?upgrade=creative')}>
              Upgrade Portfolio
            </UpgradeButton>
          </EmptyStateContainer>
        </Container>
      </PageWrapper>
    );
  }

  // ============= RENDER MAIN GALLERY =============
  return (
    <PageWrapper>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <Title>My Gallery</Title>
          <Subtitle>{filteredPieces.length} artworks</Subtitle>
        </HeaderLeft>
        
        <HeaderRight>
          <SearchContainer>
            <SearchIcon>
              <Search size={18} />
            </SearchIcon>
            <SearchInput
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          
          <ViewControls>
            <ViewButton 
              active={viewLayout === 'masonry'} 
              onClick={() => setViewLayout('masonry')}
            >
              <Grid3X3 size={18} />
            </ViewButton>
            <ViewButton 
              active={viewLayout === 'list'} 
              onClick={() => setViewLayout('list')}
            >
              <List size={18} />
            </ViewButton>
          </ViewControls>
          
          <UploadButton onClick={() => setShowUploadModal(true)}>
            <Plus size={18} />
            Upload Artwork
          </UploadButton>
        </HeaderRight>
      </Header>

      {/* Gallery Grid */}
      <GalleryContainer>
        {filteredPieces.length === 0 ? (
          <EmptyGallery>
            <EmptyGalleryIcon>
              <ImageIcon size={64} />
            </EmptyGalleryIcon>
            <EmptyGalleryTitle>No artworks yet</EmptyGalleryTitle>
            <EmptyGalleryDescription>
              {searchQuery ? 'No artworks match your search.' : 'Start building your gallery by uploading your first artwork.'}
            </EmptyGalleryDescription>
            {!searchQuery && (
              <UploadButton onClick={() => setShowUploadModal(true)}>
                <Upload size={18} />
                Upload Your First Artwork
              </UploadButton>
            )}
          </EmptyGallery>
        ) : (
          <GalleryGrid layout={viewLayout}>
            {filteredPieces.map((piece) => (
              <GalleryItem 
                key={piece.id} 
                layout={viewLayout}
                onClick={() => handleEditPiece(piece)}
              >
                <ItemImage>
                  <img src={piece.thumbnailUrl || piece.imageUrl} alt={piece.title} />
                  <ItemOverlay>
                    <OverlayButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPiece(piece);
                      }}
                      title="Edit artwork"
                    >
                      <Edit3 size={16} />
                    </OverlayButton>
                    <VisibilityIndicator visibility={piece.visibility}>
                      {piece.visibility === 'public' ? <Eye size={16} /> : <EyeOff size={16} />}
                    </VisibilityIndicator>
                  </ItemOverlay>
                </ItemImage>
                
                <ItemInfo layout={viewLayout}>
                  <ItemTitle>{piece.title}</ItemTitle>
                  <ItemMeta>
                    <MetaItem>
                      <VisibilityBadge visibility={piece.visibility}>
                        {piece.visibility}
                      </VisibilityBadge>
                    </MetaItem>
                    {piece.year && <MetaItem>{piece.year}</MetaItem>}
                    {piece.views !== undefined && <MetaItem>{piece.views} views</MetaItem>}
                    {piece.category && <MetaItem>{piece.category}</MetaItem>}
                  </ItemMeta>
                  {viewLayout === 'list' && piece.description && (
                    <ItemDescription>{piece.description}</ItemDescription>
                  )}
                  {piece.tags && piece.tags.length > 0 && (
                    <TagContainer>
                      {piece.tags.slice(0, 3).map(tag => (
                        <TagBadge key={tag}>#{tag}</TagBadge>
                      ))}
                      {piece.tags.length > 3 && (
                        <TagBadge>+{piece.tags.length - 3}</TagBadge>
                      )}
                    </TagContainer>
                  )}
                </ItemInfo>
              </GalleryItem>
            ))}
          </GalleryGrid>
        )}
      </GalleryContainer>

      {/* Upload Modal */}
      {showUploadModal && (
        <ArtworkUploadModal
          portfolioId={portfolio.id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </PageWrapper>
  );
}

// ============= STYLED COMPONENTS =============
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`;

const SearchContainer = styled.div`
  position: relative;
  min-width: 300px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ViewControls = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 0.75rem;
  background: ${props => props.active ? '#f3f4f6' : 'white'};
  border: none;
  cursor: pointer;
  color: ${props => props.active ? '#374151' : '#6b7280'};
  
  &:hover {
    background: #f9fafb;
  }
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const GalleryContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const GalleryGrid = styled.div<{ layout: GalleryLayout }>`
  display: grid;
  gap: 1.5rem;
  
  ${props => props.layout === 'masonry' && `
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  `}
  
  ${props => props.layout === 'list' && `
    grid-template-columns: 1fr;
  `}
`;

const GalleryItem = styled.div<{ layout: GalleryLayout }>`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  ${props => props.layout === 'list' && `
    display: grid;
    grid-template-columns: 200px 1fr;
    
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `}
`;

const ItemImage = styled.div`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemOverlay = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${GalleryItem}:hover & {
    opacity: 1;
  }
`;

const OverlayButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

const VisibilityIndicator = styled.div<{ visibility: GalleryVisibility }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => 
    props.visibility === 'public' ? 'rgba(34, 197, 94, 0.9)' :
    props.visibility === 'private' ? 'rgba(239, 68, 68, 0.9)' :
    'rgba(251, 191, 36, 0.9)'
  };
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemInfo = styled.div<{ layout: GalleryLayout }>`
  padding: 1rem;
  
  ${props => props.layout === 'list' && `
    display: flex;
    flex-direction: column;
    justify-content: center;
  `}
`;

const ItemTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #111827;
`;

const ItemMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const MetaItem = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const VisibilityBadge = styled.span<{ visibility: GalleryVisibility }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  
  ${props => props.visibility === 'public' && `
    background: #dcfce7;
    color: #166534;
  `}
  
  ${props => props.visibility === 'private' && `
    background: #fef2f2;
    color: #dc2626;
  `}
  
  ${props => props.visibility === 'unlisted' && `
    background: #fef3c7;
    color: #d97706;
  `}
`;

const ItemDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const TagBadge = styled.span`
  padding: 0.125rem 0.375rem;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const EmptyGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 3rem;
`;

const EmptyGalleryIcon = styled.div`
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyGalleryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const EmptyGalleryDescription = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  max-width: 500px;
  line-height: 1.6;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #6b7280;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 3rem 2rem;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const EmptyStateTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`;

const EmptyStateDescription = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const UpgradeButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px -4px rgba(139, 92, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -8px rgba(139, 92, 246, 0.4);
  }
`;