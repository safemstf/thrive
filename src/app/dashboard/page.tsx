// src/app/dashboard/page.tsx - Elegant & Refined Version
"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { useAuth } from '@/providers/authProvider';
import { useDashboardLogic, type DashboardState } from '@/components/dashboard/dashboardLogic';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  Image as GalleryIcon, 
  Shield,
  TrendingUp,
  Award,
  Users,
  Brush,
  Brain,
  Layers,
  ChevronRight,
  Activity,
  BookOpen,
  Camera,
  Code,
  Settings,
  Loader2,
  Sparkles,
  BarChart3,
  MessageSquare,
  Star,
  Zap
} from "lucide-react";

// Import refined styled components
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
  Badge,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  LoadingSubtext,
  ErrorContainer,
  ErrorIcon,
  ErrorTitle,
  ErrorMessage,
  RetryButton,
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
  CreateButton,
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
  SectionActions,
  ActionButton,
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
  EmptyStateCard,
  EmptyIcon,
  EmptyTitle,
  EmptyMessage
} from '@/components/dashboard/dashboardStyles';

// View components
import { GalleryView } from '@/components/dashboard/views/GalleryView';
import { LearningView } from '@/components/dashboard/views/learningView';
import { AnalyticsView } from '@/components/dashboard/views/analyticsView';

export default function DashboardOverview() {
  const { user } = useAuth();
  const {
    portfolioTypeConfig,
    fetchPortfolioData,
    fetchPortfolioContent,
    generateEnhancedActivity,
    generateAchievements,
    createPortfolio,
    formatTimeAgo
  } = useDashboardLogic();
  
  // State management
  const [state, setState] = useState<DashboardState>({
    portfolio: null,
    loading: true,
    activeView: 'overview',
    stats: {
      totalItems: 0,
      recentActivity: 0,
      completionRate: 0,
      weeklyGrowth: 0
    },
    recentActivity: [],
    galleryItems: [],
    conceptProgress: [],
    achievements: [],
    error: null
  });

  // Data fetching effect
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const portfolioData = await fetchPortfolioData();
        
        if (portfolioData) {
          const contentData = await fetchPortfolioContent(portfolioData);
          const activity = generateEnhancedActivity(portfolioData.kind);
          const achievements = generateAchievements();
          
          setState(prev => ({
            ...prev,
            portfolio: portfolioData,
            stats: contentData.stats,
            galleryItems: contentData.galleryItems,
            conceptProgress: contentData.conceptProgress,
            recentActivity: activity,
            achievements,
            loading: false
          }));
        } else {
          setState(prev => ({ ...prev, portfolio: null, loading: false }));
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    };

    loadDashboardData();
  }, [user, fetchPortfolioData, fetchPortfolioContent, generateEnhancedActivity, generateAchievements]);

  // Portfolio creation handler
  const handleCreatePortfolio = async (type: 'creative' | 'educational' | 'hybrid') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newPortfolio = await createPortfolio(type);
      const contentData = await fetchPortfolioContent(newPortfolio);
      const activity = generateEnhancedActivity(newPortfolio.kind);
      const achievements = generateAchievements();
      
      setState(prev => ({
        ...prev,
        portfolio: newPortfolio,
        stats: contentData.stats,
        galleryItems: contentData.galleryItems,
        conceptProgress: contentData.conceptProgress,
        recentActivity: activity,
        achievements,
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  // Retry handler
  const handleRetry = async () => {
    if (!user) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const portfolioData = await fetchPortfolioData();
      
      if (portfolioData) {
        const contentData = await fetchPortfolioContent(portfolioData);
        const activity = generateEnhancedActivity(portfolioData.kind);
        const achievements = generateAchievements();
        
        setState(prev => ({
          ...prev,
          portfolio: portfolioData,
          stats: contentData.stats,
          galleryItems: contentData.galleryItems,
          conceptProgress: contentData.conceptProgress,
          recentActivity: activity,
          achievements,
          loading: false
        }));
      } else {
        setState(prev => ({ ...prev, portfolio: null, loading: false }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  // View change handler
  const handleViewChange = (view: 'overview' | 'gallery' | 'learning' | 'analytics') => {
    setState(prev => ({ ...prev, activeView: view }));
  };

  // Loading state
  if (state.loading) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <LoadingContainer>
            <LoadingSpinner>
              <Loader2 className="animate-spin" size={48} />
            </LoadingSpinner>
            <LoadingText>Loading dashboard</LoadingText>
          </LoadingContainer>
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  // Error state
  if (state.error) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Something went wrong</ErrorTitle>
            <ErrorMessage>{state.error}</ErrorMessage>
            <RetryButton onClick={handleRetry}>Try Again</RetryButton>
          </ErrorContainer>
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageWrapper>
        <Container>
          {/* Refined Header Section */}
          <Header>
            <HeaderContent>
              <WelcomeSection>
                <WelcomeTitle>
                  {state.portfolio 
                    ? `${user?.name}'s Dashboard`
                    : `Welcome, ${user?.name}`
                  }
                </WelcomeTitle>
                <WelcomeSubtitle>
                  {state.portfolio 
                    ? portfolioTypeConfig[state.portfolio.kind as keyof typeof portfolioTypeConfig]?.title
                    : "Let's create your portfolio"
                  }
                </WelcomeSubtitle>
              </WelcomeSection>
              
              {/* Simplified View Toggle */}
              {state.portfolio && (
                <ViewToggle>
                  <ViewButton 
                    $active={state.activeView === 'overview'}
                    onClick={() => handleViewChange('overview')}
                  >
                    <LayoutDashboard size={16} />
                    Overview
                  </ViewButton>
                  {(state.portfolio.kind === 'creative' || state.portfolio.kind === 'hybrid') && (
                    <ViewButton 
                      $active={state.activeView === 'gallery'}
                      onClick={() => handleViewChange('gallery')}
                    >
                      <GalleryIcon size={16} />
                      Gallery
                    </ViewButton>
                  )}
                  {(state.portfolio.kind === 'educational' || state.portfolio.kind === 'hybrid') && (
                    <ViewButton 
                      $active={state.activeView === 'learning'}
                      onClick={() => handleViewChange('learning')}
                    >
                      <Brain size={16} />
                      Learning
                    </ViewButton>
                  )}
                  <ViewButton 
                    $active={state.activeView === 'analytics'}
                    onClick={() => handleViewChange('analytics')}
                  >
                    <BarChart3 size={16} />
                    Insights
                  </ViewButton>
                </ViewToggle>
              )}
            </HeaderContent>
          </Header>

          {/* Main Content */}
          {!state.portfolio ? (
            <CreatePortfolioSection>
              <CreateHeader>
                <CreateIcon>
                  <Sparkles size={28} />
                </CreateIcon>
                <CreateTitle>Create Portfolio</CreateTitle>
                <CreateDescription>
                  Choose your focus and start building your professional presence.
                </CreateDescription>
              </CreateHeader>

              <PortfolioTypes>
                {Object.entries(portfolioTypeConfig).map(([key, config]) => (
                  <PortfolioTypeCard key={key} onClick={() => handleCreatePortfolio(key as any)}>
                    <TypeHeader>
                      <TypeIcon $gradient={config.gradient}>
                        {key === 'creative' ? <Brush size={20} /> : 
                         key === 'educational' ? <Brain size={20} /> : 
                         <Layers size={20} />}
                      </TypeIcon>
                      <TypeTitle>{config.title}</TypeTitle>
                    </TypeHeader>
                    <TypeDescription>{config.description}</TypeDescription>
                    <TypeFeatures>
                      {key === 'creative' && (
                        <>
                          <Feature><GalleryIcon size={12} /> Visual showcase</Feature>
                          <Feature><Users size={12} /> Public galleries</Feature>
                          <Feature><Star size={12} /> Portfolio ratings</Feature>
                        </>
                      )}
                      {key === 'educational' && (
                        <>
                          <Feature><BookOpen size={12} /> Progress tracking</Feature>
                          <Feature><Award size={12} /> Achievements</Feature>
                          <Feature><TrendingUp size={12} /> Analytics</Feature>
                        </>
                      )}
                      {key === 'hybrid' && (
                        <>
                          <Feature><Layers size={12} /> Combined features</Feature>
                          <Feature><Brain size={12} /> Full tracking</Feature>
                          <Feature><Sparkles size={12} /> Enhanced tools</Feature>
                        </>
                      )}
                    </TypeFeatures>
                    <CreateButton $gradient={config.gradient}>
                      Create
                      <ChevronRight size={14} />
                    </CreateButton>
                  </PortfolioTypeCard>
                ))}
              </PortfolioTypes>
            </CreatePortfolioSection>
          ) : (
            <DashboardContent>
              {/* Overview View */}
              {state.activeView === 'overview' && (
                <>
                  {/* Simplified Stats Grid */}
                  <StatsGrid>
                    <MainStatCard>
                      <StatHeader>
                        <StatIcon $gradient={portfolioTypeConfig[state.portfolio.kind as keyof typeof portfolioTypeConfig]?.gradient}>
                          {state.portfolio.kind === 'creative' ? <Brush size={20} /> : 
                           state.portfolio.kind === 'educational' ? <Brain size={20} /> : 
                           <Layers size={20} />}
                        </StatIcon>
                        <div>
                          <StatTitle>Portfolio</StatTitle>
                          <StatValue>{state.stats.totalItems}</StatValue>
                          <StatLabel>Items</StatLabel>
                        </div>
                      </StatHeader>
                      <StatProgress>
                        <ProgressBar>
                          <ProgressFill $percentage={state.stats.completionRate} />
                        </ProgressBar>
                        <ProgressText>{state.stats.completionRate.toFixed(0)}% Complete</ProgressText>
                      </StatProgress>
                    </MainStatCard>

                    <StatCard>
                      <StatIcon $color="#f59e0b">
                        <Activity size={18} />
                      </StatIcon>
                      <StatContent>
                        <StatValue>{state.stats.recentActivity}</StatValue>
                        <StatLabel>Activity</StatLabel>
                        <StatChange $positive>+{state.stats.weeklyGrowth}%</StatChange>
                      </StatContent>
                    </StatCard>

                    {(state.portfolio.kind === 'creative' || state.portfolio.kind === 'hybrid') && (
                      <StatCard>
                        <StatIcon $color="#8b5cf6">
                          <GalleryIcon size={18} />
                        </StatIcon>
                        <StatContent>
                          <StatValue>{state.galleryItems.length}</StatValue>
                          <StatLabel>Gallery</StatLabel>
                          <StatChange $positive>+2 recent</StatChange>
                        </StatContent>
                      </StatCard>
                    )}

                    {(state.portfolio.kind === 'educational' || state.portfolio.kind === 'hybrid') && (
                      <StatCard>
                        <StatIcon $color="#3b82f6">
                          <BookOpenCheck size={18} />
                        </StatIcon>
                        <StatContent>
                          <StatValue>{state.conceptProgress.filter(c => c.status === 'completed').length}</StatValue>
                          <StatLabel>Completed</StatLabel>
                          <StatChange $positive>
                            {state.stats.averageScore ? `${state.stats.averageScore.toFixed(0)}%` : 'Keep going'}
                          </StatChange>
                        </StatContent>
                      </StatCard>
                    )}
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
                        {state.recentActivity.map(activity => (
                          <ActivityItem key={activity.id}>
                            <ActivityIcon $type={activity.type}>
                              {activity.type === 'gallery_upload' && <Camera size={14} />}
                              {activity.type === 'concept_complete' && <BookOpen size={14} />}
                              {activity.type === 'project_create' && <Code size={14} />}
                              {activity.type === 'achievement_unlock' && <Award size={14} />}
                              {activity.type === 'portfolio_update' && <Settings size={14} />}
                            </ActivityIcon>
                            <ActivityContent>
                              <ActivityTitle>{activity.title}</ActivityTitle>
                              <ActivityDescription>{activity.description}</ActivityDescription>
                              {activity.metadata && (
                                <ActivityMetadata>
                                  {activity.metadata.score && (
                                    <MetadataTag>{activity.metadata.score}%</MetadataTag>
                                  )}
                                  {activity.metadata.category && (
                                    <MetadataTag>{activity.metadata.category}</MetadataTag>
                                  )}
                                </ActivityMetadata>
                              )}
                            </ActivityContent>
                            <ActivityTime>{formatTimeAgo(activity.timestamp)}</ActivityTime>
                          </ActivityItem>
                        ))}
                      </ActivityList>
                    </Section>

                    {/* Quick Actions */}
                    <Section>
                      <SectionHeader>
                        <SectionTitle>
                          <Zap size={18} />
                          Quick Actions
                        </SectionTitle>
                      </SectionHeader>
                      <QuickActionGrid>
                        {(state.portfolio.kind === 'creative' || state.portfolio.kind === 'hybrid') && (
                          <QuickAction onClick={() => handleViewChange('gallery')}>
                            <QuickActionIcon $color="#8b5cf6">
                              <GalleryIcon size={20} />
                            </QuickActionIcon>
                            <QuickActionContent>
                              <QuickActionTitle>Gallery</QuickActionTitle>
                              <QuickActionDescription>Manage artwork</QuickActionDescription>
                            </QuickActionContent>
                            <QuickActionArrow>
                              <ChevronRight size={14} />
                            </QuickActionArrow>
                          </QuickAction>
                        )}

                        {(state.portfolio.kind === 'educational' || state.portfolio.kind === 'hybrid') && (
                          <QuickAction onClick={() => handleViewChange('learning')}>
                            <QuickActionIcon $color="#3b82f6">
                              <BookOpen size={20} />
                            </QuickActionIcon>
                            <QuickActionContent>
                              <QuickActionTitle>Learning</QuickActionTitle>
                              <QuickActionDescription>Continue progress</QuickActionDescription>
                            </QuickActionContent>
                            <QuickActionArrow>
                              <ChevronRight size={14} />
                            </QuickActionArrow>
                          </QuickAction>
                        )}

                        <QuickAction as="a" href="/dashboard/tutoring">
                          <QuickActionIcon $color="#10b981">
                            <MessageSquare size={20} />
                          </QuickActionIcon>
                          <QuickActionContent>
                            <QuickActionTitle>Tutoring</QuickActionTitle>
                            <QuickActionDescription>Get help</QuickActionDescription>
                          </QuickActionContent>
                          <QuickActionArrow>
                            <ChevronRight size={14} />
                          </QuickActionArrow>
                        </QuickAction>

                        <QuickAction as="a" href="/dashboard/profile">
                          <QuickActionIcon $color="#6b7280">
                            <Settings size={20} />
                          </QuickActionIcon>
                          <QuickActionContent>
                            <QuickActionTitle>Settings</QuickActionTitle>
                            <QuickActionDescription>Configure profile</QuickActionDescription>
                          </QuickActionContent>
                          <QuickActionArrow>
                            <ChevronRight size={14} />
                          </QuickActionArrow>
                        </QuickAction>

                        {user?.role === 'admin' && (
                          <QuickAction as="a" href="/dashboard/api-test">
                            <QuickActionIcon $color="#dc2626">
                              <Shield size={20} />
                            </QuickActionIcon>
                            <QuickActionContent>
                              <QuickActionTitle>Admin</QuickActionTitle>
                              <QuickActionDescription>System controls</QuickActionDescription>
                            </QuickActionContent>
                            <QuickActionArrow>
                              <ChevronRight size={14} />
                            </QuickActionArrow>
                          </QuickAction>
                        )}
                      </QuickActionGrid>
                    </Section>
                  </ContentGrid>
                </>
              )}

              {/* View Components */}
              {state.activeView === 'gallery' && (
                <GalleryView 
                  galleryItems={state.galleryItems}
                  onUpload={() => {/* Handle upload */}}
                />
              )}

              {state.activeView === 'learning' && (
                <LearningView 
                  conceptProgress={state.conceptProgress}
                  stats={state.stats}
                />
              )}

              {state.activeView === 'analytics' && (
                <AnalyticsView 
                  stats={state.stats}
                  achievements={state.achievements}
                  formatTimeAgo={formatTimeAgo}
                />
              )}
            </DashboardContent>
          )}
        </Container>
      </PageWrapper>
    </ProtectedRoute>
  );
}