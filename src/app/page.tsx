// src\app\page.tsx

'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import { 
  Search, Grid3X3, User, Play, Target, BookOpen, Trophy,
  Eye, Star, Image, ArrowRight, Loader2, Zap
} from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import {
  PageContainer, ContentWrapper, Section, Heading1, Heading2, BodyText,
  BaseButton, Card, CardContent, Grid
} from '@/styles/styled-components';
import styled from 'styled-components';
import { theme } from '@/styles/theme';

// Types
interface Portfolio {
  id: string;
  username: string;
  title?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  kind: 'creative' | 'educational' | 'professional' | 'hybrid';
  stats: {
    totalViews: number;
    totalPieces: number;
    totalReviews: number;
    averageRating?: number;
  };
  specializations: string[];
  isOnline?: boolean;
  lastActiveAt?: Date;
}

interface Stats {
  users: number;
  portfolios: number;
  pieces: number;
  active: number;
}

// Styled Components - Fixed template literals
const HeroSection = styled(Section)`
  background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.primary[100]} 100%);
  text-align: center;
  border-bottom: 1px solid ${theme.colors.border.light};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(44, 44, 44, 0.03) 1px, transparent 1px);
    background-size: 30px 30px;
    animation: float 20s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(10px, -10px) rotate(1deg); }
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
`;

const HeroSubtitle = styled(BodyText)`
  font-size: ${theme.typography.sizes.xl};
  margin-bottom: ${theme.spacing['2xl']};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto ${theme.spacing['2xl']};
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
`;

const StatCard = styled(Card)`
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: ${theme.shadows.glass};
  
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
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.sizes.lg};
  opacity: 0.7;
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
`;

const PortfolioCard = styled(Card)<{ $kind: string }>`
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${theme.shadows.lg};
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
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
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

const OnlineIndicator = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  left: ${theme.spacing.md};
  width: 12px;
  height: 12px;
  background: ${theme.colors.text.secondary};
  border-radius: 50%;
  border: 2px solid white;
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
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserDetails = styled.div`
  flex: 1;
`;

const Username = styled.h3`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs};
`;

const UserTitle = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
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
`;

const StatItem = styled.div`
  text-align: center;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  
  svg {
    width: 14px;
    height: 14px;
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
`;

const ActionTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  margin-bottom: ${theme.spacing.sm};
`;

const ActionDescription = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['3xl']} 0;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
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

// Utility Functions
const getInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return '??';
  }
  
  const parts = name.trim().split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const generateMockPortfolios = (): Portfolio[] => [
  {
    id: '1',
    username: 'alice_creates',
    title: 'Alice Johnson',
    bio: 'Digital artist and UI designer creating beautiful, functional experiences that inspire and engage users worldwide.',
    kind: 'creative',
    stats: { totalViews: 2840, totalPieces: 24, totalReviews: 18, averageRating: 4.8 },
    specializations: ['Digital Art', 'UI Design', 'Branding'],
    isOnline: true
  },
  {
    id: '2',
    username: 'math_master_bob',
    title: 'Bob Chen',
    bio: 'Mathematics educator passionate about making complex concepts accessible to students of all backgrounds.',
    kind: 'educational',
    stats: { totalViews: 1956, totalPieces: 45, totalReviews: 32, averageRating: 4.9 },
    specializations: ['Calculus', 'Statistics', 'SAT Prep'],
    isOnline: false
  },
  {
    id: '3',
    username: 'carol_codes',
    title: 'Carol Martinez',
    bio: 'Full-stack developer and creative technologist bridging the gap between design and engineering.',
    kind: 'hybrid',
    stats: { totalViews: 3210, totalPieces: 38, totalReviews: 27, averageRating: 4.7 },
    specializations: ['React', 'Node.js', 'Creative Coding'],
    isOnline: true
  },
  {
    id: '4',
    username: 'david_pro',
    title: 'David Kim',
    bio: 'Senior product manager with 8 years of experience driving innovation in tech startups and Fortune 500 companies.',
    kind: 'professional',
    stats: { totalViews: 1687, totalPieces: 15, totalReviews: 22, averageRating: 4.6 },
    specializations: ['Product Strategy', 'UX Research', 'Data Analysis'],
    isOnline: true
  },
  {
    id: '5',
    username: 'eva_writer',
    title: 'Eva Thompson',
    bio: 'Content creator and storyteller helping brands find their authentic voice in the digital landscape.',
    kind: 'creative',
    stats: { totalViews: 1423, totalPieces: 31, totalReviews: 19, averageRating: 4.5 },
    specializations: ['Content Strategy', 'Copywriting', 'Brand Voice'],
    isOnline: false
  },
  {
    id: '6',
    username: 'frank_music',
    title: 'Frank Rodriguez',
    bio: 'Music producer and audio engineer crafting immersive sonic experiences for film, games, and artists.',
    kind: 'creative',
    stats: { totalViews: 2156, totalPieces: 28, totalReviews: 15, averageRating: 4.8 },
    specializations: ['Music Production', 'Audio Engineering', 'Sound Design'],
    isOnline: true
  }
];

// Main Component
export default function ModernHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ 
    users: 0, 
    portfolios: 0, 
    pieces: 0, 
    active: 0 
  });

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const apiClient = getApiClient();
      
      let portfolioData: any;
      try {
        portfolioData = await apiClient.portfolio?.discover?.({}, 1, 6) || generateMockPortfolios();
      } catch {
        portfolioData = generateMockPortfolios();
      }
      
      const portfolioArray = Array.isArray(portfolioData) 
        ? portfolioData 
        : portfolioData.portfolios || portfolioData.data || generateMockPortfolios();
      
      setPortfolios(portfolioArray);
      
      setStats({
        users: 1247,
        portfolios: Math.max(portfolioArray.length * 20, 120),
        pieces: Math.max(portfolioArray.length * 150, 900),
        active: Math.max(portfolioArray.filter((p: Portfolio) => p.isOnline).length * 30, 45)
      });
      
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
      setPortfolios(generateMockPortfolios());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handlePortfolioClick = (username: string) => {
    router.push(`/u/${username}`);
  };

  const renderPortfolioImage = (portfolio: Portfolio) => {
    if (portfolio.coverImage) {
      return (
        <img 
          src={portfolio.coverImage} 
          alt={portfolio.title || 'Portfolio cover'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      );
    }
    
    return (
      <PlaceholderContent>
        <User />
        <span>{portfolio.title || portfolio.username}</span>
      </PlaceholderContent>
    );
  };

  return (
    <PageContainer>
      <HeroSection>
        <ContentWrapper>
          <HeroContent>
            <Heading1>Discover Creative Excellence</Heading1>
            <HeroSubtitle>
              Connect with talented creators, develop your skills, and showcase your work in our thriving professional community
            </HeroSubtitle>
            
            <SearchContainer>
              <form onSubmit={handleSearch}>
                <SearchIcon />
                <SearchInput
                  type="text"
                  placeholder="Search portfolios, skills, or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </SearchContainer>

            <CTAButtons>
              {user ? (
                <BaseButton as={Link} href="/dashboard" $variant="primary">
                  <User size={16} />
                  Dashboard
                </BaseButton>
              ) : (
                <BaseButton as={Link} href="/login" $variant="primary">
                  <Play size={16} />
                  Get Started
                </BaseButton>
              )}
              <BaseButton as={Link} href="/thrive" $variant="secondary">
                <Zap size={16} />
                Skills Arena
              </BaseButton>
            </CTAButtons>
          </HeroContent>
        </ContentWrapper>
      </HeroSection>

      <ContentWrapper>
        <Section>
          <StatsGrid>
            <StatCard>
              <CardContent>
                <StatNumber>{(stats?.users || 0).toLocaleString()}</StatNumber>
                <StatLabel>Active Creators</StatLabel>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent>
                <StatNumber>{(stats?.portfolios || 0).toLocaleString()}</StatNumber>
                <StatLabel>Portfolios</StatLabel>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent>
                <StatNumber>{(stats?.pieces || 0).toLocaleString()}</StatNumber>
                <StatLabel>Creative Works</StatLabel>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent>
                <StatNumber>{stats?.active || 0}</StatNumber>
                <StatLabel>Online Now</StatLabel>
              </CardContent>
            </StatCard>
          </StatsGrid>

          <SectionHeader>
            <SectionTitle>
              <Grid3X3 size={24} />
              Featured Creators
            </SectionTitle>
            <ViewAllLink href="/explore">
              View all <ArrowRight size={16} />
            </ViewAllLink>
          </SectionHeader>

          {loading ? (
            <LoadingContainer>
              <Loader2 className="animate-spin" size={24} />
              Loading portfolios...
            </LoadingContainer>
          ) : portfolios.length > 0 ? (
            <Grid $minWidth="320px">
              {portfolios.map((portfolio) => (
                <PortfolioCard 
                  key={portfolio.id}
                  $kind={portfolio.kind}
                  onClick={() => handlePortfolioClick(portfolio.username)}
                >
                  <CoverImage $coverImage={portfolio.coverImage} $kind={portfolio.kind}>
                    <KindBadge $kind={portfolio.kind}>{portfolio.kind}</KindBadge>
                    {portfolio.isOnline && <OnlineIndicator />}
                    {renderPortfolioImage(portfolio)}
                  </CoverImage>
                  
                  <CardContent>
                    <UserInfo>
                      <Avatar>
                        {portfolio.profileImage ? (
                          <img 
                            src={portfolio.profileImage} 
                            alt={portfolio.title || portfolio.username} 
                          />
                        ) : (
                          getInitials(portfolio.title || portfolio.username)
                        )}
                      </Avatar>
                      <UserDetails>
                        <Username>@{portfolio.username}</Username>
                        <UserTitle>{portfolio.title || 'Creative Professional'}</UserTitle>
                      </UserDetails>
                    </UserInfo>
                    
                    {portfolio.bio && portfolio.bio.trim() && <Bio>{portfolio.bio}</Bio>}
                    
                    <PortfolioStats>
                      <StatItem>
                        <Eye size={14} />
                        <StatValue>{(portfolio.stats?.totalViews || 0).toLocaleString()}</StatValue>
                      </StatItem>
                      <StatItem>
                        <Image size={14} />
                        <StatValue>{portfolio.stats?.totalPieces || 0}</StatValue>
                      </StatItem>
                      <StatItem>
                        <Star size={14} />
                        <StatValue>{portfolio.stats?.averageRating?.toFixed(1) || 'N/A'}</StatValue>
                      </StatItem>
                    </PortfolioStats>
                  </CardContent>
                </PortfolioCard>
              ))}
            </Grid>
          ) : (
            <EmptyState>
              <p>No portfolios available at the moment. Check back soon!</p>
            </EmptyState>
          )}
        </Section>

        <QuickActions>
          <ContentWrapper>
            <SectionTitle>Quick Actions</SectionTitle>
            <ActionGrid>
              <ActionCard href="/thrive">
                <ActionIcon><Target size={24} /></ActionIcon>
                <ActionTitle>Skills Arena</ActionTitle>
                <ActionDescription>Challenge yourself with interactive professional development games</ActionDescription>
              </ActionCard>
              <ActionCard href="/writing">
                <ActionIcon><BookOpen size={24} /></ActionIcon>
                <ActionTitle>Learning Center</ActionTitle>
                <ActionDescription>Explore educational content and track your learning progress</ActionDescription>
              </ActionCard>
              <ActionCard href="/explore">
                <ActionIcon><Grid3X3 size={24} /></ActionIcon>
                <ActionTitle>Browse Gallery</ActionTitle>
                <ActionDescription>Discover creative works from our talented community</ActionDescription>
              </ActionCard>
              <ActionCard href="/dashboard/profile">
                <ActionIcon><Trophy size={24} /></ActionIcon>
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