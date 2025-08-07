// src/components/portfolio/PortfolioView.tsx - Fixed without Gallery import
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  Globe, Lock, Link as LinkIcon, Share2, Star, MessageSquare, 
  MapPin, Calendar, Award, ExternalLink, Instagram, Twitter, 
  Loader2, AlertCircle, Eye, Image as ImageIcon 
} from 'lucide-react';
import { usePortfolioByUsername } from '@/hooks/usePortfolioQueries';
import { useAuth } from '@/providers/authProvider';
import { usePortfolioManager } from '@/services/portfolioService';
import { Portfolio } from '@/types/portfolio.types';

// ==================== Component Props ====================
interface PortfolioViewProps {
  username: string;
}

// ==================== Main Component ====================
export const PortfolioView: React.FC<PortfolioViewProps> = ({ username }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Fetch portfolio data by username
  const { 
    data: portfolio, 
    isLoading, 
    error 
  } = usePortfolioByUsername(username);

  // Get gallery pieces for this portfolio
  const {
    galleryPieces,
    loading: galleryLoading
  } = usePortfolioManager();

  // Check if user owns this portfolio
  const isOwner = isAuthenticated && user?.username === username;

  // Filter gallery pieces to show only public ones (unless owner)
  const visiblePieces = galleryPieces?.filter(piece => 
    isOwner || piece.visibility === 'public'
  ) || [];

  // ==================== Event Handlers ====================
  const handleShare = async () => {
    if (navigator.share && portfolio) {
      try {
        await navigator.share({
          title: portfolio.title,
          text: portfolio.tagline || `Check out ${portfolio.username}'s portfolio`,
          url: window.location.href
        });
      } catch (err) {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Portfolio link copied to clipboard!');
        } catch (clipErr) {
          console.error('Failed to copy to clipboard:', clipErr);
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Portfolio link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  // ==================== Loading & Error States ====================
  if (isLoading) {
    return (
      <LoadingContainer>
        <Loader2 className="animate-spin" size={48} />
        <LoadingText>Loading portfolio...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !portfolio) {
    return (
      <ErrorContainer>
        <AlertCircle size={48} color="#ef4444" />
        <ErrorTitle>Portfolio not found</ErrorTitle>
        <ErrorText>
          The portfolio you're looking for doesn't exist or may have been made private.
        </ErrorText>
        <BackButton onClick={() => router.push('/portfolio/discover')}>
          Browse Portfolios
        </BackButton>
      </ErrorContainer>
    );
  }

  // Check if portfolio is private
  if (portfolio.visibility === 'private' && !isOwner) {
    return (
      <ErrorContainer>
        <Lock size={48} color="#6b7280" />
        <ErrorTitle>Private Portfolio</ErrorTitle>
        <ErrorText>
          This portfolio is private and can only be viewed by the owner.
        </ErrorText>
        <BackButton onClick={() => router.push('/portfolio/discover')}>
          Browse Public Portfolios
        </BackButton>
      </ErrorContainer>
    );
  }

  // ==================== Main Render ====================
  return (
    <Container>
      {/* Cover Image Section */}
      <CoverSection $bgImage={portfolio.coverImage}>
        <CoverOverlay />
        <ProfileSection>
          <ProfileImage 
            src={portfolio.profileImage || '/default-avatar.png'} 
            alt={portfolio.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
          <ProfileInfo>
            <ProfileName>{portfolio.title}</ProfileName>
            {portfolio.tagline && <ProfileTagline>{portfolio.tagline}</ProfileTagline>}
            <ProfileMeta>
              {portfolio.location && (
                <MetaItem>
                  <MapPin size={16} />
                  {portfolio.location}
                </MetaItem>
              )}
              {portfolio.yearsOfExperience && (
                <MetaItem>
                  <Award size={16} />
                  {portfolio.yearsOfExperience} years experience
                </MetaItem>
              )}
              <MetaItem>
                <Calendar size={16} />
                Joined {portfolio.createdAt ? new Date(portfolio.createdAt).toLocaleDateString() : 'Recently'}
              </MetaItem>
            </ProfileMeta>
          </ProfileInfo>
          <ProfileActions>
            {isOwner ? (
              <EditButton onClick={() => router.push('/dashboard/portfolio/edit')}>
                Edit Portfolio
              </EditButton>
            ) : (
              <>
                {portfolio.showContactInfo && portfolio.contactEmail && (
                  <ContactButton href={`mailto:${portfolio.contactEmail}`}>
                    Contact
                  </ContactButton>
                )}
                <ShareButton onClick={handleShare}>
                  <Share2 size={18} />
                  Share
                </ShareButton>
              </>
            )}
          </ProfileActions>
        </ProfileSection>
      </CoverSection>

      {/* Bio Section */}
      {portfolio.bio && (
        <BioSection>
          <SectionTitle>About</SectionTitle>
          <BioText>{portfolio.bio}</BioText>
          {portfolio.specializations && portfolio.specializations.length > 0 && (
            <Specializations>
              <SubTitle>Specializations</SubTitle>
              <TagGrid>
                {portfolio.specializations.map((spec, idx) => (
                  <Tag key={idx}>{spec}</Tag>
                ))}
              </TagGrid>
            </Specializations>
          )}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <Tags>
              <SubTitle>Tags</SubTitle>
              <TagGrid>
                {portfolio.tags.map((tag, idx) => (
                  <TagSecondary key={idx}>#{tag}</TagSecondary>
                ))}
              </TagGrid>
            </Tags>
          )}
        </BioSection>
      )}

      {/* Stats Bar */}
      {portfolio.settings?.showStats && portfolio.stats && (
        <StatsBar>
          <StatItem>
            <StatValue>{portfolio.stats.totalPieces || 0}</StatValue>
            <StatLabel>Artworks</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{portfolio.stats.totalViews || 0}</StatValue>
            <StatLabel>Views</StatLabel>
          </StatItem>
          {portfolio.stats.averageRating && (
            <StatItem>
              <StatValue>
                <Star size={16} fill="currentColor" />
                {portfolio.stats.averageRating.toFixed(1)}
              </StatValue>
              <StatLabel>Rating</StatLabel>
            </StatItem>
          )}
          {portfolio.stats.responseRate && (
            <StatItem>
              <StatValue>{portfolio.stats.responseRate}%</StatValue>
              <StatLabel>Response Rate</StatLabel>
            </StatItem>
          )}
        </StatsBar>
      )}

      {/* Social Links */}
      {portfolio.socialLinks && Object.values(portfolio.socialLinks).some(link => link) && (
        <SocialSection>
          <SectionTitle>Connect</SectionTitle>
          <SocialLinksGrid>
            {portfolio.socialLinks.website && (
              <SocialLink href={portfolio.socialLinks.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={20} />
                Website
              </SocialLink>
            )}
            {portfolio.socialLinks.instagram && (
              <SocialLink 
                href={portfolio.socialLinks.instagram.startsWith('http') 
                  ? portfolio.socialLinks.instagram 
                  : `https://instagram.com/${portfolio.socialLinks.instagram}`
                } 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
                Instagram
              </SocialLink>
            )}
            {portfolio.socialLinks.twitter && (
              <SocialLink 
                href={portfolio.socialLinks.twitter.startsWith('http') 
                  ? portfolio.socialLinks.twitter 
                  : `https://twitter.com/${portfolio.socialLinks.twitter}`
                } 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Twitter size={20} />
                Twitter
              </SocialLink>
            )}
            {portfolio.socialLinks.linkedin && (
              <SocialLink href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={20} />
                LinkedIn
              </SocialLink>
            )}
            {portfolio.socialLinks.github && (
              <SocialLink href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={20} />
                GitHub
              </SocialLink>
            )}
          </SocialLinksGrid>
        </SocialSection>
      )}

      {/* Gallery Section - REPLACED with Simple Gallery */}
      <GallerySection>
        <SectionHeader>
          <SectionTitle>
            {portfolio.kind === 'creative' ? 'Gallery' : 
             portfolio.kind === 'professional' ? 'Projects' : 'Work'}
          </SectionTitle>
          {portfolio.visibility !== 'public' && isOwner && (
            <VisibilityBadge $visibility={portfolio.visibility}>
              {portfolio.visibility === 'private' ? <Lock size={16} /> : <LinkIcon size={16} />}
              {portfolio.visibility === 'private' ? 'Private' : 'Unlisted'} Portfolio
            </VisibilityBadge>
          )}
        </SectionHeader>
        
        {/* Simple Gallery Implementation */}
        {galleryLoading ? (
          <GalleryLoading>
            <Loader2 className="animate-spin" size={32} />
            <p>Loading gallery...</p>
          </GalleryLoading>
        ) : visiblePieces.length === 0 ? (
          <EmptyGallery>
            <EmptyIcon>
              <ImageIcon size={48} />
            </EmptyIcon>
            <EmptyTitle>No artworks to display</EmptyTitle>
            <EmptyDescription>
              {isOwner 
                ? "You haven't uploaded any public artworks yet." 
                : "This portfolio doesn't have any public artworks to display."}
            </EmptyDescription>
            {isOwner && (
              <ManageButton onClick={() => router.push('/dashboard/gallery')}>
                <Eye size={16} />
                Manage Gallery
              </ManageButton>
            )}
          </EmptyGallery>
        ) : (
          <SimpleGalleryGrid>
            {visiblePieces.map((piece) => (
              <GalleryItem key={piece.id}>
                <GalleryItemImage>
                  <img 
                    src={piece.thumbnailUrl || piece.imageUrl} 
                    alt={piece.title} 
                    loading="lazy"
                  />
                </GalleryItemImage>
                <GalleryItemInfo>
                  <GalleryItemTitle>{piece.title}</GalleryItemTitle>
                  {piece.year && <GalleryItemYear>{piece.year}</GalleryItemYear>}
                  {piece.medium && <GalleryItemMedium>{piece.medium}</GalleryItemMedium>}
                </GalleryItemInfo>
              </GalleryItem>
            ))}
          </SimpleGalleryGrid>
        )}

        {/* Show manage link for owners */}
        {isOwner && visiblePieces.length > 0 && (
          <GalleryManageLink>
            <ManageButton onClick={() => router.push('/dashboard/gallery')}>
              <Eye size={16} />
              Manage Gallery ({visiblePieces.length} artworks)
            </ManageButton>
          </GalleryManageLink>
        )}
      </GallerySection>
    </Container>
  );
};

// ==================== Styled Components ====================
const Container = styled.div`
  min-height: 100vh;
  background: #f8f8f8;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
  color: #666;
`;

const ErrorContainer = styled(LoadingContainer)`
  text-align: center;
  padding: 2rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ErrorText = styled.p`
  font-size: 1rem;
  color: #6b7280;
  max-width: 500px;
  margin: 0;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1a1a1a;
  }
`;

const CoverSection = styled.section<{ $bgImage?: string }>`
  position: relative;
  height: 400px;
  background: ${props => props.$bgImage ? `url(${props.$bgImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
`;

const CoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
`;

const ProfileSection = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  height: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 12px;
  border: 4px solid white;
  background: white;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  color: white;
`;

const ProfileName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProfileTagline = styled.p`
  font-size: 1.25rem;
  margin: 0 0 1rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ProfileMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 1rem;
  align-self: flex-start;

  @media (max-width: 768px) {
    justify-content: center;
    align-self: center;
  }
`;

const EditButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #2c2c2c;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const ContactButton = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  backdrop-filter: blur(10px);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const ShareButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const BioSection = styled.section`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem;
`;

const SubTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.75rem;
`;

const BioText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0 0 2rem;
  white-space: pre-wrap;
`;

const Specializations = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Tags = styled.div``;

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  padding: 0.375rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const TagSecondary = styled.span`
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const StatsBar = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const StatItem = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const SocialSection = styled.section`
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SocialLinksGrid = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const GallerySection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const VisibilityBadge = styled.div<{ $visibility: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.$visibility === 'private' ? '#f3f4f6' : '#dbeafe'};
  color: ${props => props.$visibility === 'private' ? '#6b7280' : '#3b82f6'};
  border-radius: 999px;
  font-size: 0.875rem;
`;

// Simple Gallery Styles
const GalleryLoading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: #6b7280;
`;

const EmptyGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const EmptyIcon = styled.div`
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  max-width: 400px;
  line-height: 1.5;
`;

const ManageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
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

const SimpleGalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const GalleryItem = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const GalleryItemImage = styled.div`
  aspect-ratio: 1;
  overflow: hidden;
  background: #f3f4f6;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const GalleryItemInfo = styled.div`
  padding: 1rem;
`;

const GalleryItemTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #111827;
`;

const GalleryItemYear = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
`;

const GalleryItemMedium = styled.p`
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.25rem 0 0 0;
`;

const GalleryManageLink = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

export default PortfolioView;