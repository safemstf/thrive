// src/app/dashboard/page.tsx - Matching Layout Design System
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { useDashboardLogic } from '@/components/dashboard/dashboardLogic';
import { 
  LayoutDashboard, 
  Image as GalleryIcon, 
  Brush,
  Brain,
  Layers,
  ChevronRight,
  Activity,
  Settings,
  Loader2,
  Sparkles,
  BarChart3,
  Target,
  Code,
  Plus,
  ExternalLink,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Eye
} from "lucide-react";

// Import view components
import { GalleryView } from '@/components/dashboard/views/GalleryView';
import { LearningView } from '@/components/dashboard/views/learningView';
import { AnalyticsView } from '@/components/dashboard/views/analyticsView';

type DashboardView = 'overview' | 'gallery' | 'learning' | 'analytics';

export default function Dashboard() {
  const router = useRouter();
  const { portfolio, loading, error, hasPortfolio, galleryPieces } = usePortfolioManagement();
  const { 
    portfolioTypeConfig,
    formatTimeAgo
  } = useDashboardLogic();

  // View state management
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  // Portfolio type configuration with icons
  const PORTFOLIO_CONFIG = {
    creative: {
      ...portfolioTypeConfig.creative,
      icon: <Brush size={20} />
    },
    educational: {
      ...portfolioTypeConfig.educational,
      icon: <Brain size={20} />
    },
    professional: {
      ...portfolioTypeConfig.professional,
      icon: <Code size={20} />
    },
    hybrid: {
      ...portfolioTypeConfig.hybrid,
      icon: <Layers size={20} />
    }
  };

  // Check if view is available for current portfolio type
  const isViewAvailable = (view: DashboardView): boolean => {
    if (!portfolio) return view === 'overview';
    
    switch (view) {
      case 'overview':
      case 'analytics':
        return true;
      case 'gallery':
        return portfolio.kind === 'creative' || portfolio.kind === 'hybrid';
      case 'learning':
        return portfolio.kind === 'educational' || portfolio.kind === 'hybrid';
      default:
        return false;
    }
  };

  // Handle view change
  const handleViewChange = (view: DashboardView) => {
    if (isViewAvailable(view)) {
      setActiveView(view);
    }
  };

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <LoadingContainer>
            <LoadingCard>
              <Loader2 className="animate-spin" size={32} />
              <LoadingText>Loading dashboard...</LoadingText>
            </LoadingCard>
          </LoadingContainer>
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <ErrorContainer>
            <ErrorCard>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorTitle>Something went wrong</ErrorTitle>
              <ErrorMessage>{error}</ErrorMessage>
              <RetryButton onClick={() => window.location.reload()}>
                Try Again
              </RetryButton>
            </ErrorCard>
          </ErrorContainer>
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  // No portfolio state - Show create portfolio prompt
  if (!hasPortfolio) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <Container>
            <CreatePortfolioSection>
              <WelcomeCard>
                <WelcomeIcon>
                  <Sparkles size={32} />
                </WelcomeIcon>
                <WelcomeContent>
                  <WelcomeTitle>Welcome to Your Dashboard</WelcomeTitle>
                  <WelcomeDescription>
                    Create your first portfolio to start tracking your professional journey and showcase your work.
                  </WelcomeDescription>
                </WelcomeContent>
              </WelcomeCard>

              <PortfolioTypesGrid>
                {Object.entries(PORTFOLIO_CONFIG).map(([key, config]) => (
                  <PortfolioTypeCard 
                    key={key}
                    onClick={() => router.push(`/dashboard/profile?create=${key}`)}
                  >
                    <CardHeader>
                      <CardIcon>
                        {config.icon}
                      </CardIcon>
                      <CardTitle>{config.title}</CardTitle>
                    </CardHeader>
                    <CardDescription>{config.description}</CardDescription>
                    <CardFeatures>
                      {key === 'creative' && (
                        <>
                          <Feature>Gallery showcase</Feature>
                          <Feature>Visual projects</Feature>
                        </>
                      )}
                      {key === 'educational' && (
                        <>
                          <Feature>Learning progress</Feature>
                          <Feature>Achievement tracking</Feature>
                        </>
                      )}
                      {key === 'professional' && (
                        <>
                          <Feature>Technical skills</Feature>
                          <Feature>Project showcase</Feature>
                        </>
                      )}
                      {key === 'hybrid' && (
                        <>
                          <Feature>Multi-disciplinary</Feature>
                          <Feature>Flexible format</Feature>
                        </>
                      )}
                    </CardFeatures>
                    <CreateButton>
                      <Plus size={16} />
                      Create {config.title}
                    </CreateButton>
                  </PortfolioTypeCard>
                ))}
              </PortfolioTypesGrid>
            </CreatePortfolioSection>
          </Container>
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  // Portfolio dashboard (we know portfolio exists here)
  const currentConfig = PORTFOLIO_CONFIG[portfolio!.kind as keyof typeof PORTFOLIO_CONFIG];

  // Mock stats for views (replace with real data when available)
  const mockStats = {
    portfolioType: portfolio!.kind,
    totalItems: galleryPieces.length,
    recentActivity: 0,
    completionRate: 75,
    weeklyGrowth: 12,
    averageScore: 88
  };

  const mockAchievements = [
    {
      id: '1',
      title: 'Portfolio Created',
      description: 'Successfully created your first portfolio',
      unlockedAt: new Date(),
      rarity: 'common' as const
    }
  ];

  return (
    <ProtectedRoute>
      <PageWrapper>
        <Container>
          {/* Header Section */}
          <Header>
            <HeaderContent>
              <WelcomeSection>
                <WelcomeTitle>Your Dashboard</WelcomeTitle>
                <WelcomeSubtitle>{currentConfig?.title}</WelcomeSubtitle>
              </WelcomeSection>
              
              {/* View Toggle */}
              <ViewToggle>
                <ViewButton 
                  $active={activeView === 'overview'}
                  onClick={() => handleViewChange('overview')}
                >
                  <LayoutDashboard size={16} />
                  Overview
                </ViewButton>
                
                {isViewAvailable('gallery') && (
                  <ViewButton 
                    $active={activeView === 'gallery'}
                    onClick={() => handleViewChange('gallery')}
                  >
                    <GalleryIcon size={16} />
                    Gallery
                  </ViewButton>
                )}
                
                {isViewAvailable('learning') && (
                  <ViewButton 
                    $active={activeView === 'learning'}
                    onClick={() => handleViewChange('learning')}
                  >
                    <Brain size={16} />
                    Learning
                  </ViewButton>
                )}
                
                <ViewButton 
                  $active={activeView === 'analytics'}
                  onClick={() => handleViewChange('analytics')}
                >
                  <BarChart3 size={16} />
                  Insights
                </ViewButton>
              </ViewToggle>
            </HeaderContent>
          </Header>

          <DashboardContent>
            {/* Render different views based on activeView */}
            {activeView === 'overview' && (
              <>
                {/* Stats Grid */}
                <StatsGrid>
                  <MainStatCard>
                    <StatHeader>
                      <StatIcon>
                        {currentConfig?.icon}
                      </StatIcon>
                      <StatInfo>
                        <StatTitle>Portfolio Items</StatTitle>
                        <StatValue>{galleryPieces.length}</StatValue>
                        <StatLabel>Total</StatLabel>
                      </StatInfo>
                    </StatHeader>
                    <StatProgress>
                      <ProgressBar>
                        <ProgressFill $percentage={75} />
                      </ProgressBar>
                      <ProgressText>Portfolio Active</ProgressText>
                    </StatProgress>
                  </MainStatCard>

                  <StatCard>
                    <StatIcon>
                      <Activity size={18} />
                    </StatIcon>
                    <StatContent>
                      <StatValue>0</StatValue>
                      <StatLabel>Activity</StatLabel>
                      <StatChange>Recent</StatChange>
                    </StatContent>
                  </StatCard>

                  {isViewAvailable('gallery') && (
                    <StatCard>
                      <StatIcon>
                        <GalleryIcon size={18} />
                      </StatIcon>
                      <StatContent>
                        <StatValue>{galleryPieces.length}</StatValue>
                        <StatLabel>Gallery</StatLabel>
                        <StatChange>Items</StatChange>
                      </StatContent>
                    </StatCard>
                  )}

                  <StatCard>
                    <StatIcon>
                      <Target size={18} />
                    </StatIcon>
                    <StatContent>
                      <StatValue>Active</StatValue>
                      <StatLabel>Status</StatLabel>
                      <StatChange>Online</StatChange>
                    </StatContent>
                  </StatCard>
                </StatsGrid>

                {/* Content Grid */}
                <ContentGrid>
                  {/* Recent Activity */}
                  <Section>
                    <SectionHeader>
                      <SectionTitle>
                        <Activity size={18} />
                        Recent Activity
                      </SectionTitle>
                      <ViewAllLink>View all</ViewAllLink>
                    </SectionHeader>
                    <ActivityList>
                      <ActivityItem>
                        <ActivityIcon>
                          <Settings size={14} />
                        </ActivityIcon>
                        <ActivityContent>
                          <ActivityTitle>Portfolio created</ActivityTitle>
                          <ActivityDescription>Your {currentConfig?.title?.toLowerCase()} is now active</ActivityDescription>
                          <ActivityMetadata>
                            <MetadataTag>Portfolio</MetadataTag>
                          </ActivityMetadata>
                        </ActivityContent>
                        <ActivityTime>Recently</ActivityTime>
                      </ActivityItem>
                    </ActivityList>
                  </Section>

                  {/* Quick Actions */}
                  <Section>
                    <SectionHeader>
                      <SectionTitle>
                        <Target size={18} />
                        Quick Actions
                      </SectionTitle>
                    </SectionHeader>
                    <QuickActionGrid>
                      <QuickAction as="a" href="/dashboard/profile">
                        <QuickActionIcon>
                          <Settings size={20} />
                        </QuickActionIcon>
                        <QuickActionContent>
                          <QuickActionTitle>Portfolio Hub</QuickActionTitle>
                          <QuickActionDescription>Manage & edit</QuickActionDescription>
                        </QuickActionContent>
                        <QuickActionArrow>
                          <ChevronRight size={14} />
                        </QuickActionArrow>
                      </QuickAction>

                      {isViewAvailable('gallery') && (
                        <QuickAction onClick={() => handleViewChange('gallery')}>
                          <QuickActionIcon>
                            <GalleryIcon size={20} />
                          </QuickActionIcon>
                          <QuickActionContent>
                            <QuickActionTitle>Gallery</QuickActionTitle>
                            <QuickActionDescription>View artwork</QuickActionDescription>
                          </QuickActionContent>
                          <QuickActionArrow>
                            <ChevronRight size={14} />
                          </QuickActionArrow>
                        </QuickAction>
                      )}

                      <QuickAction 
                        as="a" 
                        href={`/portfolio/${portfolio!.id}`} 
                        target="_blank"
                      >
                        <QuickActionIcon>
                          <ExternalLink size={20} />
                        </QuickActionIcon>
                        <QuickActionContent>
                          <QuickActionTitle>View Public</QuickActionTitle>
                          <QuickActionDescription>See your portfolio</QuickActionDescription>
                        </QuickActionContent>
                        <QuickActionArrow>
                          <ExternalLink size={14} />
                        </QuickActionArrow>
                      </QuickAction>
                    </QuickActionGrid>
                  </Section>
                </ContentGrid>
              </>
            )}

            {/* Gallery View */}
            {activeView === 'gallery' && isViewAvailable('gallery') && (
              <GalleryView 
                galleryItems={galleryPieces}
                portfolioId={portfolio!.id}
              />
            )}

            {/* Learning View */}
            {activeView === 'learning' && isViewAvailable('learning') && (
              <LearningView 
                conceptProgress={[]} // TODO: Get real concept data
                stats={mockStats}
              />
            )}

            {/* Analytics View */}
            {activeView === 'analytics' && (
              <AnalyticsView 
                stats={mockStats}
                achievements={mockAchievements}
                formatTimeAgo={formatTimeAgo}
              />
            )}
          </DashboardContent>
        </Container>
      </PageWrapper>
    </ProtectedRoute>
  );
}

// Styled Components - Matching Layout Design System
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  font-family: 'Work Sans', sans-serif;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
`;

const LoadingCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  color: #666;
`;

const LoadingText = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.875rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
`;

const ErrorCard = styled.div`
  text-align: center;
  padding: 2rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  max-width: 400px;
`;

const ErrorIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 400;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  font-family: 'Cormorant Garamond', serif;
`;

const ErrorMessage = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

const RetryButton = styled.button`
  background: white;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.75rem 1.5rem;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2c2c2c;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
  }
`;

const CreatePortfolioSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
`;

const WelcomeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  color: #666;
  flex-shrink: 0;
`;

const WelcomeContent = styled.div`
  flex: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 0.5px;
`;

const WelcomeDescription = styled.p`
  color: #666;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
`;

const PortfolioTypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const PortfolioTypeCard = styled.button`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #2c2c2c;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  color: #666;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
`;

const CardDescription = styled.p`
  color: #666;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const CardFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.8125rem;
  
  &::before {
    content: '✓';
    color: #2c2c2c;
    font-weight: bold;
  }
`;

const CreateButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  color: #2c2c2c;
  font-size: 0.875rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  margin-top: auto;
  
  ${PortfolioTypeCard}:hover & {
    background: #2c2c2c;
    color: white;
    border-color: #2c2c2c;
  }
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const WelcomeSection = styled.div``;

const WelcomeSubtitle = styled.p`
  color: #666;
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
`;

const ViewToggle = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.$active ? '#2c2c2c' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  border-right: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 0.8125rem;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.3s ease;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background: ${props => props.$active ? '#2c2c2c' : '#f8f8f8'};
    color: ${props => props.$active ? 'white' : '#2c2c2c'};
  }
`;

const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainStatCard = styled.div`
  padding: 2rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  color: #666;
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 400;
  color: #666;
  margin: 0 0 0.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0 0 0.25rem 0;
  font-family: 'Cormorant Garamond', serif;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

const StatProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: #2c2c2c;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatChange = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 0.8125rem;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #2c2c2c;
  }
`;

const ActivityList = styled.div`
  padding: 1.5rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const ActivityIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  color: #666;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0 0 0.25rem 0;
`;

const ActivityDescription = styled.p`
  font-size: 0.8125rem;
  color: #666;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
`;

const ActivityMetadata = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const MetadataTag = styled.span`
  font-size: 0.6875rem;
  padding: 0.25rem 0.5rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #666;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

const QuickActionGrid = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const QuickAction = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    background: #f8f8f8;
    border-color: #2c2c2c;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const QuickActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  color: #666;
  flex-shrink: 0;
`;

const QuickActionContent = styled.div`
  flex: 1;
  text-align: left;
`;

const QuickActionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 400;
  color: #2c2c2c;
  margin-bottom: 0.125rem;
  font-family: 'Cormorant Garamond', serif;
`;

const QuickActionDescription = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

const QuickActionArrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  flex-shrink: 0;
`;