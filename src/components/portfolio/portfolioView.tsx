// src/components/portfolio/PortfolioView.tsx
'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  Globe, Lock, Link as LinkIcon, Share2, Star, MessageSquare, 
  MapPin, Calendar, Award, ExternalLink, Instagram, Twitter, 
  Loader2, AlertCircle 
} from 'lucide-react';
import { Gallery } from '@/components/gallery';
import { usePortfolio, usePortfolioReviews } from '@/hooks/usePortfolioApi';
import { useAuth } from '@/providers/authProvider';
import { Portfolio, PortfolioReview } from '@/types/portfolio.types';
import { VISIBILITY_CONFIG } from '@/components/gallery/utils';

// ==================== Component Props ====================
interface PortfolioViewProps {
  portfolioId?: string;
  userId?: string;
  username?: string;
  shareToken?: string;
}

// ==================== Main Component ====================
export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolioId,
  userId,
  username,
  shareToken
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showReviews, setShowReviews] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Fetch portfolio data based on available identifiers
  const { 
    data: portfolio, 
    isLoading, 
    error 
  } = usePortfolio(
    portfolioId || userId || username || shareToken || '',
    {
      // Determine fetch method based on available props
      queryKey: portfolioId 
        ? ['portfolio', portfolioId]
        : userId 
        ? ['portfolio', 'user', userId]
        : username
        ? ['portfolio', 'username', username]
        : shareToken
        ? ['portfolio', 'share', shareToken]
        : [],
    }
  );

  const { 
    data: reviewsData,
    isLoading: reviewsLoading 
  } = usePortfolioReviews(
    portfolio?.id || '', 
    1, // page
    10, // limit
    {
        enabled: !!portfolio?.id && showReviews && portfolio.settings.allowReviews,
        queryKey: []
    }
  );

  // Check if user owns this portfolio
  const isOwner = isAuthenticated && user?.id === portfolio?.userId;

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
        setShareModalOpen(true);
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const handleReviewSubmit = async (review: Partial<PortfolioReview>) => {
    // Implementation would use the addReview API
    console.log('Submit review:', review);
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
          The portfolio you're looking for doesn't exist or you don't have permission to view it.
        </ErrorText>
        <BackButton onClick={() => router.push('/portfolio/discover')}>
          Browse Portfolios
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
          <ProfileImage src={portfolio.profileImage || '/default-avatar.png'} alt={portfolio.title} />
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
          {portfolio.specializations.length > 0 && (
            <Specializations>
              {portfolio.specializations.map((spec, idx) => (
                <Tag key={idx}>{spec}</Tag>
              ))}
            </Specializations>
          )}
        </BioSection>
      )}

      {/* Stats Bar */}
      {portfolio.settings.showStats && (
        <StatsBar>
          <StatItem>
            <StatValue>{portfolio.stats.totalPieces}</StatValue>
            <StatLabel>Artworks</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{portfolio.stats.totalViews}</StatValue>
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
      {portfolio.socialLinks && Object.keys(portfolio.socialLinks).length > 0 && (
        <SocialSection>
          {portfolio.socialLinks.website && (
            <SocialLink href={portfolio.socialLinks.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={20} />
              Website
            </SocialLink>
          )}
          {portfolio.socialLinks.instagram && (
            <SocialLink href={`https://instagram.com/${portfolio.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer">
              <Instagram size={20} />
              Instagram
            </SocialLink>
          )}
          {portfolio.socialLinks.twitter && (
            <SocialLink href={`https://twitter.com/${portfolio.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">
              <Twitter size={20} />
              Twitter
            </SocialLink>
          )}
        </SocialSection>
      )}

      {/* Gallery Section */}
      <GallerySection>
        <SectionHeader>
          <SectionTitle>Gallery</SectionTitle>
          {portfolio.visibility !== 'public' && (
            <VisibilityBadge $visibility={portfolio.visibility}>
              {portfolio.visibility === 'private' ? <Lock size={16} /> : <LinkIcon size={16} />}
              {VISIBILITY_CONFIG[portfolio.visibility].label} Portfolio
            </VisibilityBadge>
          )}
        </SectionHeader>
        
        <Gallery
          mode="portfolio"
          portfolioUserId={portfolio.userId}
          initialFilters={{
            visibility: 'public' // Only show public pieces in portfolio view
          }}
          viewConfig={{
            layout: portfolio.settings.defaultGalleryView || 'masonry',
            itemsPerPage: portfolio.settings.piecesPerPage || 20,
            showPrivateIndicator: false,
            enableSelection: false,
            enableQuickEdit: false
          }}
        />
      </GallerySection>

      {/* Reviews Section */}
      {portfolio.settings.allowReviews && (
        <ReviewsSection>
          <SectionHeader>
            <SectionTitle>
              Reviews ({portfolio.stats.totalReviews})
            </SectionTitle>
            {!isOwner && (
              <ReviewButton onClick={() => setShowReviews(true)}>
                <MessageSquare size={18} />
                Write Review
              </ReviewButton>
            )}
          </SectionHeader>
          
          {showReviews && reviewsData && (
            <ReviewsList>
              {reviewsData.reviews.map(review => (
                <ReviewCard key={review.id}>
                  <ReviewHeader>
                    <ReviewerInfo>
                      <ReviewerName>{review.reviewerName}</ReviewerName>
                      <ReviewRating>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            fill={i < review.rating ? '#fbbf24' : 'none'}
                            color={i < review.rating ? '#fbbf24' : '#d1d5db'}
                          />
                        ))}
                      </ReviewRating>
                    </ReviewerInfo>
                    <ReviewDate>
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                    </ReviewDate>
                  </ReviewHeader>
                  {review.title && <ReviewTitle>{review.title}</ReviewTitle>}
                  <ReviewComment>{review.comment}</ReviewComment>
                  {review.artistResponse && (
                    <ArtistResponse>
                      <ResponseLabel>Artist Response:</ResponseLabel>
                      <ResponseText>{review.artistResponse.comment}</ResponseText>
                    </ArtistResponse>
                  )}
                </ReviewCard>
              ))}
            </ReviewsList>
          )}
        </ReviewsSection>
      )}
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
  background: ${props => props.$bgImage ? `url(${props.$bgImage})` : '#e5e7eb'};
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
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 12px;
  border: 4px solid white;
  background: white;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  flex: 1;
  color: white;
`;

const ProfileName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
`;

const ProfileTagline = styled.p`
  font-size: 1.25rem;
  margin: 0 0 1rem;
  opacity: 0.9;
`;

const ProfileMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
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
  margin: 0 0 1rem;
`;

const BioText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0 0 1.5rem;
  white-space: pre-wrap;
`;

const Specializations = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 999px;
  font-size: 0.875rem;
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

const SocialSection = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.875rem;
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
  padding: 0 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

const ReviewsSection = styled.section`
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
`;

const ReviewButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ReviewCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ReviewerInfo = styled.div``;

const ReviewerName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 0.125rem;
`;

const ReviewDate = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ReviewTitle = styled.h5`
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.5rem;
`;

const ReviewComment = styled.p`
  font-size: 0.875rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
`;

const ArtistResponse = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
`;

const ResponseLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const ResponseText = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
`;

export default PortfolioView;