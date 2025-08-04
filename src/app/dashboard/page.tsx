// src/app/dashboard/page.tsx - Enhanced with Thrive Integration
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
  Zap,
  Target,
  ArrowRight,
  Clock,
  Briefcase
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
  QuickActionArrow
} from '@/components/dashboard/dashboardStyles';

// Import additional styled components for skills integration
import styled from 'styled-components';
import { theme } from '@/styles/theme';

// View components
import { GalleryView } from '@/components/dashboard/views/GalleryView';
import { LearningView } from '@/components/dashboard/views/learningView';
import { AnalyticsView } from '@/components/dashboard/views/analyticsView';

// Skills data interface
interface SkillSummary {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  marketDemand: number;
  lastPracticed: string;
  trending: boolean;
}

const SkillsHighlightCard = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bfdbfe;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  position: relative;
  overflow: hidden;
`;

const SkillsHighlightHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const SkillsHighlightTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const SkillsHighlightSubtitle = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const SkillCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
    border-color: #3b82f6;
  }
`;

const SkillCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const SkillName = styled.h4`
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const SkillLevel = styled.span`
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.semibold};
  color: #3b82f6;
`;

const SkillProgress = styled.div`
  height: 6px;
  background: ${theme.colors.border.light};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: ${theme.spacing.xs};
`;

const SkillProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  transition: width 0.5s ease;
`;

const SkillMetrics = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
`;

const IntegrationBanner = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const IntegrationIcon = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  box-shadow: ${theme.shadows.sm};
`;

const IntegrationContent = styled.div`
  flex: 1;
`;

const IntegrationTitle = styled.h4`
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.semibold};
  color: #92400e;
  margin: 0 0 2px 0;
`;

const IntegrationText = styled.p`
  font-size: ${theme.typography.sizes.xs};
  color: #78350f;
  margin: 0;
`;

const IntegrationAction = styled.button`
  background: white;
  color: #92400e;
  border: 1px solid #fbbf24;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  transition: all 0.2s ease;

  &:hover {
    background: #fef3c7;
    transform: translateY(-1px);
  }
`;



export default function EnhancedDashboard() {
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

  // Skills state for Thrive integration
  const [topSkills] = useState<SkillSummary[]>([
    {
      id: '1',
      name: 'React Development',
      category: 'Technical',
      proficiency: 78,
      marketDemand: 92,
      lastPracticed: '2 days ago',
      trending: true
    },
    {
      id: '2',
      name: 'UI/UX Design',
      category: 'Creative',
      proficiency: 65,
      marketDemand: 87,
      lastPracticed: '1 week ago',
      trending: false
    },
    {
      id: '3',
      name: 'Data Analysis',
      category: 'Analytical',
      proficiency: 82,
      marketDemand: 95,
      lastPracticed: 'Today',
      trending: true
    }
  ]);

  // Check if user has skills data
  const hasSkillsData = topSkills.length > 0;
  const averageSkillProficiency = topSkills.reduce((acc, skill) => acc + skill.proficiency, 0) / topSkills.length;
  const trendingSkillsCount = topSkills.filter(skill => skill.trending).length;

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
            <RetryButton onClick={() => window.location.reload()}>Try Again</RetryButton>
          </ErrorContainer>
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageWrapper>
        <Container>
          {/* Header Section */}
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
              
              {/* View Toggle */}
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
                  {/* Skills Integration Banner */}
                  {hasSkillsData && (
                    <IntegrationBanner>
                      <IntegrationIcon>
                        <Sparkles size={20} />
                      </IntegrationIcon>
                      <IntegrationContent>
                        <IntegrationTitle>Skills Development Available</IntegrationTitle>
                        <IntegrationText>
                          Track your professional growth with {trendingSkillsCount} trending skills
                        </IntegrationText>
                      </IntegrationContent>
                      <IntegrationAction as="a" href="/dashboard/thrive">
                        Explore Skills
                        <ArrowRight size={14} />
                      </IntegrationAction>
                    </IntegrationBanner>
                  )}

                  {/* Enhanced Stats Grid with Skills */}
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

                    {hasSkillsData && (
                      <StatCard>
                        <StatIcon $color="#3b82f6">
                          <Target size={18} />
                        </StatIcon>
                        <StatContent>
                          <StatValue>{Math.round(averageSkillProficiency)}%</StatValue>
                          <StatLabel>Skill Level</StatLabel>
                          <StatChange $positive>{trendingSkillsCount} trending</StatChange>
                        </StatContent>
                      </StatCard>
                    )}

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
                  </StatsGrid>

                  {/* Skills Highlight Section */}
                  {hasSkillsData && (
                    <SkillsHighlightCard>
                      <SkillsHighlightHeader>
                        <div>
                          <SkillsHighlightTitle>Your Top Skills</SkillsHighlightTitle>
                          <SkillsHighlightSubtitle>
                            Monitor your professional development and market alignment
                          </SkillsHighlightSubtitle>
                        </div>
                        <ViewAllLink as="a" href="/dashboard/thrive">
                          View all skills
                        </ViewAllLink>
                      </SkillsHighlightHeader>
                      
                      <SkillsGrid>
                        {topSkills.map(skill => (
                          <SkillCard key={skill.id}>
                            <SkillCardHeader>
                              <SkillName>{skill.name}</SkillName>
                              <SkillLevel>{skill.proficiency}%</SkillLevel>
                            </SkillCardHeader>
                            <SkillProgress>
                              <SkillProgressFill $percentage={skill.proficiency} />
                            </SkillProgress>
                            <SkillMetrics>
                              <span>{skill.marketDemand}% demand</span>
                              <span>{skill.lastPracticed}</span>
                            </SkillMetrics>
                          </SkillCard>
                        ))}
                      </SkillsGrid>
                    </SkillsHighlightCard>
                  )}

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

                    {/* Enhanced Quick Actions */}
                    <Section>
                      <SectionHeader>
                        <SectionTitle>
                          <Zap size={18} />
                          Quick Actions
                        </SectionTitle>
                      </SectionHeader>
                      <QuickActionGrid>
                        {/* Skills Development */}
                        <QuickAction as="a" href="/dashboard/thrive">
                          <QuickActionIcon $color="#3b82f6">
                            <Target size={20} />
                          </QuickActionIcon>
                          <QuickActionContent>
                            <QuickActionTitle>Skills Hub</QuickActionTitle>
                            <QuickActionDescription>Track & develop</QuickActionDescription>
                          </QuickActionContent>
                          <QuickActionArrow>
                            <ChevronRight size={14} />
                          </QuickActionArrow>
                        </QuickAction>

                        {/* Market Intelligence */}
                        <QuickAction as="a" href="/dashboard/market">
                          <QuickActionIcon $color="#f59e0b">
                            <Briefcase size={20} />
                          </QuickActionIcon>
                          <QuickActionContent>
                            <QuickActionTitle>Market Intel</QuickActionTitle>
                            <QuickActionDescription>Opportunities</QuickActionDescription>
                          </QuickActionContent>
                          <QuickActionArrow>
                            <ChevronRight size={14} />
                          </QuickActionArrow>
                        </QuickAction>

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

                        <QuickAction as="a" href="/dashboard/profile">
                          <QuickActionIcon $color="#6b7280">
                            <Settings size={20} />
                          </QuickActionIcon>
                          <QuickActionContent>
                            <QuickActionTitle>Portfolio</QuickActionTitle>
                            <QuickActionDescription>Manage & edit</QuickActionDescription>
                          </QuickActionContent>
                          <QuickActionArrow>
                            <ChevronRight size={14} />
                          </QuickActionArrow>
                        </QuickAction>
                      </QuickActionGrid>
                    </Section>
                  </ContentGrid>
                </>
              )}

              {/* Gallery View - Only shows when gallery tab is active */}
              {state.activeView === 'gallery' && (
                <GalleryView 
                  galleryItems={state.galleryItems}
                  onUpload={() => {/* Handle upload */}}
                />
              )}

              {/* Learning View - Only shows when learning tab is active */}
              {state.activeView === 'learning' && (
                <LearningView 
                  conceptProgress={state.conceptProgress}
                  stats={state.stats}
                />
              )}

              {/* Analytics View - Only shows when analytics tab is active */}
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