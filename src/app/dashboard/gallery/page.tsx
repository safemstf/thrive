// src/app/dashboard/gallery/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  Plus, Grid3x3, List, Search, Edit3, 
  Eye, EyeOff, Trash2, Upload,
  Image as ImageIcon, ArrowLeft,
  Container
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
  const [selectedPiece, setSelectedPiece] = useState<GalleryPiece | null>(null);

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
    piece.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    piece.artist?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <BackButton onClick={() => router.push('/dashboard')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </BackButton>

        <HeaderContent>
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
                <Grid3x3 size={18} />
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
        </HeaderContent>
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
                onClick={() => setSelectedPiece(piece)}
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
                  
                  {piece.artist && (
                    <ItemArtist>by {piece.artist}</ItemArtist>
                  )}
                  
                  <ItemMeta>
                    <MetaItem>
                      <VisibilityBadge visibility={piece.visibility}>
                        {piece.visibility}
                      </VisibilityBadge>
                    </MetaItem>
                    {piece.year && <MetaItem>{piece.year}</MetaItem>}
                    {piece.views !== undefined && <MetaItem>{piece.views} views</MetaItem>}
                    {piece.category && <MetaItem>{piece.category}</MetaItem>}
                    
                    {piece.price !== undefined && piece.price > 0 && (
                      <PriceBadge>${piece.price.toFixed(2)}</PriceBadge>
                    )}
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

      {/* Lightbox Modal */}
      {selectedPiece && (
        <LightboxOverlay onClick={() => setSelectedPiece(null)}>
          <LightboxContent onClick={(e) => e.stopPropagation()}>
            <CloseButton 
              onClick={() => setSelectedPiece(null)} 
              title="Close lightbox"
            >
              ×
            </CloseButton>
            
            <LightboxImageContainer>
              <img src={selectedPiece.imageUrl} alt={selectedPiece.title || 'Gallery piece'} />
            </LightboxImageContainer>
            
            <LightboxInfo>
              <LightboxTitle>{selectedPiece.title}</LightboxTitle>
              {selectedPiece.description && (
                <LightboxDescription>{selectedPiece.description}</LightboxDescription>
              )}
              
              <LightboxMeta>
                {selectedPiece.artist && (
                  <MetaRow><strong>Artist:</strong> {selectedPiece.artist}</MetaRow>
                )}
                {selectedPiece.medium && (
                  <MetaRow><strong>Medium:</strong> {selectedPiece.medium}</MetaRow>
                )}
                {selectedPiece.year && (
                  <MetaRow><strong>Year:</strong> {selectedPiece.year}</MetaRow>
                )}
                {selectedPiece.category && (
                  <MetaRow><strong>Category:</strong> {selectedPiece.category}</MetaRow>
                )}
                {selectedPiece.price && (
                  <MetaRow><strong>Price:</strong> ${selectedPiece.price}</MetaRow>
                )}
                {selectedPiece.tags && selectedPiece.tags.length > 0 && (
                  <MetaRow>
                    <strong>Tags:</strong> {selectedPiece.tags.map(tag => `#${tag}`).join(', ')}
                  </MetaRow>
                )}
              </LightboxMeta>
              
              <LightboxActions>
                <ActionButton onClick={() => handleEditPiece(selectedPiece)}>
                  <Edit3 size={16} />
                  Edit Artwork
                </ActionButton>
              </LightboxActions>
            </LightboxInfo>
          </LightboxContent>
        </LightboxOverlay>
      )}
    </PageWrapper>
  );
}

// ============= STYLED COMPONENTS =============
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  font-family: 'Work Sans', sans-serif;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 1.5rem 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.5rem 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 2px;
  margin-bottom: 1rem;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
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
  font-size: 2.5rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0.25rem 0 0 0;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
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
  border-radius: 2px;
  background: white;
  font-family: 'Work Sans', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 1px rgba(44, 44, 44, 0.1);
  }
`;

const ViewControls = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 0.75rem;
  background: ${props => props.active ? '#f3f4f6' : 'white'};
  border: none;
  cursor: pointer;
  color: ${props => props.active ? '#2c2c2c' : '#666'};
  
  &:hover {
    background: #f9fafb;
  }
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2c2c2c;
  color: #f8f8f8;
  border: none;
  border-radius: 2px;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  
  &:hover {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
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
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  ${props => props.layout === 'list' && `
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  
  &:hover {
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
  transition: all 0.3s ease;
  
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
    flex: 1;
  `}
`;

const ItemTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0 0 0.25rem 0;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 0.5px;
`;

const ItemArtist = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-style: italic;
  font-family: 'Work Sans', sans-serif;
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
  color: #666;
  font-family: 'Work Sans', sans-serif;
`;

const PriceBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #dcfce7;
  color: #166534;
  font-family: 'Work Sans', sans-serif;
`;

const VisibilityBadge = styled.span<{ visibility: GalleryVisibility }>`
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  font-family: 'Work Sans', sans-serif;
  
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
  color: #666;
  margin: 0;
  line-height: 1.5;
  font-family: 'Work Sans', sans-serif;
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
  color: #666;
  border-radius: 2px;
  font-size: 0.75rem;
  font-family: 'Work Sans', sans-serif;
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
  font-weight: 400;
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  font-family: 'Cormorant Garamond', serif;
`;

const EmptyGalleryDescription = styled.p`
  color: #666;
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  max-width: 500px;
  line-height: 1.6;
  font-family: 'Work Sans', sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #666;
  font-family: 'Work Sans', sans-serif;
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
  font-weight: 400;
  color: #2c2c2c;
  margin-bottom: 1rem;
  font-family: 'Cormorant Garamond', serif;
`;

const EmptyStateDescription = styled.p`
  font-size: 1.125rem;
  color: #666;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-family: 'Work Sans', sans-serif;
`;

const UpgradeButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 2px;
  font-size: 1.1rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -8px rgba(139, 92, 246, 0.4);
  }
`;

// Lightbox components
const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const LightboxContent = styled.div`
  position: relative;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  max-width: 90vw;
  max-height: 90vh;
  width: 900px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 2px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const LightboxImageContainer = styled.div`
  width: 100%;
  max-height: 60vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  
  img {
    width: 100%;
    height: auto;
    max-height: 60vh;
    object-fit: contain;
  }
`;

const LightboxInfo = styled.div`
  padding: 1.5rem;
  max-height: 30vh;
  overflow-y: auto;
`;

const LightboxTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 400;
  color: #2c2c2c;
  font-family: 'Cormorant Garamond', serif;
`;

const LightboxDescription = styled.p`
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.6;
  font-family: 'Work Sans', sans-serif;
`;

const LightboxMeta = styled.div`
  margin-bottom: 1.5rem;
`;

const MetaRow = styled.div`
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
  font-family: 'Work Sans', sans-serif;
  
  strong {
    color: #2c2c2c;
    margin-right: 0.5rem;
    font-weight: 500;
  }
`;

const LightboxActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.75rem 1.5rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 2px;
  
  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
  }
`;