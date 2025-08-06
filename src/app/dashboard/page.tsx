// src/app/dashboard/page.tsx - Fully integrated with view switching
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  ExternalLink
} from "lucide-react";

// Import existing styled components
import {
  PageWrapper,
  Container,
  Header,
  HeaderContent,
  WelcomeSection,
  WelcomeTitle,
  WelcomeSubtitle,
  ViewToggle,
  ViewButton,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorIcon,
  ErrorTitle,
  ErrorMessage,
  RetryButton,
  DashboardContent,
  StatsGrid,
  MainStatCard,
  StatCard,
  StatHeader,
  StatIcon,
  StatContent,
  StatTitle,
  StatValue,
  StatLabel,
  StatChange,
  StatProgress,
  ProgressBar,
  ProgressFill,
  ProgressText,
  ContentGrid,
  Section,
  SectionHeader,
  SectionTitle,
  ViewAllLink,
  ActivityList,
  ActivityItem,
  ActivityIcon,
  ActivityContent,
  ActivityTitle,
  ActivityDescription,
  ActivityMetadata,
  MetadataTag,
  ActivityTime,
  QuickActionGrid,
  QuickAction,
  QuickActionIcon,
  QuickActionContent,
  QuickActionTitle,
  QuickActionDescription,
  QuickActionArrow,
  CreatePortfolioSection,
  CreateHeader,
  CreateIcon,
  CreateTitle,
  CreateDescription,
  PortfolioTypes,
  PortfolioTypeCard,
  TypeHeader,
  TypeIcon,
  TypeTitle,
  TypeDescription,
  TypeFeatures,
  Feature,
  CreateButton
} from '@/components/dashboard/dashboardStyles';

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
            <LoadingSpinner>
              <Loader2 className="animate-spin" size={48} />
            </LoadingSpinner>
            <LoadingText>Loading dashboard...</LoadingText>
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
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Something went wrong</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={() => window.location.reload()}>Try Again</RetryButton>
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
              <CreateHeader>
                <CreateIcon>
                  <Sparkles size={40} />
                </CreateIcon>
                <CreateTitle>Welcome to Your Dashboard</CreateTitle>
                <CreateDescription>
                  Create your first portfolio to start tracking your professional journey and showcase your work.
                </CreateDescription>
              </CreateHeader>

              <PortfolioTypes>
                {Object.entries(PORTFOLIO_CONFIG).map(([key, config]) => (
                  <PortfolioTypeCard 
                    key={key}
                    onClick={() => router.push(`/dashboard/profile?create=${key}`)}
                  >
                    <TypeHeader>
                      <TypeIcon $gradient={config.gradient}>
                        {config.icon}
                      </TypeIcon>
                      <TypeTitle>{config.title}</TypeTitle>
                    </TypeHeader>
                    <TypeDescription>{config.description}</TypeDescription>
                    <TypeFeatures>
                      {key === 'creative' && (
                        <>
                          <Feature><span>✓</span> Gallery showcase</Feature>
                          <Feature><span>✓</span> Visual projects</Feature>
                        </>
                      )}
                      {key === 'educational' && (
                        <>
                          <Feature><span>✓</span> Learning progress</Feature>
                          <Feature><span>✓</span> Achievement tracking</Feature>
                        </>
                      )}
                      {key === 'professional' && (
                        <>
                          <Feature><span>✓</span> Technical skills</Feature>
                          <Feature><span>✓</span> Project showcase</Feature>
                        </>
                      )}
                      {key === 'hybrid' && (
                        <>
                          <Feature><span>✓</span> Multi-disciplinary</Feature>
                          <Feature><span>✓</span> Flexible format</Feature>
                        </>
                      )}
                    </TypeFeatures>
                    <CreateButton $gradient={config.gradient}>
                      <Plus size={16} />
                      Create {config.title}
                    </CreateButton>
                  </PortfolioTypeCard>
                ))}
              </PortfolioTypes>
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
                      <StatIcon $gradient={currentConfig?.gradient}>
                        {currentConfig?.icon}
                      </StatIcon>
                      <div>
                        <StatTitle>Portfolio Items</StatTitle>
                        <StatValue>{galleryPieces.length}</StatValue>
                        <StatLabel>Total</StatLabel>
                      </div>
                    </StatHeader>
                    <StatProgress>
                      <ProgressBar>
                        <ProgressFill $percentage={75} />
                      </ProgressBar>
                      <ProgressText>Portfolio Active</ProgressText>
                    </StatProgress>
                  </MainStatCard>

                  <StatCard>
                    <StatIcon $color="#f59e0b">
                      <Activity size={18} />
                    </StatIcon>
                    <StatContent>
                      <StatValue>0</StatValue>
                      <StatLabel>Activity</StatLabel>
                      <StatChange $positive>Recent</StatChange>
                    </StatContent>
                  </StatCard>

                  {isViewAvailable('gallery') && (
                    <StatCard>
                      <StatIcon $color="#8b5cf6">
                        <GalleryIcon size={18} />
                      </StatIcon>
                      <StatContent>
                        <StatValue>{galleryPieces.length}</StatValue>
                        <StatLabel>Gallery</StatLabel>
                        <StatChange $positive>Items</StatChange>
                      </StatContent>
                    </StatCard>
                  )}

                  <StatCard>
                    <StatIcon $color="#3b82f6">
                      <Target size={18} />
                    </StatIcon>
                    <StatContent>
                      <StatValue>Active</StatValue>
                      <StatLabel>Status</StatLabel>
                      <StatChange $positive>Online</StatChange>
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
                        <ActivityIcon $type="portfolio_update">
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
                        <QuickActionIcon $color="#6b7280">
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
                          <QuickActionIcon $color="#8b5cf6">
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
                        <QuickActionIcon $color="#10b981">
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