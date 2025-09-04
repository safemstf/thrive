// src/app/page.tsx - Revamped Homepage with Modern Design
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import {
  Search, Grid3X3, User, Play, Target, BookOpen, Trophy,
  Eye, Star, Image as ImageIcon, ArrowRight, Loader2, Zap,
  WifiOff, RefreshCw, AlertCircle, TrendingUp, Sparkles,
  Users, Palette, Code, Camera, Music, Video, ChevronRight
} from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { Portfolio, getPortfolioId, normalizePortfolio } from '@/types/portfolio.types';
import { utils } from '@/utils';
import styled, { keyframes } from 'styled-components';
import { MOCK_PORTFOLIOS } from '@/data/mockData';

// ==============================================
// ANIMATIONS
// ==============================================

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// ==============================================
// MAIN LAYOUT - FIXED 80px TOP SPACING
// ==============================================

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, 
    #ffffff 0%, 
    #f8fafc 100%
  );
  
  /* CRITICAL: Remove the 80px top space */
  margin-top: -80px;
  padding-top: 0;
`;

const MainContainer = styled.main`
  width: 100%;
  position: relative;
  overflow: hidden;
`;

// ==============================================
// HERO SECTION - MODERN DESIGN
// ==============================================

const HeroSection = styled.section`
  position: relative;
  padding: 6rem 1.5rem 4rem;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.05) 0%, 
    rgba(139, 92, 246, 0.05) 100%
  );
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 4rem 1rem 3rem;
  }
  
  /* Decorative background elements */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -25%;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    animation: ${float} 20s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50%;
    left: -25%;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
    animation: ${float} 15s ease-in-out infinite reverse;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 1.5rem;
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  color: #64748b;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
`;

// ==============================================
// SEARCH BAR - MODERN DESIGN
// ==============================================

const SearchContainer = styled.form`
  max-width: 600px;
  margin: 0 auto 2rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 9999px;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: linear-gradient(135deg, #bcd3f7ff, #6c778eff);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
`;

const SearchButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #6c778eff, #bcd3f7ff);
  color: white;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-50%) scale(1.05);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

// ==============================================
// ACTION BUTTONS
// ==============================================

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const PrimaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #bcd3f7ff, #6c778eff);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.25);

  &:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-10%) scale(1.01);
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f9ff;
    transform: translateY(-2px);
  }
`;

// ==============================================
// STATS SECTION
// ==============================================

const StatsSection = styled.section`
  padding: 4rem 1.5rem;
  background: white;
`;

const StatsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #3b82f6, #a29cb0ff);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
`;

// ==============================================
// PORTFOLIO SECTION
// ==============================================

const PortfoliosSection = styled.section`
  padding: 4rem 1.5rem;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
`;

const SectionHeader = styled.div`
  max-width: 1200px;
  margin: 0 auto 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: #3b82f6;
  }
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;

  h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    transition: all 0.3s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 30px;
      height: 2px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 50px;
    }
  }

  &:hover {
    gap: 0.75rem;
    color: #2563eb;
  }
`;

const PortfolioGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
`;

const PortfolioCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const PortfolioCover = styled.div<{ $gradient?: boolean }>`
  height: 180px;
  background: ${props => props.$gradient
    ? 'linear-gradient(135deg, #667eea, #764ba2)'
    : '#e2e8f0'
  };
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PortfolioBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  color: #1e293b;
`;

const PortfolioContent = styled.div`
  padding: 1.5rem;
`;

const PortfolioHeader = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PortfolioAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  flex-shrink: 0;
`;

const PortfolioInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PortfolioUsername = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem;
`;

const PortfolioTitle = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PortfolioBio = styled.p`
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PortfolioStats = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.875rem;
`;

const PortfolioStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #64748b;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  span {
    font-weight: 600;
    color: #1e293b;
  }
`;

// ==============================================
// QUICK ACTIONS SECTION
// ==============================================

const QuickActionsSection = styled.section`
  padding: 4rem 1.5rem;
  background: white;
`;

const QuickActionsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const QuickActionCard = styled(Link)`
  display: block;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    border-color: linear-gradient(135deg, #bcd3f7ff, #6c778eff);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const QuickActionIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s ease;
  
  ${QuickActionCard}:hover & {
    transform: scale(1.1);
  }
`;

const QuickActionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
`;

const QuickActionDesc = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

// ==============================================
// CONNECTION BANNER
// ==============================================

const ConnectionBanner = styled.div<{ $type: 'offline' | 'error' }>`
  background: ${props => props.$type === 'offline'
    ? 'linear-gradient(90deg, #fef2f2, #fee2e2)'
    : 'linear-gradient(90deg, #fefce8, #fef9c3)'
  };
  border-bottom: 2px solid ${props => props.$type === 'offline' ? '#ef4444' : '#eab308'};
  padding: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: ${props => props.$type === 'offline' ? '#dc2626' : '#a16207'};
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid currentColor;
  border-radius: 6px;
  color: inherit;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: currentColor;
    color: white;
  }
`;

// ==============================================
// LOADING STATE
// ==============================================

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// ==============================================
// HOOKS
// ==============================================

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

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
      setPortfolios(Object.values(MOCK_PORTFOLIOS).slice(0, 6));
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
        setPortfolios(Object.values(MOCK_PORTFOLIOS).slice(0, 6));
      }

      setConnectionState('online');
    } catch (err) {
      console.error('Failed to fetch portfolios:', err);
      setError('Failed to load portfolios');
      setConnectionState('error');
      setPortfolios(Object.values(MOCK_PORTFOLIOS).slice(0, 6));
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
// MAIN COMPONENT
// ==============================================

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { portfolios, loading, connectionState, refetch } = usePortfolios();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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

  if (loading && portfolios.length === 0) {
    return (
      <LoadingContainer>
        <Loader2 size={48} />
        <p>Loading portfolios...</p>
      </LoadingContainer>
    );
  }

  return (
    <PageWrapper>
      <MainContainer>
        {connectionState !== 'online' && (
          <ConnectionBanner $type={connectionState === 'offline' ? 'offline' : 'error'}>
            {connectionState === 'offline' ? <WifiOff size={20} /> : <AlertCircle size={20} />}
            {connectionState === 'offline' ? "You're offline" : "Server Busy"}
            <RetryButton onClick={refetch}>
              <RefreshCw size={14} /> Retry
            </RetryButton>
          </ConnectionBanner>
        )}

        <HeroSection>
          <HeroContent>
            <HeroTitle>Discover Creative Excellence</HeroTitle>
            <HeroSubtitle>
              Connect with talented creators, develop your skills, and showcase your work to the world
            </HeroSubtitle>

            <SearchContainer onSubmit={handleSearch}>
              <SearchIconWrapper>
                <Search size={20} />
              </SearchIconWrapper>
              <SearchInput
                type="search"
                placeholder="Search portfolios, skills, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchButton type="submit">
                Search
              </SearchButton>
            </SearchContainer>

            <ActionButtons>
              {user ? (
                <PrimaryButton href="/dashboard">
                  <User size={18} /> Dashboard
                </PrimaryButton>
              ) : (
                <PrimaryButton href="/login">
                  <Sparkles size={18} /> Get Started
                </PrimaryButton>
              )}
              <SecondaryButton href="/thrive">
                <Zap size={18} /> Skills Arena
              </SecondaryButton>
            </ActionButtons>
          </HeroContent>
        </HeroSection>

        <StatsSection>
          <StatsGrid>
            <StatCard>
              <StatIcon><Users size={28} /></StatIcon>
              <StatNumber>1,247</StatNumber>
              <StatLabel>Active Creators</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><Grid3X3 size={28} /></StatIcon>
              <StatNumber>120</StatNumber>
              <StatLabel>Portfolios</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><Palette size={28} /></StatIcon>
              <StatNumber>900+</StatNumber>
              <StatLabel>Creative Works</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><TrendingUp size={28} /></StatIcon>
              <StatNumber>45</StatNumber>
              <StatLabel>Online Now</StatLabel>
            </StatCard>
          </StatsGrid>
        </StatsSection>

        <PortfoliosSection>
          <SectionHeader>
            <SectionTitle>
              <Star size={28} />
              Featured Creators
            </SectionTitle>
            <ViewAllLink href="/explore">
              <h3>View all</h3> <ChevronRight size={18} />
            </ViewAllLink>
          </SectionHeader>

          <PortfolioGrid>
            {portfolios.map((portfolio) => {
              const portfolioId = getPortfolioId(portfolio);
              if (!portfolioId) return null;

              return (
                <PortfolioCard
                  key={`${portfolioId}-${portfolio.username}`}
                  onClick={() => handlePortfolioClick(portfolio.username)}
                >
                  <PortfolioCover $gradient={!portfolio.coverImage}>
                    <PortfolioBadge>{portfolio.kind}</PortfolioBadge>
                    {portfolio.coverImage ? (
                      <Image
                        src={portfolio.coverImage}
                        alt={`${portfolio.title}'s portfolio`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={48} color="white" />
                    )}
                  </PortfolioCover>

                  <PortfolioContent>
                    <PortfolioHeader>
                      <PortfolioAvatar>
                        {portfolio.profileImage ? (
                          <Image
                            src={portfolio.profileImage}
                            alt={portfolio.title || portfolio.username}
                            width={48}
                            height={48}
                            style={{ borderRadius: '12px' }}
                          />
                        ) : (
                          getInitials(portfolio.title || portfolio.username)
                        )}
                      </PortfolioAvatar>
                      <PortfolioInfo>
                        <PortfolioUsername>@{portfolio.username}</PortfolioUsername>
                        <PortfolioTitle>{portfolio.title}</PortfolioTitle>
                      </PortfolioInfo>
                    </PortfolioHeader>

                    {portfolio.bio && (
                      <PortfolioBio>{portfolio.bio}</PortfolioBio>
                    )}

                    <PortfolioStats>
                      <PortfolioStat>
                        <Eye />
                        <span>{utils.data.formatNumber(portfolio.stats?.totalViews || 0)}</span>
                      </PortfolioStat>
                      <PortfolioStat>
                        <ImageIcon />
                        <span>{portfolio.stats?.totalPieces || 0}</span>
                      </PortfolioStat>
                      <PortfolioStat>
                        <Star />
                        <span>{portfolio.stats?.averageRating?.toFixed(1) || 'N/A'}</span>
                      </PortfolioStat>
                    </PortfolioStats>
                  </PortfolioContent>
                </PortfolioCard>
              );
            })}
          </PortfolioGrid>
        </PortfoliosSection>

        <QuickActionsSection>
          <SectionHeader>
            <SectionTitle>
              <Zap size={28} />
              Quick Actions
            </SectionTitle>
          </SectionHeader>

          <QuickActionsGrid>
            <QuickActionCard href="/explore">
              <QuickActionIcon><Grid3X3 size={24} /></QuickActionIcon>
              <QuickActionTitle>Browse Portfolios</QuickActionTitle>
              <QuickActionDesc>Discover amazing collections of work</QuickActionDesc>
            </QuickActionCard>

            <QuickActionCard href="/thrive">
              <QuickActionIcon><Target size={24} /></QuickActionIcon>
              <QuickActionTitle>Skills Arena</QuickActionTitle>
              <QuickActionDesc>Challenge yourself with interactive games</QuickActionDesc>
            </QuickActionCard>

            <QuickActionCard href="/dashboard/profile">
              <QuickActionIcon><Trophy size={24} /></QuickActionIcon>
              <QuickActionTitle>Build Portfolio</QuickActionTitle>
              <QuickActionDesc>Create your professional showcase</QuickActionDesc>
            </QuickActionCard>
          </QuickActionsGrid>
        </QuickActionsSection>
      </MainContainer>
    </PageWrapper>
  );
}