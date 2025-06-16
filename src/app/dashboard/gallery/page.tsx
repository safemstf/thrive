// src/app/dashboard/gallery/page.tsx
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Gallery } from '@/components/gallery';
import { useApiConnection } from '@/providers/apiProvider';
import { ConnectionStatusIndicator } from '@/components/apiConnectionManager';
import { useAuth } from '@/providers/authProvider';
import { useMyPortfolio } from '@/hooks/usePortfolioApi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UploadIcon as PlusIcon, GridIcon, ListIcon } from '@/components/ui/icons';
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';
import { useRouter, useSearchParams } from 'next/navigation';

// ==================== CONSTANTS ====================
const ITEMS_PER_PAGE = 12;

type ViewLayout = 'grid' | 'masonry' | 'list';
type GalleryMode = 'public' | 'private';

export default function GalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connectionStatus, isReady } = useApiConnection();
  const { user, isAuthenticated } = useAuth();
  
  const { data: portfolio, isLoading: portfolioLoading, error: portfolioError, refetch } = useMyPortfolio();
  
  // State management
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [galleryMode, setGalleryMode] = useState<GalleryMode>(() => {
    // Persist gallery mode in localStorage
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('galleryMode') as GalleryMode) || 'public';
    }
    return 'public';
  });
  const [viewLayout, setViewLayout] = useState<ViewLayout>(() => {
    // Persist view layout in localStorage
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('viewLayout') as ViewLayout) || 'masonry';
    }
    return 'masonry';
  });

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('galleryMode', galleryMode);
  }, [galleryMode]);

  useEffect(() => {
    localStorage.setItem('viewLayout', viewLayout);
  }, [viewLayout]);

  // Check if we should open upload modal from query param
  useEffect(() => {
    const shouldOpenUpload = searchParams.get('upload') === 'true';
    if (shouldOpenUpload && isAuthenticated) {
      setShowUploadModal(true);
      
      // Clean up the URL without triggering re-render
      const url = new URL(window.location.href);
      url.searchParams.delete('upload');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, isAuthenticated]);

  // Memoized values
  const showSetup = useMemo(() => {
    return isAuthenticated && !portfolioLoading && !portfolio && !portfolioError;
  }, [isAuthenticated, portfolioLoading, portfolio, portfolioError]);

  const galleryConfig = useMemo(() => ({
    layout: viewLayout,
    itemsPerPage: ITEMS_PER_PAGE,
    showPrivateIndicator: galleryMode === 'private',
    enableSelection: galleryMode === 'private',
    enableQuickEdit: galleryMode === 'private'
  }), [viewLayout, galleryMode]);

  // Callbacks
  const handleUploadSuccess = useCallback(() => {
    refetch();
    setShowUploadModal(false);
    // Optionally refresh the gallery component
    window.dispatchEvent(new CustomEvent('gallery-refresh'));
  }, [refetch]);

  const handleUploadClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/gallery?upload=true');
      return;
    }
    setShowUploadModal(true);
  }, [isAuthenticated, router]);

  const handleGalleryModeChange = useCallback((mode: GalleryMode) => {
    setGalleryMode(mode);
  }, []);

  const handleViewLayoutChange = useCallback((layout: ViewLayout) => {
    setViewLayout(layout);
  }, []);

  // Gallery metadata
  const galleryTitle = galleryMode === 'public' 
    ? 'Discover Creative Works' 
    : 'My Portfolio Gallery';
    
  const gallerySubtitle = galleryMode === 'public'
    ? 'Explore artwork from our creative community'
    : 'Manage and organize your portfolio pieces';

  return (
    <PageWrapper>
      <Header>
        <HeaderTop>
          <HeaderContent>
            <Title>{galleryTitle}</Title>
            <Subtitle>{gallerySubtitle}</Subtitle>
          </HeaderContent>
          
          <ConnectionStatus>
            <ConnectionStatusIndicator />
          </ConnectionStatus>
        </HeaderTop>
        
        <HeaderActions>
          {isAuthenticated && (
            <>
              <ViewToggle>
                <ToggleButton 
                  $active={galleryMode === 'public'}
                  onClick={() => handleGalleryModeChange('public')}
                >
                  Community Gallery
                </ToggleButton>
                <ToggleButton 
                  $active={galleryMode === 'private'}
                  onClick={() => handleGalleryModeChange('private')}
                >
                  My Artwork
                </ToggleButton>
              </ViewToggle>

              <LayoutToggle>
                <LayoutButton
                  $active={viewLayout === 'grid'}
                  onClick={() => handleViewLayoutChange('grid')}
                  title="Grid view"
                >
                  <GridIcon size={18} />
                </LayoutButton>
                <LayoutButton
                  $active={viewLayout === 'masonry'}
                  onClick={() => handleViewLayoutChange('masonry')}
                  title="Masonry view"
                >
                  <GridIcon size={18} style={{ transform: 'rotate(45deg)' }} />
                </LayoutButton>
                <LayoutButton
                  $active={viewLayout === 'list'}
                  onClick={() => handleViewLayoutChange('list')}
                  title="List view"
                >
                  <ListIcon size={18} />
                </LayoutButton>
              </LayoutToggle>

              <UploadButton onClick={handleUploadClick} id="gallery-upload-button">
                <PlusIcon size={18} />
                <span>Upload Artwork</span>
              </UploadButton>
            </>
          )}
          
          {!isAuthenticated && (
            <Link href="/login?redirect=/dashboard/gallery">
              <LoginButton>
                Sign In to Upload
              </LoginButton>
            </Link>
          )}
        </HeaderActions>
      </Header>

      {showSetup && (
        <SetupPrompt>
          <SetupContent>
            <SetupIcon>🎨</SetupIcon>
            <SetupTitle>Welcome to Your Gallery</SetupTitle>
            <SetupDescription>
              Start building your creative portfolio. Upload your artwork,
              organize your collection, and share your talent with the world.
            </SetupDescription>
            <SetupFeatures>
              <Feature>
                <FeatureIcon>✨</FeatureIcon>
                <FeatureText>Upload unlimited artwork</FeatureText>
              </Feature>
              <Feature>
                <FeatureIcon>🖼️</FeatureIcon>
                <FeatureText>Organize with tags and categories</FeatureText>
              </Feature>
              <Feature>
                <FeatureIcon>🔒</FeatureIcon>
                <FeatureText>Control visibility settings</FeatureText>
              </Feature>
              <Feature>
                <FeatureIcon>📊</FeatureIcon>
                <FeatureText>Track views and engagement</FeatureText>
              </Feature>
            </SetupFeatures>
            <SetupActions>
              <UploadButton onClick={handleUploadClick}>
                <PlusIcon size={18} />
                <span>Upload Your First Artwork</span>
              </UploadButton>
              <Link href="/portfolio/edit">
                <SecondaryButton>
                  Create Portfolio
                </SecondaryButton>
              </Link>
            </SetupActions>
          </SetupContent>
        </SetupPrompt>
      )}

      <GalleryContainer>
        <Gallery 
          key={galleryMode} // Force re-mount when mode changes
          mode={galleryMode} 
          viewConfig={galleryConfig}
        />
      </GalleryContainer>

      {/* Floating Action Button for Mobile */}
      {isAuthenticated && (
        <MobileUploadButton onClick={handleUploadClick}>
          <PlusIcon size={24} />
        </MobileUploadButton>
      )}

      {/* Artwork Upload Modal */}
      {showUploadModal && (
        <ArtworkUploadModal 
          portfolioId={portfolio?.id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </PageWrapper>
  );
}

// ==================== Styled Components ====================
const PageWrapper = styled.main`
  min-height: 100vh;
  background-color: #fafafa;
  padding-bottom: 4rem;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ConnectionStatus = styled.div`
  @media (max-width: 768px) {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
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

  @media (max-width: 768px) {
    padding: 0.375rem 0.75rem;
    font-size: 0.813rem;
  }
`;

const LayoutToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  gap: 2px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LayoutButton = styled.button<{ $active: boolean }>`
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
  
  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.813rem;
    
    span {
      display: none;
    }
  }
`;

const LoginButton = styled(Button)`
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  
  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

const GalleryContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SetupPrompt = styled.div`
  max-width: 800px;
  margin: 3rem auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    margin: 2rem auto;
    padding: 0 1rem;
  }
`;

const SetupContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const SetupIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const SetupTitle = styled.h2`
  font-size: 2rem;
  color: #111827;
  margin-bottom: 1rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SetupDescription = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SetupFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FeatureIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const FeatureText = styled.span`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.4;
  text-align: left;
`;

const SetupActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const SecondaryButton = styled(Button)`
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-2px);
  }
`;

const MobileUploadButton = styled.button`
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