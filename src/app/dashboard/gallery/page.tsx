// src/app/dashboard/gallery/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
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
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams

// ==================== CONSTANTS ====================
const ITEMS_PER_PAGE = 12;

type ViewLayout = 'grid' | 'masonry' | 'list';

export default function GalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get query parameters
  const { connectionStatus, isReady } = useApiConnection();
  const auth = useAuth();
  const user = auth?.user as any;
  const isAuthenticated = auth?.isAuthenticated as boolean;
  
  const { data: portfolio, isLoading, isError, refetch } = useMyPortfolio();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [galleryMode, setGalleryMode] = useState<'public' | 'private'>('public');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('masonry');
  const [showSetup, setShowSetup] = useState(false);

  // Show setup prompt for authenticated users without a portfolio
  useEffect(() => {
    if (isAuthenticated && !isLoading && !portfolio) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [isAuthenticated, isLoading, portfolio]);

  // Check if we should open upload modal from query param
  useEffect(() => {
    const shouldOpenUpload = searchParams.get('upload') === 'true';
    if (shouldOpenUpload && portfolio) {
      setShowUploadModal(true);
      
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('upload');
      router.replace(`/dashboard/gallery?${newParams.toString()}`);
    }
  }, [searchParams, portfolio, router]);

  // Refresh gallery after upload
  const handleUploadSuccess = () => {
    refetch();
    setShowUploadModal(false);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    if (portfolio) {
      setShowUploadModal(true);
    } else {
      router.push('/portfolio/edit');
    }
  };

  // Calculate gallery stats
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
              {portfolio && (
                <>
                  <ViewToggle>
                    <ToggleButton 
                      $active={galleryMode === 'public'}
                      onClick={() => setGalleryMode('public')}
                    >
                      Community Gallery
                    </ToggleButton>
                    <ToggleButton 
                      $active={galleryMode === 'private'}
                      onClick={() => setGalleryMode('private')}
                    >
                      My Artwork
                    </ToggleButton>
                  </ViewToggle>

                  <LayoutToggle>
                    <LayoutButton
                      $active={viewLayout === 'grid'}
                      onClick={() => setViewLayout('grid')}
                      title="Grid view"
                    >
                      <GridIcon size={18} />
                    </LayoutButton>
                    <LayoutButton
                      $active={viewLayout === 'masonry'}
                      onClick={() => setViewLayout('masonry')}
                      title="Masonry view"
                    >
                      <GridIcon size={18} style={{ transform: 'rotate(45deg)' }} />
                    </LayoutButton>
                    <LayoutButton
                      $active={viewLayout === 'list'}
                      onClick={() => setViewLayout('list')}
                      title="List view"
                    >
                      <ListIcon size={18} />
                    </LayoutButton>
                  </LayoutToggle>
                </>
              )}

              <UploadButton onClick={handleUploadClick} id="gallery-upload-button">
                <PlusIcon size={18} />
                <span>Upload Artwork</span>
              </UploadButton>
            </>
          )}
        </HeaderActions>
      </Header>

      {showSetup && (
        <SetupPrompt>
          <SetupContent>
            <SetupIcon>🎨</SetupIcon>
            <SetupTitle>Create Your Portfolio</SetupTitle>
            <SetupDescription>
              Set up your professional portfolio to showcase your creative work,
              connect with other artists, and build your online presence.
            </SetupDescription>
            <SetupFeatures>
              <Feature>
                <FeatureIcon>✨</FeatureIcon>
                <FeatureText>Customizable portfolio layout</FeatureText>
              </Feature>
              <Feature>
                <FeatureIcon>🖼️</FeatureIcon>
                <FeatureText>Unlimited artwork uploads</FeatureText>
              </Feature>
              <Feature>
                <FeatureIcon>📊</FeatureIcon>
                <FeatureText>Analytics and insights</FeatureText>
              </Feature>
              <Feature>
                <FeatureIcon>🔗</FeatureIcon>
                <FeatureText>Share your work easily</FeatureText>
              </Feature>
            </SetupFeatures>
            <SetupActions>
              <Link href="/portfolio/edit">
                <PrimaryButton>
                  Get Started
                </PrimaryButton>
              </Link>
              <UploadButton onClick={handleUploadClick}>
                <PlusIcon size={18} />
                <span>Upload Artwork</span>
              </UploadButton>
              <Link href="/portfolio/discover">
                <SecondaryButton>
                  Browse Portfolios
                </SecondaryButton>
              </Link>
            </SetupActions>
          </SetupContent>
        </SetupPrompt>
      )}

      <GalleryContainer>
        <Gallery 
          mode={galleryMode} 
          viewConfig={{
            layout: viewLayout,
            itemsPerPage: ITEMS_PER_PAGE,
            showPrivateIndicator: galleryMode === 'private',
            enableSelection: galleryMode === 'private'
          }}
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
`;

const SetupActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(Button)`
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
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