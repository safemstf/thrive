// src/app/page.tsx - Optimized with reusable components and utilities
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import { 
  Search, Grid3X3, User, Play, Target, BookOpen, Trophy,
  Eye, Star, Image as ImageIcon, ArrowRight, Loader2, Zap,
  WifiOff, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { Portfolio, getPortfolioId, normalizePortfolio } from '@/types/portfolio.types';

// Import from your styled-components hub
import {
  PageContainer, ContentWrapper, Section, Heading1, Heading2, BodyText,
  BaseButton, Card, CardContent, Grid, LoadingContainer, EmptyState,
  FlexRow, FlexColumn, Container, HeroSection, Badge, Input
} from '@/styles/styled-components';

// Import utilities
import { utils } from '@/utils';
import styled from 'styled-components';
import { MOCK_PORTFOLIOS } from '@/data/mockData';

// ==============================================
// CSS RESET FOR SCROLL AND MARGIN ISSUES
// ==============================================

const GlobalPageWrapper = styled.div`
  /* Fix double scroll and top margin issues */
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden; /* Prevent horizontal scroll */
  
  /* Ensure no global margins interfere */
  & > * {
    margin-top: 0;
  }
  
  /* Reset any browser defaults */
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden;
  }
`;

// ==============================================
// CUSTOM HOOKS
// ==============================================

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'online' | 'offline' | 'error'>('online');
  
  const isOnline = useNetworkStatus();

  const fetchPortfolios = useCallback(async () => {
    if (!isOnline) {
      setConnectionState('offline');
      // Convert mock data object to array
      setPortfolios(Object.values(MOCK_PORTFOLIOS));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const apiClient = getApiClient();
      const portfolioData = await apiClient.portfolio?.discover?.({}, 1, 6);
      
      if (Array.isArray(portfolioData)) {
        setPortfolios(portfolioData.map(normalizePortfolio));
      } else if (portfolioData?.portfolios) {
        setPortfolios(portfolioData.portfolios.map(normalizePortfolio));
      } else {
        // Convert mock data object to array when API fails
        setPortfolios(Object.values(MOCK_PORTFOLIOS));
      }
      
      setConnectionState('online');
    } catch (err) {
      console.error('Failed to fetch portfolios:', err);
      setError('Failed to load portfolios');
      setConnectionState('error');
      // Convert mock data object to array on error
      setPortfolios(Object.values(MOCK_PORTFOLIOS));
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return { portfolios, loading, error, connectionState, refetch: fetchPortfolios };
};

// ==============================================
// STYLED COMPONENTS (minimal additions)
// ==============================================

const SearchForm = styled.form`
  position: relative;
  max-width: 600px;
  margin: 0 auto var(--spacing-2xl);
`;

const SearchInput = styled(Input)`
  padding-left: 3rem;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1), var(--shadow-md);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  width: 20px;
  height: 20px;
  pointer-events: none;
`;

const StatCard = styled(Card)`
  text-align: center;
  ${utils.animation.hoverLift(4)}
`;

const StatNumber = styled.div`
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-display);
  color: var(--color-text-primary);
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.8;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FixedPageContainer = styled(PageContainer)`
  /* Override any margins and fix scroll issues */
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden;
  width: 100vw;
  max-width: 100%;
  position: relative;
  
  /* Remove any potential background patterns that might cause overflow */
  &::before {
    display: none;
  }
`;

const PortfolioCard = styled(Card)`
  cursor: pointer;
  ${utils.animation.hoverLift(8, 'var(--shadow-lg)')}
  ${utils.component.interactiveProps}
`;

const CoverImage = styled.div<{ $bgImage?: string; $kind: string }>`
  height: 200px;
  background: ${({ $bgImage, $kind }) => 
    $bgImage || `linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))`
  };
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
`;

const ActionCard = styled(Link)`
  display: block;
  padding: var(--spacing-2xl);
  background: var(--color-background-tertiary);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-primary);
  text-align: center;
  border: 1px solid var(--color-border-light);
  ${utils.animation.hoverLift(4, 'var(--shadow-md)')}
  ${utils.component.interactiveProps}
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-md);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-text-secondary));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: var(--transition-normal);
  
  ${ActionCard}:hover & {
    transform: scale(1.1);
  }
`;

// ==============================================
// CONSTANTS
// ==============================================



const STATS_DATA = { users: 1247, portfolios: 120, pieces: 900, active: 45 };

// ==============================================
// COMPONENTS
// ==============================================

const ConnectionBanner: React.FC<{ 
  state: 'online' | 'offline' | 'error';
  onRetry: () => void;
}> = ({ state, onRetry }) => {
  if (state === 'online') return null;

  const config = {
    offline: { icon: WifiOff, title: 'You\'re offline', color: '#ef4444' },
    error: { icon: AlertCircle, title: 'Server under development', color: '#ef4444' }
  };

  const { icon: Icon, title, color } = config[state];

  return (
    <div style={{ 
      background: `rgba(239, 68, 68, 0.1)`, 
      borderBottom: `1px solid ${color}`,
      padding: 'var(--spacing-md) 0'
    }}>
      <Container>
        <FlexRow $justify="center" $gap="var(--spacing-md)">
          <Icon size={20} style={{ color }} />
          <span style={{ fontWeight: 600 }}>{title}</span>
          <BaseButton onClick={onRetry} $variant="secondary" $size="sm">
            <RefreshCw size={16} />
            Retry
          </BaseButton>
        </FlexRow>
      </Container>
    </div>
  );
};

const PortfolioGrid: React.FC<{ portfolios: Portfolio[] }> = ({ portfolios }) => {
  const router = useRouter();

  const handlePortfolioClick = (username: string) => {
    router.push(`/portfolio/${username}`);
  };

  const getInitials = (name: string) => {
    if (!name?.trim()) return '??';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Grid $minWidth="320px">
      {portfolios.map((portfolio) => {
        const portfolioId = getPortfolioId(portfolio);
        if (!portfolioId) return null;
        
        return (
          <PortfolioCard 
            key={`${portfolioId}-${portfolio.username}`}
            $padding="none"
            onClick={() => handlePortfolioClick(portfolio.username)}
          >
            <CoverImage $kind={portfolio.kind}>
              <Badge style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)', zIndex: 2 }}>
                {portfolio.kind}
              </Badge>
              
              {portfolio.coverImage ? (
                <Image
                  src={portfolio.coverImage}
                  alt={`${portfolio.title}'s portfolio`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <FlexColumn $align="center" style={{ color: 'white', zIndex: 2 }}>
                  <User size={48} />
                  <span>{portfolio.title || portfolio.username}</span>
                </FlexColumn>
              )}
            </CoverImage>
            
            <CardContent>
              <FlexRow $gap="var(--spacing-md)" style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--color-primary-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 600, fontSize: '1rem'
                }}>
                  {portfolio.profileImage ? (
                    <Image
                      src={portfolio.profileImage}
                      alt={`${portfolio.title}'s profile`}
                      width={48} height={48}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(portfolio.title || portfolio.username)
                  )}
                </div>
                <FlexColumn $gap="var(--spacing-xs)" style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                    @{portfolio.username}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    {portfolio.title}
                  </p>
                </FlexColumn>
              </FlexRow>
              
              {portfolio.bio && (
                <p style={{ 
                  fontSize: '0.875rem', color: 'var(--color-text-secondary)',
                  margin: '0 0 var(--spacing-md)', lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {portfolio.bio}
                </p>
              )}
              
              <FlexRow style={{ 
                paddingTop: 'var(--spacing-md)', 
                borderTop: '1px solid var(--color-border-light)',
                justifyContent: 'space-between',
                fontSize: '0.875rem'
              }}>
                <FlexRow $gap="var(--spacing-xs)" style={{ justifyContent: 'center', flex: 1 }}>
                  <Eye size={14} />
                  <span style={{ fontWeight: 600 }}>{utils.data.formatNumber(portfolio.stats?.totalViews || 0)}</span>
                </FlexRow>
                <FlexRow $gap="var(--spacing-xs)" style={{ justifyContent: 'center', flex: 1 }}>
                  <ImageIcon size={14} />
                  <span style={{ fontWeight: 600 }}>{portfolio.stats?.totalPieces || 0}</span>
                </FlexRow>
                <FlexRow $gap="var(--spacing-xs)" style={{ justifyContent: 'center', flex: 1 }}>
                  <Star size={14} />
                  <span style={{ fontWeight: 600 }}>{portfolio.stats?.averageRating?.toFixed(1) || 'N/A'}</span>
                </FlexRow>
              </FlexRow>
            </CardContent>
          </PortfolioCard>
        );
      })}
    </Grid>
  );
};

// ==============================================
// MAIN COMPONENT
// ==============================================

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { portfolios, loading, connectionState, refetch } = usePortfolios();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  }, [searchQuery, router]);

  if (loading && portfolios.length === 0) {
    return (
      <GlobalPageWrapper>
        <FixedPageContainer>
          <LoadingContainer>
            <Loader2 className="animate-spin" size={48} />
            <BodyText>Loading portfolios...</BodyText>
          </LoadingContainer>
        </FixedPageContainer>
      </GlobalPageWrapper>
    );
  }

  return (
    <GlobalPageWrapper>
      <FixedPageContainer>
        <ConnectionBanner state={connectionState} onRetry={refetch} />

        <HeroSection>
          <ContentWrapper>
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
              <Heading1 $responsive>Discover Creative Excellence</Heading1>
              <BodyText $size="xl" style={{ 
                marginBottom: 'var(--spacing-2xl)',
                maxWidth: 600, marginLeft: 'auto', marginRight: 'auto'
              }}>
                Connect with talented creators, develop your skills, and showcase your work
              </BodyText>
              
              <SearchForm onSubmit={handleSearch}>
                <SearchIcon />
                <SearchInput
                  type="search"
                  placeholder="Search portfolios, skills, or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchForm>

              <FlexRow $justify="center" $gap="var(--spacing-md)" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                {user ? (
                  <BaseButton as={Link} href="/dashboard" $variant="primary">
                    <User size={16} /> Dashboard
                  </BaseButton>
                ) : (
                  <BaseButton as={Link} href="/login" $variant="primary">
                    <Play size={16} /> Get Started
                  </BaseButton>
                )}
                <BaseButton as={Link} href="/thrive" $variant="secondary">
                  <Zap size={16} /> Skills Arena
                </BaseButton>
              </FlexRow>
            </div>
          </ContentWrapper>
        </HeroSection>

        <ContentWrapper>
          <Section>
            {/* Stats */}
            <Grid $minWidth="200px" $gap="var(--spacing-lg)" style={{ marginBottom: 'var(--spacing-3xl)' }}>
              {Object.entries(STATS_DATA).map(([key, value]) => (
                <StatCard key={key}>
                  <CardContent>
                    <StatNumber>{utils.data.formatNumber(value)}</StatNumber>
                    <StatLabel>{
                      key === 'users' ? 'Active Creators' :
                      key === 'portfolios' ? 'Portfolios' :
                      key === 'pieces' ? 'Creative Works' : 'Online Now'
                    }</StatLabel>
                  </CardContent>
                </StatCard>
              ))}
            </Grid>

            {/* Featured Creators */}
            <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <FlexRow $gap="var(--spacing-sm)">
                <Grid3X3 size={24} />
                <Heading2 style={{ margin: 0 }}>Featured Creators</Heading2>
                {connectionState !== 'online' && (
                  <Badge $variant="warning">
                    {connectionState === 'offline' ? 'Offline Mode' : 'Limited Connection'}
                  </Badge>
                )}
              </FlexRow>
              <Link href="/explore" style={{ 
                color: 'var(--color-text-secondary)', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)'
              }}>
                View all <ArrowRight size={16} />
              </Link>
            </FlexRow>

            {portfolios.length > 0 ? (
              <PortfolioGrid portfolios={portfolios} />
            ) : (
              <EmptyState>
                <BodyText>No portfolios available. Check back soon!</BodyText>
              </EmptyState>
            )}
          </Section>

          {/* Quick Actions */}
          <Section style={{ background: 'var(--glass-background)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
            <ContentWrapper>
              <Heading2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                Quick Actions
              </Heading2>
              <Grid $minWidth="250px">
                {[
                  { href: '/thrive', icon: Target, title: 'Skills Arena', desc: 'Challenge yourself with interactive games' },
                  { href: '/writing', icon: BookOpen, title: 'Learning Center', desc: 'Explore educational content' },
                  { href: '/explore', icon: Grid3X3, title: 'Browse Gallery', desc: 'Discover creative works' },
                  { href: '/dashboard/profile', icon: Trophy, title: 'Build Portfolio', desc: 'Create your professional showcase' }
                ].map((action, index) => (
                  <ActionCard key={index} href={action.href}>
                    <ActionIcon>
                      <action.icon size={24} />
                    </ActionIcon>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
                      {action.title}
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
                      {action.desc}
                    </p>
                  </ActionCard>
                ))}
              </Grid>
            </ContentWrapper>
          </Section>
        </ContentWrapper>
      </FixedPageContainer>
    </GlobalPageWrapper>
  );
}