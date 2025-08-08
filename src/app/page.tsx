// src/app/page.tsx - Fixed Type Issues
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import { 
  Search, Grid3X3, User, Play, Target, BookOpen, Trophy,
  Eye, Star, Image as ImageIcon, ArrowRight, Loader2, Zap
} from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import {
  PageContainer, ContentWrapper, Section, Heading1, Heading2, BodyText,
  BaseButton, Card, CardContent, Grid
} from '@/styles/styled-components';
import styled from 'styled-components';
import { theme } from '@/styles/theme';

// Import types from your types file
import { Portfolio, getPortfolioId, normalizePortfolio } from '@/types/portfolio.types';

interface Stats {
  users: number;
  portfolios: number;
  pieces: number;
  active: number;
}

// Simple utility functions
const getInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return '??';
  }
  
  const parts = name.trim().split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const normalizeImageUrl = (url: string | undefined): string | null => {
  if (!url || url.trim() === '') return null;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  if (url.startsWith('/')) {
    return `${backendUrl}${url}`;
  }
  
  return `${backendUrl}/${url}`;
};

// Simple image component
const PortfolioImage: React.FC<{
  portfolio: Portfolio;
  onClick: () => void;
}> = ({ portfolio, onClick }) => {
  const [imageError, setImageError] = useState(false);
  
  const getImageUrl = () => {
    const candidates = [
      portfolio.coverImage,
      portfolio.profileImage
    ].filter(Boolean);
    
    for (const url of candidates) {
      const normalized = normalizeImageUrl(url);
      if (normalized) return normalized;
    }
    
    return null;
  };

  const imageUrl = getImageUrl();
  const displayName = portfolio.title || portfolio.name || portfolio.username;

  return (
    <CoverImage 
      $coverImage={imageUrl && !imageError ? imageUrl : undefined} 
      $kind={portfolio.kind}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View ${displayName}'s portfolio`}
    >
      <KindBadge $kind={portfolio.kind}>{portfolio.kind}</KindBadge>
      
      {imageUrl && !imageError ? (
        <OptimizedImage
          src={imageUrl}
          alt={`${displayName}'s portfolio cover`}
          fill
          style={{ objectFit: 'cover' }}
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      ) : (
        <PlaceholderContent>
          <User aria-hidden="true" />
          <span>{displayName}</span>
        </PlaceholderContent>
      )}
    </CoverImage>
  );
};

// Simple avatar component
const PortfolioAvatar: React.FC<{
  portfolio: Portfolio;
}> = ({ portfolio }) => {
  const [imageError, setImageError] = useState(false);
  
  const profileImageUrl = portfolio.profileImage;
  const normalizedUrl = normalizeImageUrl(profileImageUrl);
  const displayName = portfolio.title || portfolio.name || portfolio.username;

  if (normalizedUrl && !imageError) {
    return (
      <Avatar>
        <OptimizedImage
          src={normalizedUrl}
          alt={`${displayName}'s profile`}
          width={48}
          height={48}
          style={{ objectFit: 'cover', borderRadius: '50%' }}
          onError={() => setImageError(true)}
        />
      </Avatar>
    );
  }

  return (
    <Avatar>
      {getInitials(displayName)}
    </Avatar>
  );
};

// Mock data with proper structure matching your types
const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'alice_creates',
    title: 'Alice Johnson Creative',
    bio: 'Digital artist and UI designer creating beautiful, functional experiences.',
    kind: 'creative',
    visibility: 'public',
    status: 'active',
    specializations: ['Digital Art', 'UI Design', 'Branding'],
    tags: ['digital', 'design', 'branding'],
    showContactInfo: true,
    settings: {
      allowReviews: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'grid',
      piecesPerPage: 12,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: { 
      totalViews: 2840, 
      uniqueVisitors: 1200,
      totalPieces: 24, 
      totalReviews: 18, 
      averageRating: 4.8,
      viewsThisWeek: 150,
      viewsThisMonth: 650,
      shareCount: 45,
      savedCount: 12
    },
    coverImage: 'https://picsum.photos/800/400?random=1',
    profileImage: 'https://picsum.photos/200/200?random=1',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    userId: 'user2',
    username: 'math_master_bob',
    title: 'Bob Chen Mathematics',
    bio: 'Mathematics educator passionate about making complex concepts accessible.',
    kind: 'educational',
    visibility: 'public',
    status: 'active',
    specializations: ['Calculus', 'Statistics', 'SAT Prep'],
    tags: ['math', 'education', 'tutoring'],
    showContactInfo: true,
    settings: {
      allowReviews: true,
      requireReviewApproval: true,
      allowAnonymousReviews: false,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'list',
      piecesPerPage: 10,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: { 
      totalViews: 1956, 
      uniqueVisitors: 890,
      totalPieces: 45, 
      totalReviews: 32, 
      averageRating: 4.9,
      viewsThisWeek: 89,
      viewsThisMonth: 420,
      shareCount: 23,
      savedCount: 8
    },
    coverImage: 'https://picsum.photos/800/400?random=2',
    profileImage: 'https://picsum.photos/200/200?random=2',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    userId: 'user3',
    username: 'carol_codes',
    title: 'Carol Martinez Tech',
    bio: 'Full-stack developer and creative technologist.',
    kind: 'hybrid',
    visibility: 'public',
    status: 'active',
    specializations: ['React', 'Node.js', 'Creative Coding'],
    tags: ['development', 'creative', 'fullstack'],
    showContactInfo: true,
    settings: {
      allowReviews: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'masonry',
      piecesPerPage: 15,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: { 
      totalViews: 3210, 
      uniqueVisitors: 1450,
      totalPieces: 38, 
      totalReviews: 27, 
      averageRating: 4.7,
      viewsThisWeek: 210,
      viewsThisMonth: 890,
      shareCount: 67,
      savedCount: 19
    },
    coverImage: 'https://picsum.photos/800/400?random=3',
    profileImage: 'https://picsum.photos/200/200?random=3',
    createdAt: new Date('2024-01-05')
  }
];

// Stats data - simple static object
const STATS_DATA = {
  users: 1247,
  portfolios: 120,
  pieces: 900,
  active: 45
};

// Main component - simplified
export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolios, setPortfolios] = useState<Portfolio[]>(MOCK_PORTFOLIOS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiClient = getApiClient();
        const portfolioData = await apiClient.portfolio?.discover?.({}, 1, 6);
        
        if (Array.isArray(portfolioData)) {
          // Normalize portfolio data to ensure consistent ID handling
          const normalizedPortfolios = portfolioData.map(normalizePortfolio);
          setPortfolios(normalizedPortfolios);
        } else if (portfolioData?.portfolios && Array.isArray(portfolioData.portfolios)) {
          const normalizedPortfolios = portfolioData.portfolios.map(normalizePortfolio);
          setPortfolios(normalizedPortfolios);
        } else {
          setPortfolios(MOCK_PORTFOLIOS);
        }
      } catch (error) {
        console.error('Failed to fetch portfolios:', error);
        setError('Failed to load portfolios');
        setPortfolios(MOCK_PORTFOLIOS);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery) {
      router.push(`/explore?q=${encodeURIComponent(trimmedQuery)}`);
    }
  }, [searchQuery, router]);

  const handlePortfolioClick = useCallback((username: string) => {
    router.push(`/portfolio/${username}`);
  }, [router]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Loader2 className="animate-spin" size={48} aria-hidden="true" />
          <BodyText>Loading portfolios...</BodyText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorContainer role="alert">
          <Heading2>Unable to load portfolios</Heading2>
          <BodyText>{error}</BodyText>
          <BaseButton onClick={handleRetry} $variant="primary">
            Try Again
          </BaseButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeroSection>
        <ContentWrapper>
          <HeroContent>
            <Heading1>Discover Creative Excellence</Heading1>
            <BodyText as="p" style={{ 
              fontSize: theme.typography.sizes.xl,
              marginBottom: theme.spacing['2xl'],
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Connect with talented creators, develop your skills, and showcase your work in our thriving professional community
            </BodyText>
            
            <SearchContainer>
              <SearchForm onSubmit={handleSearch} role="search">
                <SearchIcon aria-hidden="true" />
                <SearchInput
                  type="search"
                  placeholder="Search portfolios, skills, or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search portfolios, skills, or creators"
                  autoComplete="off"
                  spellCheck="false"
                />
              </SearchForm>
            </SearchContainer>

            <CTAButtons>
              {user ? (
                <BaseButton as={Link} href="/dashboard" $variant="primary">
                  <User size={16} aria-hidden="true" />
                  Dashboard
                </BaseButton>
              ) : (
                <BaseButton as={Link} href="/login" $variant="primary">
                  <Play size={16} aria-hidden="true" />
                  Get Started
                </BaseButton>
              )}
              <BaseButton as={Link} href="/thrive" $variant="secondary">
                <Zap size={16} aria-hidden="true" />
                Skills Arena
              </BaseButton>
            </CTAButtons>
          </HeroContent>
        </ContentWrapper>
      </HeroSection>

      <ContentWrapper>
        <Section>
          {/* Stats Grid */}
          <StatsGrid>
            <StatCard>
              <CardContent>
                <StatNumber>{STATS_DATA.users.toLocaleString()}</StatNumber>
                <StatLabel>Active Creators</StatLabel>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent>
                <StatNumber>{STATS_DATA.portfolios.toLocaleString()}</StatNumber>
                <StatLabel>Portfolios</StatLabel>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent>
                <StatNumber>{STATS_DATA.pieces.toLocaleString()}</StatNumber>
                <StatLabel>Creative Works</StatLabel>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent>
                <StatNumber>{STATS_DATA.active.toLocaleString()}</StatNumber>
                <StatLabel>Online Now</StatLabel>
              </CardContent>
            </StatCard>
          </StatsGrid>

          {/* Featured Creators Section */}
          <SectionHeader>
            <SectionTitle>
              <Grid3X3 size={24} aria-hidden="true" />
              Featured Creators
            </SectionTitle>
            <ViewAllLink href="/explore">
              View all <ArrowRight size={16} aria-hidden="true" />
            </ViewAllLink>
          </SectionHeader>

          {portfolios.length > 0 ? (
            <Grid $minWidth="320px">
              {portfolios.map((portfolio) => {
                // Use safe ID extraction
                const portfolioId = getPortfolioId(portfolio);
                if (!portfolioId) return null;
                
                return (
                  <PortfolioCard 
                    key={`portfolio-${portfolioId}-${portfolio.username}`}
                    $kind={portfolio.kind}
                  >
                    <PortfolioImage 
                      portfolio={portfolio}
                      onClick={() => handlePortfolioClick(portfolio.username)}
                    />
                    
                    <CardContent>
                      <UserInfo>
                        <PortfolioAvatar portfolio={portfolio} />
                        <UserDetails>
                          <Username>@{portfolio.username}</Username>
                          <UserTitle>{portfolio.title || portfolio.name || 'Creative Professional'}</UserTitle>
                        </UserDetails>
                      </UserInfo>
                      
                      {portfolio.bio && portfolio.bio.trim() && (
                        <Bio>{portfolio.bio}</Bio>
                      )}
                      
                      <PortfolioStats>
                        <StatItem>
                          <Eye size={14} aria-hidden="true" />
                          <StatValue>{(portfolio.stats?.totalViews || 0).toLocaleString()}</StatValue>
                          <span className="sr-only">views</span>
                        </StatItem>
                        <StatItem>
                          <ImageIcon size={14} aria-hidden="true" />
                          <StatValue>{portfolio.stats?.totalPieces || 0}</StatValue>
                          <span className="sr-only">pieces</span>
                        </StatItem>
                        <StatItem>
                          <Star size={14} aria-hidden="true" />
                          <StatValue>{portfolio.stats?.averageRating?.toFixed(1) || 'N/A'}</StatValue>
                          <span className="sr-only">rating</span>
                        </StatItem>
                      </PortfolioStats>
                    </CardContent>
                  </PortfolioCard>
                );
              })}
            </Grid>
          ) : (
            <EmptyState role="status">
              <BodyText>No portfolios available at the moment. Check back soon!</BodyText>
            </EmptyState>
          )}
        </Section>

        {/* Quick Actions Section */}
        <QuickActions>
          <ContentWrapper>
            <SectionTitle>Quick Actions</SectionTitle>
            <ActionGrid>
              <ActionCard href="/thrive">
                <ActionIcon aria-hidden="true">
                  <Target size={24} />
                </ActionIcon>
                <ActionTitle>Skills Arena</ActionTitle>
                <ActionDescription>Challenge yourself with interactive professional development games</ActionDescription>
              </ActionCard>
              
              <ActionCard href="/writing">
                <ActionIcon aria-hidden="true">
                  <BookOpen size={24} />
                </ActionIcon>
                <ActionTitle>Learning Center</ActionTitle>
                <ActionDescription>Explore educational content and track your learning progress</ActionDescription>
              </ActionCard>
              
              <ActionCard href="/explore">
                <ActionIcon aria-hidden="true">
                  <Grid3X3 size={24} />
                </ActionIcon>
                <ActionTitle>Browse Gallery</ActionTitle>
                <ActionDescription>Discover creative works from our talented community</ActionDescription>
              </ActionCard>
              
              <ActionCard href="/dashboard/profile">
                <ActionIcon aria-hidden="true">
                  <Trophy size={24} />
                </ActionIcon>
                <ActionTitle>Build Portfolio</ActionTitle>
                <ActionDescription>Create and showcase your professional work and achievements</ActionDescription>
              </ActionCard>
            </ActionGrid>
          </ContentWrapper>
        </QuickActions>
      </ContentWrapper>
    </PageContainer>
  );
}

// Styled components remain the same as before
const OptimizedImage = styled(Image)`
  transition: ${theme.transitions.normal};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['3xl']} 0;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  min-height: 50vh;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['3xl']} ${theme.spacing.xl};
  gap: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  text-align: center;
  min-height: 50vh;
`;

const HeroSection = styled(Section)`
  background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.primary[100]} 100%);
  text-align: center;
  border-bottom: 1px solid ${theme.colors.border.light};
  position: relative;
  overflow: hidden;
  min-height: 60vh;
  display: flex;
  align-items: center;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing['2xl']} 0;
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto ${theme.spacing['2xl']};
`;

const SearchForm = styled.form`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 3rem;
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.full};
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  background: ${theme.colors.background.secondary};
  transition: ${theme.transitions.normal};
  box-shadow: ${theme.shadows.sm};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1), ${theme.shadows.md};
  }

  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.secondary};
  width: 20px;
  height: 20px;
  pointer-events: none;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: ${theme.spacing['2xl']};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing['3xl']};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: ${theme.shadows.glass};
  transition: ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.95);
  }
`;

const StatNumber = styled.div`
  font-size: ${theme.typography.sizes['4xl']};
  font-weight: ${theme.typography.weights.bold};
  margin-bottom: ${theme.spacing.sm};
  font-family: ${theme.typography.fonts.display};
  color: ${theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes['2xl']};
  }
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.sizes.lg};
  opacity: 0.7;
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes.sm};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing['2xl']};
  gap: ${theme.spacing.md};

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
  }
`;

const SectionTitle = styled(Heading2)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: 0;
`;

const ViewAllLink = styled(Link)`
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &:hover {
    color: ${theme.colors.primary[500]};
    transform: translateX(2px);
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const PortfolioCard = styled(Card)<{ $kind: string }>`
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${theme.shadows.lg};
  }
  
  &:focus-within {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const CoverImage = styled.div<{ $coverImage?: string; $kind: string }>`
  position: relative;
  height: 200px;
  background: ${({ $coverImage, $kind }) => {
    if ($coverImage) return `url(${$coverImage})`;
    const gradients = {
      creative: `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.text.secondary} 100%)`,
      educational: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
      professional: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      hybrid: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
    };
    return gradients[$kind as keyof typeof gradients] || `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.accent.muted} 100%)`;
  }};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  border-radius: ${theme.borderRadius.md} ${theme.borderRadius.md} 0 0;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    border-radius: inherit;
    z-index: 1;
  }
`;

const KindBadge = styled.div<{ $kind: string }>`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.9);
  color: ${theme.colors.text.primary};
  z-index: 2;
  box-shadow: ${theme.shadows.sm};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${theme.colors.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.weights.semibold};
  font-size: ${theme.typography.sizes.lg};
  overflow: hidden;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.h3`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserTitle = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Bio = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.md};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PortfolioStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.light};
  gap: ${theme.spacing.sm};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  flex: 1;
  justify-content: center;
  
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const StatValue = styled.span`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
`;

const QuickActions = styled(Section)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: ${theme.spacing['2xl']};
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled(Link)`
  display: block;
  padding: ${theme.spacing['2xl']};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.md};
  text-decoration: none;
  color: ${theme.colors.text.primary};
  transition: ${theme.transitions.normal};
  text-align: center;
  border: 1px solid ${theme.colors.border.light};
  
  &:hover {
    background: ${theme.colors.border.light};
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.xl};
  }
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.text.secondary} 100%);
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: ${theme.transitions.normal};
  
  ${ActionCard}:hover & {
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`;

const ActionTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  margin-bottom: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes.base};
  }
`;

const ActionDescription = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0;
  font-size: ${theme.typography.sizes.sm};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes.xs};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']} ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const PlaceholderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  position: relative;
  z-index: 2;
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${theme.spacing.sm};
    opacity: 0.8;
  }
  
  span {
    font-size: ${theme.typography.sizes.sm};
    font-weight: ${theme.typography.weights.medium};
  }
`;