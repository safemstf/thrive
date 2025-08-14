// app/portfolio/[username]/page.tsx - Fixed Type handling and API response structure
'use client';
import styled from 'styled-components';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Globe, Mail, MapPin, Calendar, ExternalLink, 
  Github, Linkedin, Twitter, Instagram, 
  Eye, Heart, Share2, Download, AlertCircle,
  Grid3x3, List, Layers, Loader2, ArrowLeft
} from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Portfolio } from '@/types/portfolio.types';
import { getPortfolioId, getGalleryPieceId } from '@/types/portfolio.types';
import { BackendGalleryPiece } from '@/types/base.types';

// Define a unified gallery piece type for this component
interface DisplayGalleryPiece {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category?: string;
  medium?: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'unlisted';
  year?: number;
  price?: number;
  artist?: string;
  displayOrder?: number;
  views?: number;
  likes?: number;
  portfolioId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Helper function to safely get gallery piece ID for DisplayGalleryPiece
const getDisplayGalleryPieceId = (piece: DisplayGalleryPiece | null | undefined): string | null => {
  if (!piece) return null;
  return piece.id || piece._id || null;
}

// Convert BackendGalleryPiece to DisplayGalleryPiece
const normalizeGalleryPiece = (piece: BackendGalleryPiece): DisplayGalleryPiece => {
  return {
    id: piece.id || piece._id,
    _id: piece._id,
    title: piece.title,
    description: piece.description,
    imageUrl: piece.imageUrl,
    thumbnailUrl: piece.thumbnailUrl,
    category: piece.category,
    medium: piece.medium,
    tags: piece.tags,
    visibility: piece.visibility,
    year: piece.year,
    price: piece.price,
    artist: piece.artist,
    displayOrder: piece.displayOrder,
    views: piece.stats?.views || 0,
    likes: piece.stats?.likes || 0,
    portfolioId: piece.portfolioId,
    createdAt: piece.createdAt,
    updatedAt: piece.updatedAt,
  };
};

// Enhanced image URL normalization that matches your backend routes exactly
const normalizeImageUrl = (
  url: string | undefined, 
  username?: string, 
  pieceId?: string, 
  type?: 'profile' | 'cover'
): string | null => {
  if (!url || url.trim() === '') return null;
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://60a90cb1d075.ngrok-free.app';
  
  // For gallery images, ALWAYS use the API route if we have username and pieceId
  if (username && pieceId) {
    // Gallery image - use public route: /api/portfolios/by-username/:username/gallery/:pieceId/image
    return `${backendUrl}/api/portfolios/by-username/${username}/gallery/${pieceId}/image`;
  }
  
  // For profile/cover images, use the API route if we have username and type
  if (username && type) {
    // Profile/cover image - use public route: /api/portfolios/by-username/:username/image/:type
    return `${backendUrl}/api/portfolios/by-username/${username}/image/${type}`;
  }
  
  // If it's already a full URL, return as-is (for fallback cases)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Handle direct upload URLs as fallback (these should work as-is)
  if (url.includes('/uploads/')) {
    // Clean up the URL path
    let cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${backendUrl}${cleanUrl}`.replace(/([^:]\/)\/+/g, '$1');
  }
  
  // Final fallback - try to construct a valid URL
  let cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${backendUrl}${cleanUrl}`.replace(/([^:]\/)\/+/g, '$1');
};

// Updated SecureImage component with better route handling
const SecureImage = React.memo<{
  src: string | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: () => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  username?: string;  // Add username for route construction
  pieceId?: string;   // Add pieceId for gallery images
  imageType?: 'profile' | 'cover' | 'gallery';  // Add type for proper routing
}>(({ src, alt, className, style, onError, onLoad, loading = 'lazy', username, pieceId, imageType }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const secureUrl = useMemo(() => {
    if (imageType === 'gallery' && username && pieceId) {
      return normalizeImageUrl(src, username, pieceId);
    }
    if ((imageType === 'profile' || imageType === 'cover') && username) {
      return normalizeImageUrl(src, username, undefined, imageType);
    }
    return normalizeImageUrl(src);
  }, [src, username, pieceId, imageType]);
  
  const handleError = useCallback((e: React.SyntheticEvent) => {
    console.log('[Image] Load failed for:', secureUrl);
    console.log('[Image] Original src:', src);
    console.log('[Image] Image type:', imageType);
    console.log('[Image] Username:', username);
    console.log('[Image] Piece ID:', pieceId);
    setImageError(true);
    setImageLoading(false);
    onError?.();
  }, [secureUrl, src, imageType, username, pieceId, onError]);

  const handleLoad = useCallback(() => {
    console.log('[Image] Load successful for:', secureUrl);
    setImageLoading(false);
    setImageError(false);
    onLoad?.();
  }, [secureUrl, onLoad]);

  // Reset states when src changes
  useEffect(() => {
    if (secureUrl) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [secureUrl]);

  if (!secureUrl || imageError) {
    return (
      <ImagePlaceholder className={className} style={style}>
        {imageError ? <AlertCircle size={24} /> : <div>📷</div>}
        <span>{imageError ? 'Image unavailable' : 'No image'}</span>
      </ImagePlaceholder>
    );
  }

  return (
    <ImageWrapper className={className} style={style}>
      {imageLoading && (
        <ImageLoader>
          <Loader2 size={20} className="animate-spin" />
        </ImageLoader>
      )}
      <img
        src={secureUrl}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        loading={loading}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: imageLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </ImageWrapper>
  );
});

SecureImage.displayName = 'SecureImage';

type ViewMode = 'grid' | 'masonry' | 'list';

export default function PortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [galleryPieces, setGalleryPieces] = useState<DisplayGalleryPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [selectedPiece, setSelectedPiece] = useState<DisplayGalleryPiece | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch portfolio data
        const portfolioResponse = await api.portfolio.getByUsername(username);
        if (!portfolioResponse || !portfolioResponse.success) {
          throw new Error('Portfolio not found');
        }
        
        // Extract the actual portfolio from the response
        const portfolioData = portfolioResponse.portfolio;
        setPortfolio(portfolioData);

        // Fetch gallery if portfolio supports it
        if (['creative', 'hybrid', 'professional'].includes(portfolioData.kind)) {
          try {
            const galleryResponse = await api.portfolio.gallery.getByUsername(username, 1, 50);
            
            let pieces: DisplayGalleryPiece[] = [];
            
            if (galleryResponse && typeof galleryResponse === 'object') {
              // Handle different possible response structures
              let rawPieces: BackendGalleryPiece[] = [];
              
              if ('pieces' in galleryResponse) {
                rawPieces = galleryResponse.pieces || [];
              } else if ('galleryPieces' in galleryResponse) {
                rawPieces = (galleryResponse as any).galleryPieces || [];
              } else if (Array.isArray(galleryResponse)) {
                rawPieces = galleryResponse;
              }
              
              // Convert backend pieces to display pieces
              pieces = rawPieces.map(normalizeGalleryPiece);
            }
            
            setGalleryPieces(pieces);
          } catch (galleryError) {
            console.error('Failed to fetch gallery:', galleryError);
            setGalleryPieces([]);
          }
        }

        // Track view
        try {
          const portfolioId = getPortfolioId(portfolioData);
          if (portfolioId) {
            await api.portfolio.analytics.trackView(portfolioId, {
              referrer: document.referrer || undefined,
            });
          }
        } catch (trackError) {
          console.log('Could not track view:', trackError);
        }
      } catch (err: any) {
        console.error('Failed to fetch portfolio:', err);
        if (err.status === 404 || err.message?.includes('not found')) {
          setError('Portfolio not found');
        } else if (err.status === 403) {
          setError('Access denied');
        } else {
          setError('Failed to load portfolio');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [username]);

  const handleShare = async () => {
    const shareData = {
      title: `${portfolio?.name || portfolio?.title || 'Portfolio'} - LearnMorra`,
      text: portfolio?.tagline || portfolio?.bio?.substring(0, 100) || 'Check out this portfolio',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Portfolio link copied to clipboard!');
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Portfolio link copied to clipboard!');
      } catch (clipboardErr) {
        console.error('Clipboard access failed:', clipboardErr);
      }
    }
  };

  const handleDownload = useCallback(async (piece: DisplayGalleryPiece) => {
    if (!piece.imageUrl) return;

    try {
      const pieceId = getDisplayGalleryPieceId(piece);
      let secureUrl: string | null = null;
      
      if (pieceId && portfolio?.username) {
        // Use the proper backend route for gallery images
        secureUrl = normalizeImageUrl(piece.imageUrl, portfolio.username, pieceId);
      } else {
        // Fallback to original URL normalization
        secureUrl = normalizeImageUrl(piece.imageUrl);
      }
      
      if (!secureUrl) {
        alert('Download not available for this image.');
        return;
      }

      const link = document.createElement('a');
      link.href = secureUrl;
      link.download = `${piece.title || 'artwork'}.jpg`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  }, [portfolio?.username]);

  if (loading) {
    return (
      <PageWrapper>
        <LoadingContainer>
          <Loader2 size={48} className="animate-spin" />
          <LoadingText>Loading portfolio...</LoadingText>
        </LoadingContainer>
      </PageWrapper>
    );
  }

  if (error || !portfolio) {
    return (
      <PageWrapper>
        <ErrorContainer>
          <ErrorIcon>🎨</ErrorIcon>
          <ErrorTitle>
            {error === 'Portfolio not found' ? 'Portfolio Not Found' : 
             error === 'Access denied' ? 'Access Denied' : 
             'Unable to Load Portfolio'}
          </ErrorTitle>
          <ErrorMessage>
            {error === 'Portfolio not found' 
              ? "The portfolio you're looking for doesn't exist or has been made private."
              : error === 'Access denied'
              ? "You don't have permission to view this portfolio."
              : "There was an error loading this portfolio. Please try again later."}
          </ErrorMessage>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft size={16} />
            Go Back
          </BackButton>
        </ErrorContainer>
      </PageWrapper>
    );
  }

  if (portfolio.visibility === 'private') {
    return (
      <PageWrapper>
        <ErrorContainer>
          <ErrorIcon>🔒</ErrorIcon>
          <ErrorTitle>Private Portfolio</ErrorTitle>
          <ErrorMessage>This portfolio is private and cannot be viewed publicly.</ErrorMessage>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft size={16} />
            Go Back
          </BackButton>
        </ErrorContainer>
      </PageWrapper>
    );
  }

  const displayName = portfolio.name || portfolio.title || portfolio.username || 'Anonymous';

  return (
    <PageWrapper>
      {/* Hero Section */}
      <HeroSection>
        <HeroContainer>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
            Back to Browse
          </BackButton>

          {portfolio.coverImage && (
            <CoverImageContainer>
              <SecureImage
                src={portfolio.coverImage}
                alt={`${displayName}'s cover image`}
                username={portfolio.username}
                imageType="cover"
              />
            </CoverImageContainer>
          )}

          <ProfileSection>
            <AvatarContainer>
              {portfolio.profileImage ? (
                <Avatar>
                  <SecureImage
                    src={portfolio.profileImage}
                    alt={`${displayName}'s profile`}
                    username={portfolio.username}
                    imageType="profile"
                  />
                </Avatar>
              ) : (
                <AvatarPlaceholder>
                  {displayName.charAt(0).toUpperCase()}
                </AvatarPlaceholder>
              )}
            </AvatarContainer>

            <ProfileInfo>
              <ProfileName>{displayName}</ProfileName>
              <ProfileHandle>@{portfolio.username}</ProfileHandle>
              
              {portfolio.tagline && (
                <ProfileTagline>{portfolio.tagline}</ProfileTagline>
              )}

              <MetaContainer>
                {portfolio.location && (
                  <MetaItem>
                    <MapPin size={16} />
                    {portfolio.location}
                  </MetaItem>
                )}
                <MetaItem>
                  <Eye size={16} />
                  {(portfolio.stats?.totalViews || 0).toLocaleString()} views
                </MetaItem>
                {portfolio.createdAt && (
                  <MetaItem>
                    <Calendar size={16} />
                    Joined {new Date(portfolio.createdAt).getFullYear()}
                  </MetaItem>
                )}
              </MetaContainer>

              {portfolio.specializations && portfolio.specializations.length > 0 && (
                <TagsContainer>
                  <TagsGrid>
                    {portfolio.specializations.slice(0, 6).map((spec, index) => (
                      <Tag key={index}>
                        {spec}
                      </Tag>
                    ))}
                    {portfolio.specializations.length > 6 && (
                      <Tag $secondary>
                        +{portfolio.specializations.length - 6} more
                      </Tag>
                    )}
                  </TagsGrid>
                </TagsContainer>
              )}

              {portfolio.tags && portfolio.tags.length > 0 && (
                <TagsContainer>
                  <TagsGrid>
                    {portfolio.tags.slice(0, 5).map((tag, index) => (
                      <Tag key={index} $secondary>
                        #{tag}
                      </Tag>
                    ))}
                  </TagsGrid>
                </TagsContainer>
              )}

              {portfolio.socialLinks && Object.keys(portfolio.socialLinks).length > 0 && (
                <SocialLinks>
                  {portfolio.socialLinks.github && (
                    <SocialLink href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      <Github size={20} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks.linkedin && (
                    <SocialLink href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin size={20} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks.twitter && (
                    <SocialLink href={portfolio.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter size={20} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks.instagram && (
                    <SocialLink href={portfolio.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram size={20} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks.website && (
                    <SocialLink href={portfolio.socialLinks.website} target="_blank" rel="noopener noreferrer">
                      <Globe size={20} />
                    </SocialLink>
                  )}
                </SocialLinks>
              )}
            </ProfileInfo>

            <ActionButtons>
              <ActionButton onClick={handleShare}>
                <Share2 size={16} />
                Share Portfolio
              </ActionButton>
              {portfolio.contactEmail && (
                <ActionButton $primary as="a" href={`mailto:${portfolio.contactEmail}`}>
                  <Mail size={16} />
                  Get in Touch
                </ActionButton>
              )}
            </ActionButtons>
          </ProfileSection>
        </HeroContainer>
      </HeroSection>

      <ContentContainer>
        {/* Bio Section */}
        {portfolio.bio && portfolio.bio.trim() && (
          <Section>
            <SectionTitle>About</SectionTitle>
            <BioText>{portfolio.bio}</BioText>
          </Section>
        )}

        {/* Stats Section */}
        {portfolio.stats && (
          <Section>
            <StatsGrid>
              <StatCard>
                <StatNumber>{(portfolio.stats.totalViews || 0).toLocaleString()}</StatNumber>
                <StatLabel>Total Views</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{portfolio.stats.totalPieces || galleryPieces.length}</StatNumber>
                <StatLabel>Artworks</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{portfolio.stats.uniqueVisitors || 0}</StatNumber>
                <StatLabel>Unique Visitors</StatLabel>
              </StatCard>
              {portfolio.stats.averageRating && (
                <StatCard>
                  <StatNumber>{portfolio.stats.averageRating.toFixed(1)}★</StatNumber>
                  <StatLabel>Rating</StatLabel>
                </StatCard>
              )}
            </StatsGrid>
          </Section>
        )}

        {/* Gallery Section */}
        {galleryPieces.length > 0 && (
          <Section>
            <GalleryHeader>
              <div>
                <SectionTitle>
                  {portfolio.kind === 'creative' ? 'Gallery' : 
                   portfolio.kind === 'professional' ? 'Projects' : 'Work'}
                </SectionTitle>
                <GalleryCount>
                  ({galleryPieces.length} {galleryPieces.length === 1 ? 'piece' : 'pieces'})
                </GalleryCount>
              </div>
              
              <ViewModeToggle>
                <ViewModeButton 
                  $active={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <Grid3x3 size={18} />
                </ViewModeButton>
                <ViewModeButton 
                  $active={viewMode === 'masonry'}
                  onClick={() => setViewMode('masonry')}
                  title="Masonry view"
                >
                  <Layers size={18} />
                </ViewModeButton>
                <ViewModeButton 
                  $active={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <List size={18} />
                </ViewModeButton>
              </ViewModeToggle>
            </GalleryHeader>

            <GalleryGrid $viewMode={viewMode}>
              {galleryPieces.map((piece, index) => {
                const pieceId = getDisplayGalleryPieceId(piece) || `piece-${index}`;
                return (
                  <GalleryCard 
                    key={pieceId}
                    $viewMode={viewMode}
                    onClick={() => setSelectedPiece(piece)}
                  >
                    <GalleryImageContainer $viewMode={viewMode}>
                      <SecureImage
                        src={piece.imageUrl}
                        alt={piece.title || 'Gallery piece'}
                        username={portfolio.username}
                        pieceId={getDisplayGalleryPieceId(piece) || undefined}
                        imageType="gallery"
                      />
                      <GalleryOverlay>
                        <OverlayContent>
                          <PieceTitle>{piece.title}</PieceTitle>
                          {piece.medium && <PieceMedium>{piece.medium}</PieceMedium>}
                          {piece.year && <PieceYear>{piece.year}</PieceYear>}
                        </OverlayContent>
                        <OverlayActions>
                          <OverlayAction>
                            <Eye size={16} />
                            {piece.views || 0}
                          </OverlayAction>
                          {typeof piece.likes === 'number' && (
                            <OverlayAction>
                              <Heart size={16} />
                              {piece.likes}
                            </OverlayAction>
                          )}
                        </OverlayActions>
                      </GalleryOverlay>
                    </GalleryImageContainer>

                    {viewMode === 'list' && (
                      <ListContent>
                        <ListTitle>{piece.title}</ListTitle>
                        {piece.description && (
                          <ListDescription>
                            {piece.description.length > 150 
                              ? `${piece.description.substring(0, 150)}...` 
                              : piece.description}
                          </ListDescription>
                        )}
                        <ListMeta>
                          {piece.category && <MetaTag>{piece.category}</MetaTag>}
                          {piece.year && <MetaTag>{piece.year}</MetaTag>}
                          {piece.medium && <MetaTag>{piece.medium}</MetaTag>}
                          {piece.price && <MetaTag>${piece.price}</MetaTag>}
                          {piece.tags?.slice(0, 3).map((tag, idx) => (
                            <MetaTag key={idx}>#{tag}</MetaTag>
                          ))}
                        </ListMeta>
                      </ListContent>
                    )}
                  </GalleryCard>
                );
              })}
            </GalleryGrid>
          </Section>
        )}

        {/* Empty Gallery State */}
        {galleryPieces.length === 0 && ['creative', 'hybrid', 'professional'].includes(portfolio.kind) && (
          <Section>
            <EmptyState>
              <EmptyIcon>🎨</EmptyIcon>
              <EmptyTitle>No public artworks yet</EmptyTitle>
              <EmptyDescription>
                This portfolio doesn't have any public artworks to display.
              </EmptyDescription>
            </EmptyState>
          </Section>
        )}
      </ContentContainer>

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
              <SecureImage
                src={selectedPiece.imageUrl}
                alt={selectedPiece.title || 'Gallery piece'}
                username={portfolio.username}
                pieceId={getDisplayGalleryPieceId(selectedPiece) || undefined}
                imageType="gallery"
              />
            </LightboxImageContainer>
            
            <LightboxInfo>
              <LightboxTitle>{selectedPiece.title}</LightboxTitle>
              {selectedPiece.description && (
                <LightboxDescription>{selectedPiece.description}</LightboxDescription>
              )}
              
              <LightboxMeta>
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
                <DownloadButton onClick={() => handleDownload(selectedPiece)}>
                  <Download size={16} />
                  Download
                </DownloadButton>
              </LightboxActions>
            </LightboxInfo>
          </LightboxContent>
        </LightboxOverlay>
      )}

      {/* Footer */}
      <Footer>
        <FooterContainer>
          <FooterText>
            © {new Date().getFullYear()} {displayName}. All rights reserved.
          </FooterText>
          <FooterLinks>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/">LearnMorra</FooterLink>
          </FooterLinks>
        </FooterContainer>
      </Footer>
    </PageWrapper>
  );
}

// Styled Components matching Header & Taskbar aesthetic
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  font-family: 'Work Sans', sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
  color: #666;
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
  font-family: 'Work Sans', sans-serif;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 2rem;
  gap: 1.5rem;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h1`
  font-size: 2rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
`;

const ErrorMessage = styled.p`
  color: #666;
  font-size: 1.125rem;
  max-width: 500px;
  margin: 0;
  line-height: 1.6;
  font-family: 'Work Sans', sans-serif;
`;

const BackButton = styled.button`
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

const HeroSection = styled.section`
  background: white;
  border-bottom: 1px solid #e0e0e0;
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const CoverImageContainer = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 2px;
  overflow: hidden;
  margin: 2rem 0;
  border: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    height: 200px;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const AvatarPlaceholder = styled(Avatar)`
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 400;
  color: #2c2c2c;
  font-family: 'Cormorant Garamond', serif;
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProfileName = styled.h1`
  font-size: 3rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProfileHandle = styled.p`
  font-size: 1.125rem;
  color: #666;
  margin: 0 0 0.5rem 0;
  font-weight: 300;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
`;

const ProfileTagline = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  font-family: 'Work Sans', sans-serif;
`;

const MetaContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
  
  svg {
    color: #666;
    flex-shrink: 0;
  }
`;

const TagsContainer = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
  }
`;

const TagsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span<{ $secondary?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: ${props => props.$secondary ? '#f8f8f8' : 'white'};
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  font-size: 0.85rem;
  font-weight: 300;
  transition: all 0.3s ease;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
  text-transform: ${props => props.$secondary ? 'none' : 'uppercase'};
  
  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    border-color: #2c2c2c;
    transform: translateY(-1px);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  color: #666;
  transition: all 0.3s ease;
  text-decoration: none;
  border-radius: 2px;
  
  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    border-color: #2c2c2c;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#2c2c2c' : 'none'};
  border: 1px solid #2c2c2c;
  color: ${props => props.$primary ? '#f8f8f8' : '#2c2c2c'};
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
  text-decoration: none;

  &:hover {
    background: ${props => props.$primary ? '#1a1a1a' : '#2c2c2c'};
    color: #f8f8f8;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const Section = styled.section`
  padding: 4rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0 0 1.5rem 0;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 1px;
`;

const BioText = styled.div`
  font-size: 1.125rem;
  color: #666;
  line-height: 1.8;
  white-space: pre-wrap;
  max-width: 800px;
  font-family: 'Work Sans', sans-serif;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #2c2c2c;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    min-height: 100px;
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 400;
  color: #2c2c2c;
  margin-bottom: 0.75rem;
  font-family: 'Cormorant Garamond', serif;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 300;
  font-family: 'Work Sans', sans-serif;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const GalleryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const GalleryCount = styled.span`
  font-size: 0.9rem;
  color: #666;
  font-weight: 300;
  margin-left: 0.5rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
`;

const ViewModeToggle = styled.div`
  display: flex;
  gap: 0.25rem;
  background: #f8f8f8;
  padding: 0.25rem;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
`;

const ViewModeButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#2c2c2c' : '#666'};
  border: ${props => props.$active ? '1px solid #e0e0e0' : 'none'};
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.$active ? 'white' : '#e0e0e0'};
    color: #2c2c2c;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const GalleryGrid = styled.div<{ $viewMode: string }>`
  display: grid;
  gap: 1.5rem;
  
  ${props => {
    switch (props.$viewMode) {
      case 'grid':
        return `
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        `;
      case 'masonry':
        return `
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        `;
      case 'list':
        return `
          grid-template-columns: 1fr;
          gap: 1rem;
        `;
      default:
        return `
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        `;
    }
  }}
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const GalleryCard = styled.div<{ $viewMode: string }>`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$viewMode === 'list' ? `
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem;
  ` : ''}
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const GalleryImageContainer = styled.div<{ $viewMode: string }>`
  position: relative;
  width: 100%;
  overflow: hidden;
  
  ${props => props.$viewMode === 'list' ? `
    width: 160px;
    height: 120px;
    flex-shrink: 0;
    border-radius: 2px;
  ` : `
    width: 100%;
    height: 200px;
  `}
`;

const GalleryOverlay = styled.div`
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
  
  ${GalleryCard}:hover & {
    opacity: 1;
  }
`;

const OverlayContent = styled.div`
  color: white;
`;

const PieceTitle = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 400;
  color: white;
  font-family: 'Work Sans', sans-serif;
`;

const PieceMedium = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  font-family: 'Work Sans', sans-serif;
`;

const PieceYear = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-top: 0.25rem;
  font-family: 'Work Sans', sans-serif;
`;

const OverlayActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;
`;

const OverlayAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: white;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ListContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ListTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 400;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
`;

const ListDescription = styled.p`
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
  font-family: 'Work Sans', sans-serif;
`;

const ListMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const MetaTag = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  font-size: 0.75rem;
  color: #666;
  font-weight: 300;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 400;
  color: #2c2c2c;
  font-family: 'Cormorant Garamond', serif;
`;

const EmptyDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
  font-family: 'Work Sans', sans-serif;
`;

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
    font-weight: 400;
  }
`;

const LightboxActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DownloadButton = styled.button`
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

const Footer = styled.footer`
  background: #f8f8f8;
  padding: 3rem 0;
  border-top: 1px solid #e0e0e0;
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 0 1.5rem;
  }
`;

const FooterText = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const FooterLink = styled.a`
  color: #666;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-weight: 300;
  
  &:hover {
    color: #2c2c2c;
    text-decoration: underline;
  }
`;

// Image utility components
const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ImageLoader = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
  color: #999;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  min-height: 120px;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255,255,255,0.1) 10px,
      rgba(255,255,255,0.1) 20px
    );
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  span {
    font-size: 0.75rem;
    font-weight: 300;
    text-align: center;
    font-family: 'Work Sans', sans-serif;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    opacity: 0.7;
  }
  
  svg {
    opacity: 0.5;
  }
  
  div:not(span) {
    font-size: 1.5rem;
    opacity: 0.6;
  }
`;