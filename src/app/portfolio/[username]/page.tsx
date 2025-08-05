// app/portfolio/[username]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, notFound } from 'next/navigation';
import { 
  Globe, Mail, MapPin, Calendar, ExternalLink, 
  Github, Linkedin, Twitter, Instagram, 
  Eye, Heart, Share2, Download,
  Grid3x3, List, Layers
} from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Portfolio, GalleryPiece } from '@/types/portfolio.types';

interface PublicPortfolioData {
  // Include all Portfolio fields but make stats optional
  id: string;
  title: string;
  username: string;
  bio?: string;
  tagline?: string;
  kind: string;
  visibility: string;
  specializations?: string[];
  tags?: string[];
  
  // Extended fields for public view
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    location?: string;
    joinedDate?: string;
  };
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  stats?: {
    totalViews: number;
    totalLikes: number;
    totalPieces: number;
    totalProjects?: number;
  };
}

type ViewMode = 'grid' | 'masonry' | 'list';

export default function PublicPortfolioPage() {
  const params = useParams();
  const username = params.username as string;

  const [portfolio, setPortfolio] = useState<PublicPortfolioData | null>(null);
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [selectedPiece, setSelectedPiece] = useState<GalleryPiece | null>(null);
  const [likedPieces, setLikedPieces] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPortfolioData();
  }, [username]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch public portfolio data using the getByUsername method
      const portfolioResponse = await api.portfolio.getByUsername(username);
      
      if (!portfolioResponse) {
        throw new Error('Portfolio not found');
      }

      // Map the response to PublicPortfolioData structure
      const publicData: PublicPortfolioData = {
        id: portfolioResponse.id,
        title: portfolioResponse.title,
        username: portfolioResponse.username,
        bio: portfolioResponse.bio,
        tagline: portfolioResponse.tagline,
        kind: portfolioResponse.kind,
        visibility: portfolioResponse.visibility,
        specializations: portfolioResponse.specializations,
        tags: portfolioResponse.tags,
        // Map stats if they exist, otherwise use defaults
        stats: portfolioResponse.stats ? {
          totalViews: portfolioResponse.stats.totalViews || 0,
          totalLikes: 0, // This might need to come from gallery stats
          totalPieces: portfolioResponse.stats.totalPieces || 0,
        } : undefined,
        // These would typically come from a separate user query or be included in the response
        user: {
          name: portfolioResponse.title, // Using portfolio title as fallback
        }
      };

      setPortfolio(publicData);

      // Fetch gallery pieces if portfolio has gallery capability
      if (['creative', 'hybrid', 'professional'].includes(portfolioResponse.kind)) {
        const galleryResponse = await api.portfolio.getPublicGallery(portfolioResponse.id);
        setGalleryPieces(galleryResponse || []);
      }

      // Track view
      await api.portfolio.trackView(portfolioResponse.id);
    } catch (err: any) {
      console.error('Failed to fetch portfolio:', err);
      if (err.status === 404 || err.message?.includes('not found')) {
        setError('Portfolio not found');
      } else {
        setError('Failed to load portfolio');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLikePiece = async (pieceId: string) => {
    try {
      if (likedPieces.has(pieceId)) {
        await api.portfolio.unlikePiece(pieceId);
        setLikedPieces(prev => {
          const next = new Set(prev);
          next.delete(pieceId);
          return next;
        });
      } else {
        await api.portfolio.likePiece(pieceId);
        setLikedPieces(prev => new Set([...prev, pieceId]));
      }
    } catch (err) {
      console.error('Failed to like piece:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: portfolio?.title || 'Portfolio',
        text: portfolio?.tagline || 'Check out this portfolio',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading portfolio...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !portfolio) {
    return (
      <ErrorContainer>
        <ErrorIcon>🎨</ErrorIcon>
        <ErrorTitle>Portfolio Not Found</ErrorTitle>
        <ErrorMessage>
          The portfolio you're looking for doesn't exist or has been made private.
        </ErrorMessage>
      </ErrorContainer>
    );
  }

  return (
    <PageWrapper>
      {/* Hero Section */}
      <HeroSection>
        <HeroBackground />
        <HeroContent>
          <ProfileSection>
            {portfolio.user?.avatar ? (
              <Avatar src={portfolio.user.avatar} alt={portfolio.user.name} />
            ) : (
              <AvatarPlaceholder>
                {portfolio.user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarPlaceholder>
            )}
            <ProfileInfo>
              <ProfileName>{portfolio.user?.name || 'Anonymous'}</ProfileName>
              <ProfileTitle>{portfolio.title}</ProfileTitle>
              {portfolio.tagline && (
                <ProfileTagline>{portfolio.tagline}</ProfileTagline>
              )}
              
              {/* Meta Information */}
              <ProfileMeta>
                {portfolio.user?.location && (
                  <MetaItem>
                    <MapPin size={14} />
                    <span>{portfolio.user.location}</span>
                  </MetaItem>
                )}
                {portfolio.user?.joinedDate && (
                  <MetaItem>
                    <Calendar size={14} />
                    <span>Joined {new Date(portfolio.user.joinedDate).getFullYear()}</span>
                  </MetaItem>
                )}
                <MetaItem>
                  <Eye size={14} />
                  <span>{portfolio.stats?.totalViews || 0} views</span>
                </MetaItem>
              </ProfileMeta>

              {/* Social Links */}
              {portfolio.socialLinks && (
                <SocialLinks>
                  {portfolio.socialLinks.github && (
                    <SocialLink href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      <Github size={18} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks.linkedin && (
                    <SocialLink href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin size={18} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks.twitter && (
                    <SocialLink href={portfolio.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter size={18} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks.instagram && (
                    <SocialLink href={portfolio.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram size={18} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks.website && (
                    <SocialLink href={portfolio.socialLinks.website} target="_blank" rel="noopener noreferrer">
                      <Globe size={18} />
                    </SocialLink>
                  )}
                </SocialLinks>
              )}
            </ProfileInfo>
          </ProfileSection>

          {/* Action Buttons */}
          <ActionButtons>
            <ActionButton onClick={handleShare}>
              <Share2 size={16} />
              Share Portfolio
            </ActionButton>
            {portfolio.user?.email && (
              <ActionButton as="a" href={`mailto:${portfolio.user.email}`} $primary>
                <Mail size={16} />
                Get in Touch
              </ActionButton>
            )}
          </ActionButtons>
        </HeroContent>
      </HeroSection>

      {/* Bio Section */}
      {portfolio.bio && (
        <BioSection>
          <Container>
            <SectionTitle>About</SectionTitle>
            <BioText>{portfolio.bio}</BioText>
            
            {/* Specializations */}
            {portfolio.specializations && portfolio.specializations.length > 0 && (
              <SpecializationsWrapper>
                <SpecializationLabel>Specializations:</SpecializationLabel>
                <SpecializationTags>
                  {portfolio.specializations.map((spec, index) => (
                    <SpecializationTag key={index}>{spec}</SpecializationTag>
                  ))}
                </SpecializationTags>
              </SpecializationsWrapper>
            )}
          </Container>
        </BioSection>
      )}

      {/* Gallery Section */}
      {galleryPieces.length > 0 && (
        <GallerySection>
          <Container>
            <GalleryHeader>
              <SectionTitle>Gallery</SectionTitle>
              <ViewModeToggle>
                <ViewModeButton 
                  $active={viewMode === 'grid'} 
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 size={18} />
                </ViewModeButton>
                <ViewModeButton 
                  $active={viewMode === 'masonry'} 
                  onClick={() => setViewMode('masonry')}
                >
                  <Layers size={18} />
                </ViewModeButton>
                <ViewModeButton 
                  $active={viewMode === 'list'} 
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </ViewModeButton>
              </ViewModeToggle>
            </GalleryHeader>

            <GalleryGrid $viewMode={viewMode}>
              {galleryPieces.map((piece) => (
                <GalleryItem 
                  key={piece.id}
                  $viewMode={viewMode}
                  onClick={() => setSelectedPiece(piece)}
                >
                  <GalleryImageWrapper>
                    <GalleryImage src={piece.imageUrl} alt={piece.title} />
                    <GalleryOverlay>
                      <OverlayContent>
                        <PieceTitle>{piece.title}</PieceTitle>
                        {piece.medium && <PieceMedium>{piece.medium}</PieceMedium>}
                      </OverlayContent>
                      <OverlayActions>
                        <OverlayAction 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikePiece(piece.id);
                          }}
                          $liked={likedPieces.has(piece.id)}
                        >
                          <Heart size={18} fill={likedPieces.has(piece.id) ? 'currentColor' : 'none'} />
                          <span>{piece.likes || 0}</span>
                        </OverlayAction>
                        <OverlayAction>
                          <Eye size={18} />
                          <span>{piece.views || 0}</span>
                        </OverlayAction>
                      </OverlayActions>
                    </GalleryOverlay>
                  </GalleryImageWrapper>
                  
                  {viewMode === 'list' && (
                    <ListItemDetails>
                      <ListItemTitle>{piece.title}</ListItemTitle>
                      <ListItemDescription>{piece.description}</ListItemDescription>
                      <ListItemMeta>
                        {piece.category && <MetaTag>{piece.category}</MetaTag>}
                        {piece.year && <MetaTag>{piece.year}</MetaTag>}
                        {piece.price && <MetaTag>${piece.price}</MetaTag>}
                      </ListItemMeta>
                    </ListItemDetails>
                  )}
                </GalleryItem>
              ))}
            </GalleryGrid>
          </Container>
        </GallerySection>
      )}

      {/* Lightbox Modal */}
      {selectedPiece && (
        <LightboxOverlay onClick={() => setSelectedPiece(null)}>
          <LightboxContent onClick={(e) => e.stopPropagation()}>
            <LightboxImage src={selectedPiece.imageUrl} alt={selectedPiece.title} />
            <LightboxInfo>
              <LightboxTitle>{selectedPiece.title}</LightboxTitle>
              {selectedPiece.description && (
                <LightboxDescription>{selectedPiece.description}</LightboxDescription>
              )}
              <LightboxMeta>
                {selectedPiece.medium && <span>Medium: {selectedPiece.medium}</span>}
                {selectedPiece.year && <span>Year: {selectedPiece.year}</span>}
                {selectedPiece.price && <span>Price: ${selectedPiece.price}</span>}
              </LightboxMeta>
              <LightboxActions>
                <ActionButton 
                  onClick={() => handleLikePiece(selectedPiece.id)}
                  $liked={likedPieces.has(selectedPiece.id)}
                >
                  <Heart size={16} fill={likedPieces.has(selectedPiece.id) ? 'currentColor' : 'none'} />
                  {likedPieces.has(selectedPiece.id) ? 'Liked' : 'Like'}
                </ActionButton>
                <ActionButton as="a" href={selectedPiece.imageUrl} download target="_blank">
                  <Download size={16} />
                  Download
                </ActionButton>
              </LightboxActions>
            </LightboxInfo>
            <CloseButton onClick={() => setSelectedPiece(null)}>×</CloseButton>
          </LightboxContent>
        </LightboxOverlay>
      )}

      {/* Footer */}
      <Footer>
        <Container>
          <FooterContent>
            <FooterText>© {new Date().getFullYear()} {portfolio.user?.name || 'Portfolio'}. All rights reserved.</FooterText>
            <FooterLinks>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
            </FooterLinks>
          </FooterContent>
        </Container>
      </Footer>
    </PageWrapper>
  );
}

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid #e5e7eb;
  border-top-color: #2c2c2c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
  max-width: 400px;
`;

const HeroSection = styled.section`
  position: relative;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  overflow: hidden;
`;

const HeroBackground = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.05;
`;

const HeroContent = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const AvatarPlaceholder = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  font-family: 'Cormorant Garamond', serif;
`;

const ProfileTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.75rem 0;
  font-family: 'Work Sans', sans-serif;
`;

const ProfileTagline = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
`;

const ProfileMeta = styled.div`
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
  color: #6b7280;
  font-size: 0.875rem;
  
  svg {
    color: #9ca3af;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #4b5563;
  transition: all 0.2s;
  
  &:hover {
    background: #2c2c2c;
    color: white;
    transform: translateY(-2px);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean; $liked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.$primary ? '#2c2c2c' : props.$liked ? '#ef4444' : 'white'};
  color: ${props => props.$primary || props.$liked ? 'white' : '#374151'};
  border: 1px solid ${props => props.$primary || props.$liked ? 'transparent' : '#d1d5db'};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const BioSection = styled.section`
  padding: 4rem 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem 0;
  font-family: 'Work Sans', sans-serif;
`;

const BioText = styled.p`
  font-size: 1.125rem;
  color: #4b5563;
  line-height: 1.8;
  margin-bottom: 2rem;
  white-space: pre-wrap;
`;

const SpecializationsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SpecializationLabel = styled.span`
  font-weight: 600;
  color: #374151;
`;

const SpecializationTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const SpecializationTag = styled.span`
  padding: 0.375rem 0.75rem;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 6px;
  font-size: 0.875rem;
`;

const GallerySection = styled.section`
  padding: 4rem 0;
  min-height: 400px;
`;

const GalleryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ViewModeToggle = styled.div`
  display: flex;
  gap: 0.25rem;
  background: white;
  padding: 0.25rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const ViewModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: ${props => props.$active ? '#2c2c2c' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#1a1a1a' : '#f3f4f6'};
  }
`;

const GalleryGrid = styled.div<{ $viewMode: ViewMode }>`
  display: grid;
  gap: 1.5rem;
  
  ${props => {
    switch (props.$viewMode) {
      case 'grid':
        return `
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        `;
      case 'masonry':
        return `
          columns: 300px;
          column-gap: 1.5rem;
          
          > * {
            break-inside: avoid;
            margin-bottom: 1.5rem;
          }
        `;
      case 'list':
        return `
          grid-template-columns: 1fr;
        `;
    }
  }}
`;

const GalleryItem = styled.div<{ $viewMode: ViewMode }>`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
  
  ${props => props.$viewMode === 'list' && `
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
  `}
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

const GalleryImageWrapper = styled.div`
  position: relative;
  overflow: hidden;
  
  ${GalleryItem}[data-view-mode="list"] & {
    width: 200px;
    height: 150px;
    flex-shrink: 0;
  }
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  
  ${GalleryItem}:hover & {
    transform: scale(1.05);
  }
`;

const GalleryOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
  
  ${GalleryItem}:hover & {
    opacity: 1;
  }
`;

const OverlayContent = styled.div`
  color: white;
  margin-bottom: 0.5rem;
`;

const PieceTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
`;

const PieceMedium = styled.p`
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
`;

const OverlayActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const OverlayAction = styled.button<{ $liked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: ${props => props.$liked ? '#ef4444' : 'white'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ListItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ListItemTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const ListItemDescription = styled.p`
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.6;
`;

const ListItemMeta = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const MetaTag = styled.span`
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 4px;
  font-size: 0.875rem;
`;

const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: fadeIn 0.3s;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const LightboxContent = styled.div`
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  max-height: 90vh;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LightboxImage = styled.img`
  flex: 1;
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 12px;
`;

const LightboxInfo = styled.div`
  width: 300px;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const LightboxTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
`;

const LightboxDescription = styled.p`
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
`;

const LightboxMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  
  span {
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const LightboxActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const Footer = styled.footer`
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 2rem 0;
  margin-top: 4rem;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FooterText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

const FooterLink = styled.a`
  color: #6b7280;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: #111827;
  }
`;