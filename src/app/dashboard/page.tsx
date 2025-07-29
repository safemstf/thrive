// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useAuth } from '@/providers/authProvider';
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { useApiClient } from '@/lib/api-client';
import type { Portfolio } from '@/types/portfolio.types';
import type { GalleryPiece } from '@/types/gallery.types';
import { 
  Calendar, 
  LayoutDashboard, 
  BookOpenCheck, 
  Image as GalleryIcon, 
  Shield,
  Plus,
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
  CheckCircle,
  Clock,
  Loader2,
  Upload,
  Sparkles,
  BarChart3,
  MessageSquare,
  Star,
  ExternalLink,
  ArrowUpRight,
  Zap,
  Target
} from "lucide-react";

// Enhanced types
interface QuickStats {
  portfolioType?: string;
  totalItems: number;
  recentActivity: number;
  completionRate: number;
  weeklyGrowth: number;
  averageScore?: number;
}

interface RecentActivity {
  id: string;
  type: 'gallery_upload' | 'concept_complete' | 'project_create' | 'portfolio_update' | 'achievement_unlock';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  metadata?: {
    score?: number;
    category?: string;
    status?: string;
  };
}

interface ConceptProgress {
  conceptId: string;
  title?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated?: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic';
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const apiClient = useApiClient();
  
  // Enhanced state management
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'gallery' | 'learning' | 'analytics'>('overview');
  const [stats, setStats] = useState<QuickStats>({
    totalItems: 0,
    recentActivity: 0,
    completionRate: 0,
    weeklyGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryPiece[]>([]);
  const [conceptProgress, setConceptProgress] = useState<ConceptProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Memoized portfolio type configuration
  const portfolioTypeConfig = useMemo(() => ({
    creative: {
      icon: <Brush size={24} />,
      title: 'Creative Portfolio',
      description: 'Showcase artwork, designs, and creative projects',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
    },
    educational: {
      icon: <Brain size={24} />,
      title: 'Educational Portfolio',
      description: 'Track learning progress and academic achievements',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
    },
    hybrid: {
      icon: <Layers size={24} />,
      title: 'Hybrid Portfolio',
      description: 'Combine creative works with educational progress',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)'
    }
  }), []);

  // Enhanced data fetching
  const fetchPortfolioData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const portfolioData = await apiClient.portfolio.getMyPortfolio();
      setPortfolio(portfolioData);
      
      if (portfolioData) {
        await fetchPortfolioContent(portfolioData);
      }
    } catch (error: any) {
      if (error?.status !== 404) {
        console.error('Error fetching portfolio:', error);
        setError('Failed to load portfolio data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, apiClient]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const fetchPortfolioContent = async (portfolio: Portfolio) => {
    try {
      let totalItems = 0;
      let completionRate = 0;
      let averageScore = 0;

      // Enhanced gallery content fetching
      if (portfolio.kind === 'creative' || portfolio.kind === 'hybrid') {
        try {
          const galleryResponse = await apiClient.gallery.getPieces({ limit: 20 });
          const pieces = Array.isArray(galleryResponse) ? galleryResponse : galleryResponse.pieces || [];
          setGalleryItems(pieces);
          totalItems += pieces.length;
        } catch (error) {
          console.log('No gallery data available');
          setGalleryItems([]);
        }
      }

      // Enhanced learning content fetching
      if (portfolio.kind === 'educational' || portfolio.kind === 'hybrid') {
        try {
          const conceptData = await apiClient.portfolio.getMyConcepts();
          const enhancedConcepts = (conceptData || []).map((concept: ConceptProgress, index: number) => ({
            ...concept,
            title: concept.title || `Concept ${index + 1}`,
            category: concept.category || 'General',
            difficulty: concept.difficulty || 'intermediate',
            lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }));
          
          setConceptProgress(enhancedConcepts);
          const completed = enhancedConcepts.filter((c: ConceptProgress) => c.status === 'completed').length;
          totalItems += enhancedConcepts.length;
          completionRate = enhancedConcepts.length > 0 ? (completed / enhancedConcepts.length) * 100 : 0;
          
          // Calculate average score
          const scoredConcepts = enhancedConcepts.filter((c: ConceptProgress) => c.score);
          averageScore = scoredConcepts.length > 0 
            ? scoredConcepts.reduce((sum: number, c: ConceptProgress) => sum + (c.score || 0), 0) / scoredConcepts.length 
            : 0;
        } catch (error) {
          console.log('No concept data available');
          setConceptProgress([]);
        }
      }

      setStats({
        portfolioType: portfolio.kind,
        totalItems,
        recentActivity: Math.floor(Math.random() * 10) + 3,
        completionRate,
        weeklyGrowth: Math.floor(Math.random() * 25) + 5,
        averageScore
      });

      generateEnhancedActivity(portfolio.kind);
      generateAchievements();
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
      setError('Failed to load some portfolio content.');
    }
  };

  const generateEnhancedActivity = (portfolioKind: string) => {
    const activities: RecentActivity[] = [];
    
    if (portfolioKind === 'creative' || portfolioKind === 'hybrid') {
      activities.push(
        {
          id: '1',
          type: 'gallery_upload',
          title: 'New artwork uploaded',
          description: 'Added "Digital Landscape #47" to gallery',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: <Camera size={16} />,
          metadata: { category: 'Digital Art' }
        },
        {
          id: '4',
          type: 'achievement_unlock',
          title: 'Achievement unlocked!',
          description: 'Earned "Creative Streak" for 7 consecutive uploads',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          icon: <Award size={16} />
        }
      );
    }
    
    if (portfolioKind === 'educational' || portfolioKind === 'hybrid') {
      activities.push(
        {
          id: '2',
          type: 'concept_complete',
          title: 'Concept mastered',
          description: 'Completed "Advanced Calculus - Derivatives" with 94% score',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          icon: <BookOpen size={16} />,
          metadata: { score: 94, category: 'Mathematics' }
        }
      );
    }
    
    activities.push(
      {
        id: '3',
        type: 'project_create',
        title: 'New project started',
        description: 'Began "React Portfolio Website" development',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: <Code size={16} />,
        metadata: { category: 'Web Development' }
      },
      {
        id: '5',
        type: 'portfolio_update',
        title: 'Portfolio updated',
        description: 'Refreshed bio and added new specializations',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        icon: <Settings size={16} />
      }
    );

    setRecentActivity(activities.slice(0, 5));
  };

  const generateAchievements = () => {
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Created your first portfolio',
        icon: <Sparkles size={16} />,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        rarity: 'common'
      },
      {
        id: '2',
        title: 'Learning Machine',
        description: 'Completed 10 learning concepts',
        icon: <Brain size={16} />,
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        rarity: 'rare'
      },
      {
        id: '3',
        title: 'Perfectionist',
        description: 'Achieved 95%+ on 5 concepts',
        icon: <Target size={16} />,
        unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        rarity: 'epic'
      }
    ];
    setAchievements(mockAchievements);
  };

  const createPortfolio = async (type: 'creative' | 'educational' | 'hybrid') => {
    try {
      setLoading(true);
      const newPortfolio = await apiClient.portfolio.create({
        title: `${user?.name}'s ${portfolioTypeConfig[type].title}`,
        bio: `Welcome to my ${type} portfolio. I'm excited to share my journey with you.`,
        visibility: 'public',
        specializations: [],
        tags: []
      });
      
      setPortfolio(newPortfolio);
      await fetchPortfolioContent(newPortfolio);
    } catch (error) {
      console.error('Error creating portfolio:', error);
      setError('Failed to create portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  // Enhanced gallery view
  const renderGalleryView = () => (
    <ContentSection>
      <SectionHeader>
        <SectionTitle>
          <GalleryIcon size={20} />
          Gallery Management
          <Badge>{galleryItems.length} pieces</Badge>
        </SectionTitle>
        <SectionActions>
          <ActionButton $primary>
            <Upload size={16} />
            Upload New
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
          </ActionButton>
        </SectionActions>
      </SectionHeader>
      
      <GalleryStats>
        <GalleryStatCard>
          <StatValue>{galleryItems.length}</StatValue>
          <StatLabel>Total Pieces</StatLabel>
        </GalleryStatCard>
        <GalleryStatCard>
          <StatValue>{galleryItems.filter(item => item.visibility === 'public').length}</StatValue>
          <StatLabel>Public</StatLabel>
        </GalleryStatCard>
        <GalleryStatCard>
          <StatValue>4.8</StatValue>
          <StatLabel>Avg. Rating</StatLabel>
        </GalleryStatCard>
      </GalleryStats>
      
      <GalleryGrid>
        {galleryItems.length > 0 ? (
          galleryItems.map(item => (
            <GalleryCard key={item.id}>
              <GalleryImageContainer>
                <GalleryImage src={item.imageUrl} alt={item.title} />
                <GalleryOverlay>
                  <GalleryAction><ExternalLink size={16} /></GalleryAction>
                  <GalleryAction><Settings size={16} /></GalleryAction>
                </GalleryOverlay>
              </GalleryImageContainer>
              <GalleryCardContent>
                <GalleryItemTitle>{item.title}</GalleryItemTitle>
                <GalleryItemMeta>
                  <CategoryTag>{item.category}</CategoryTag>
                  <VisibilityIndicator $public={item.visibility === 'public'}>
                    {item.visibility}
                  </VisibilityIndicator>
                </GalleryItemMeta>
              </GalleryCardContent>
            </GalleryCard>
          ))
        ) : (
          <EmptyStateCard>
            <EmptyIcon><GalleryIcon size={48} /></EmptyIcon>
            <EmptyTitle>Your gallery awaits</EmptyTitle>
            <EmptyMessage>Upload your first artwork to start building your creative portfolio</EmptyMessage>
            <ActionButton $primary>
              <Upload size={16} />
              Upload first piece
            </ActionButton>
          </EmptyStateCard>
        )}
      </GalleryGrid>
    </ContentSection>
  );

  // Enhanced learning view
  const renderLearningView = () => (
    <ContentSection>
      <SectionHeader>
        <SectionTitle>
          <Brain size={20} />
          Learning Dashboard
          <Badge>{conceptProgress.filter(c => c.status === 'completed').length} completed</Badge>
        </SectionTitle>
        <SectionActions>
          <ActionButton $primary>
            <BookOpen size={16} />
            Explore Concepts
          </ActionButton>
        </SectionActions>
      </SectionHeader>

      <LearningStats>
        <LearningStatCard>
          <StatIcon><BookOpen size={24} /></StatIcon>
          <div>
            <StatValue>{conceptProgress.length}</StatValue>
            <StatLabel>Total Concepts</StatLabel>
          </div>
        </LearningStatCard>
        <LearningStatCard>
          <StatIcon><CheckCircle size={24} /></StatIcon>
          <div>
            <StatValue>{conceptProgress.filter(c => c.status === 'completed').length}</StatValue>
            <StatLabel>Completed</StatLabel>
          </div>
        </LearningStatCard>
        <LearningStatCard>
          <StatIcon><TrendingUp size={24} /></StatIcon>
          <div>
            <StatValue>{stats.averageScore?.toFixed(0) || 0}%</StatValue>
            <StatLabel>Avg. Score</StatLabel>
          </div>
        </LearningStatCard>
        <LearningStatCard>
          <StatIcon><Zap size={24} /></StatIcon>
          <div>
            <StatValue>{conceptProgress.filter(c => c.status === 'in-progress').length}</StatValue>
            <StatLabel>In Progress</StatLabel>
          </div>
        </LearningStatCard>
      </LearningStats>
      
      <ConceptGrid>
        {conceptProgress.length > 0 ? (
          conceptProgress.slice(0, 8).map(concept => (
            <ConceptCard key={concept.conceptId} $status={concept.status}>
              <ConceptHeader>
                <ConceptStatus $status={concept.status}>
                  {concept.status === 'completed' && <CheckCircle size={16} />}
                  {concept.status === 'in-progress' && <Clock size={16} />}
                  {concept.status === 'not-started' && <BookOpen size={16} />}
                </ConceptStatus>
                <DifficultyBadge $difficulty={concept.difficulty || 'intermediate'}>
                  {concept.difficulty || 'intermediate'}
                </DifficultyBadge>
              </ConceptHeader>
              <ConceptTitle>{concept.title || `Concept ${concept.conceptId}`}</ConceptTitle>
              <ConceptCategory>{concept.category || 'General'}</ConceptCategory>
              {concept.score && (
                <ScoreDisplay>
                  <ScoreBar>
                    <ScoreFill $percentage={concept.score} />
                  </ScoreBar>
                  <ScoreText>{concept.score}%</ScoreText>
                </ScoreDisplay>
              )}
              <ConceptActions>
                <ConceptAction>
                  {concept.status === 'not-started' ? 'Start' : 
                   concept.status === 'in-progress' ? 'Continue' : 'Review'}
                </ConceptAction>
              </ConceptActions>
            </ConceptCard>
          ))
        ) : (
          <EmptyStateCard>
            <EmptyIcon><Brain size={48} /></EmptyIcon>
            <EmptyTitle>Ready to learn?</EmptyTitle>
            <EmptyMessage>Explore our library of concepts and start your learning journey</EmptyMessage>
            <ActionButton $primary>
              <BookOpen size={16} />
              Browse concepts
            </ActionButton>
          </EmptyStateCard>
        )}
      </ConceptGrid>
    </ContentSection>
  );

  // Analytics view
  const renderAnalyticsView = () => (
    <ContentSection>
      <SectionHeader>
        <SectionTitle>
          <BarChart3 size={20} />
          Analytics & Insights
        </SectionTitle>
      </SectionHeader>

      <AnalyticsGrid>
        <AnalyticsCard>
          <CardHeader>
            <CardTitle>Weekly Growth</CardTitle>
            <GrowthIndicator $positive={stats.weeklyGrowth > 0}>
              <ArrowUpRight size={16} />
              +{stats.weeklyGrowth}%
            </GrowthIndicator>
          </CardHeader>
          <ChartPlaceholder>
            <BarChart3 size={32} />
            <span>Activity trend visualization</span>
          </ChartPlaceholder>
        </AnalyticsCard>

        <AnalyticsCard>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <AchievementsList>
            {achievements.map(achievement => (
              <AchievementItem key={achievement.id} $rarity={achievement.rarity}>
                <AchievementIcon $rarity={achievement.rarity}>
                  {achievement.icon}
                </AchievementIcon>
                <AchievementContent>
                  <AchievementTitle>{achievement.title}</AchievementTitle>
                  <AchievementDescription>{achievement.description}</AchievementDescription>
                  <AchievementTime>{formatTimeAgo(achievement.unlockedAt)}</AchievementTime>
                </AchievementContent>
              </AchievementItem>
            ))}
          </AchievementsList>
        </AnalyticsCard>
      </AnalyticsGrid>
    </ContentSection>
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <LoadingContainer>
            <LoadingSpinner>
              <Loader2 className="animate-spin" size={48} />
            </LoadingSpinner>
            <LoadingText>Loading your dashboard...</LoadingText>
            <LoadingSubtext>Gathering your latest progress and achievements</LoadingSubtext>
          </LoadingContainer>
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Something went wrong</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={fetchPortfolioData}>Try Again</RetryButton>
          </ErrorContainer>
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageWrapper>
        <Container>
          <Header>
            <HeaderContent>
              <HeaderInfo>
                <WelcomeSection>
                  <Avatar>
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <div>
                    <WelcomeTitle>Welcome back, {user?.name}! 👋</WelcomeTitle>
                    <WelcomeSubtitle>
                      {portfolio 
                        ? `Managing your ${portfolioTypeConfig[portfolio.kind as keyof typeof portfolioTypeConfig]?.title.toLowerCase()}`
                        : "Let's create your portfolio to get started"
                      }
                    </WelcomeSubtitle>
                  </div>
                </WelcomeSection>
              </HeaderInfo>
              {portfolio && (
                <HeaderActions>
                  <ViewToggle>
                    <ViewButton 
                      $active={activeView === 'overview'}
                      onClick={() => setActiveView('overview')}
                    >
                      <LayoutDashboard size={16} />
                      Overview
                    </ViewButton>
                    {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                      <ViewButton 
                        $active={activeView === 'gallery'}
                        onClick={() => setActiveView('gallery')}
                      >
                        <GalleryIcon size={16} />
                        Gallery
                      </ViewButton>
                    )}
                    {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                      <ViewButton 
                        $active={activeView === 'learning'}
                        onClick={() => setActiveView('learning')}
                      >
                        <Brain size={16} />
                        Learning
                      </ViewButton>
                    )}
                    <ViewButton 
                      $active={activeView === 'analytics'}
                      onClick={() => setActiveView('analytics')}
                    >
                      <BarChart3 size={16} />
                      Analytics
                    </ViewButton>
                  </ViewToggle>
                </HeaderActions>
              )}
            </HeaderContent>
          </Header>

          {!portfolio ? (
            <CreatePortfolioSection>
              <CreateHeader>
                <CreateIcon>
                  <Sparkles size={32} />
                </CreateIcon>
                <CreateTitle>Create Your Digital Portfolio</CreateTitle>
                <CreateDescription>
                  Choose the perfect portfolio type to showcase your unique journey, 
                  track your progress, and share your achievements with the world.
                </CreateDescription>
              </CreateHeader>

              <PortfolioTypes>
                {Object.entries(portfolioTypeConfig).map(([key, config]) => (
                  <PortfolioTypeCard key={key} onClick={() => createPortfolio(key as any)}>
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
                          <Feature><GalleryIcon size={14} /> Visual showcase</Feature>
                          <Feature><Users size={14} /> Public galleries</Feature>
                          <Feature><Star size={14} /> Portfolio ratings</Feature>
                        </>
                      )}
                      {key === 'educational' && (
                        <>
                          <Feature><BookOpen size={14} /> Progress tracking</Feature>
                          <Feature><Award size={14} /> Achievements</Feature>
                          <Feature><TrendingUp size={14} /> Learning analytics</Feature>
                        </>
                      )}
                      {key === 'hybrid' && (
                        <>
                          <Feature><Layers size={14} /> Best of both worlds</Feature>
                          <Feature><Brain size={14} /> Comprehensive tracking</Feature>
                          <Feature><Sparkles size={14} /> Enhanced features</Feature>
                        </>
                      )}
                    </TypeFeatures>
                    <CreateButton $gradient={config.gradient}>
                      Create {config.title}
                      <ChevronRight size={16} />
                    </CreateButton>
                  </PortfolioTypeCard>
                ))}
              </PortfolioTypes>
            </CreatePortfolioSection>
          ) : (
            <DashboardContent>
              {activeView === 'overview' && (
                <>
                  <StatsGrid>
                    <MainStatCard>
                      <StatHeader>
                        <StatIcon $gradient={portfolioTypeConfig[portfolio.kind as keyof typeof portfolioTypeConfig]?.gradient}>
                          {portfolioTypeConfig[portfolio.kind as keyof typeof portfolioTypeConfig]?.icon}
                        </StatIcon>
                        <div>
                          <StatTitle>Portfolio Overview</StatTitle>
                          <StatValue>{stats.totalItems}</StatValue>
                          <StatLabel>Total Items</StatLabel>
                        </div>
                      </StatHeader>
                      <StatProgress>
                        <ProgressBar>
                          <ProgressFill $percentage={stats.completionRate} />
                        </ProgressBar>
                        <ProgressText>{stats.completionRate.toFixed(0)}% Complete</ProgressText>
                      </StatProgress>
                    </MainStatCard>

                    <StatCard>
                      <StatIcon $color="#f59e0b"><Activity size={20} /></StatIcon>
                      <StatContent>
                        <StatValue>{stats.recentActivity}</StatValue>
                        <StatLabel>Recent Activity</StatLabel>
                        <StatChange $positive>+{stats.weeklyGrowth}% this week</StatChange>
                      </StatContent>
                    </StatCard>

                    {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                      <StatCard>
                        <StatIcon $color="#8b5cf6"><GalleryIcon size={20} /></StatIcon>
                        <StatContent>
                          <StatValue>{galleryItems.length}</StatValue>
                          <StatLabel>Gallery Pieces</StatLabel>
                          <StatChange $positive>+2 this week</StatChange>
                        </StatContent>
                      </StatCard>
                    )}

                    {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                      <StatCard>
                        <StatIcon $color="#3b82f6"><BookOpenCheck size={20} /></StatIcon>
                        <StatContent>
                          <StatValue>{conceptProgress.filter(c => c.status === 'completed').length}</StatValue>
                          <StatLabel>Completed</StatLabel>
                          <StatChange $positive>
                            {stats.averageScore ? `${stats.averageScore.toFixed(0)}% avg` : 'Keep going!'}
                          </StatChange>
                        </StatContent>
                      </StatCard>
                    )}
                  </StatsGrid>

                  <ContentGrid>
                    <ActivitySection>
                      <SectionHeader>
                        <SectionTitle>Recent Activity</SectionTitle>
                        <ViewAllLink>View all</ViewAllLink>
                      </SectionHeader>
                      <ActivityList>
                        {recentActivity.map(activity => (
                          <EnhancedActivityItem key={activity.id}>
                            <ActivityIcon $type={activity.type}>
                              {activity.icon}
                            </ActivityIcon>
                            <ActivityContent>
                              <ActivityTitle>{activity.title}</ActivityTitle>
                              <ActivityDescription>{activity.description}</ActivityDescription>
                              {activity.metadata && (
                                <ActivityMetadata>
                                  {activity.metadata.score && (
                                    <MetadataTag>Score: {activity.metadata.score}%</MetadataTag>
                                  )}
                                  {activity.metadata.category && (
                                    <MetadataTag>{activity.metadata.category}</MetadataTag>
                                  )}
                                </ActivityMetadata>
                              )}
                            </ActivityContent>
                            <ActivityTime>{formatTimeAgo(activity.timestamp)}</ActivityTime>
                          </EnhancedActivityItem>
                        ))}
                      </ActivityList>
                    </ActivitySection>

                    <QuickActionsSection>
                      <SectionHeader>
                        <SectionTitle>Quick Actions</SectionTitle>
                      </SectionHeader>
                      <QuickActionGrid>
                        {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                          <EnhancedQuickAction onClick={() => setActiveView('gallery')}>
                            <ActionIcon $color="#8b5cf6"><GalleryIcon size={24} /></ActionIcon>
                            <ActionContent>
                              <ActionTitle>Manage Gallery</ActionTitle>
                              <ActionDescription>Upload and organize artwork</ActionDescription>
                            </ActionContent>
                            <ActionArrow><ChevronRight size={16} /></ActionArrow>
                          </EnhancedQuickAction>
                        )}

                        {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                          <EnhancedQuickAction onClick={() => setActiveView('learning')}>
                            <ActionIcon $color="#3b82f6"><BookOpen size={24} /></ActionIcon>
                            <ActionContent>
                              <ActionTitle>Continue Learning</ActionTitle>
                              <ActionDescription>Explore concepts and courses</ActionDescription>
                            </ActionContent>
                            <ActionArrow><ChevronRight size={16} /></ActionArrow>
                          </EnhancedQuickAction>
                        )}

                        <EnhancedQuickAction as="a" href="/dashboard/tutoring">
                          <ActionIcon $color="#10b981"><MessageSquare size={24} /></ActionIcon>
                          <ActionContent>
                            <ActionTitle>Excel Tutoring</ActionTitle>
                            <ActionDescription>Get personalized help</ActionDescription>
                          </ActionContent>
                          <ActionArrow><ChevronRight size={16} /></ActionArrow>
                        </EnhancedQuickAction>

                        <EnhancedQuickAction as="a" href="/dashboard/profile">
                          <ActionIcon $color="#6b7280"><Settings size={24} /></ActionIcon>
                          <ActionContent>
                            <ActionTitle>Portfolio Settings</ActionTitle>
                            <ActionDescription>Customize your profile</ActionDescription>
                          </ActionContent>
                          <ActionArrow><ChevronRight size={16} /></ActionArrow>
                        </EnhancedQuickAction>

                        {user?.role === 'admin' && (
                          <EnhancedQuickAction as="a" href="/dashboard/api-test">
                            <ActionIcon $color="#dc2626"><Shield size={24} /></ActionIcon>
                            <ActionContent>
                              <ActionTitle>Admin Panel</ActionTitle>
                              <ActionDescription>Manage system settings</ActionDescription>
                            </ActionContent>
                            <ActionArrow><ChevronRight size={16} /></ActionArrow>
                          </EnhancedQuickAction>
                        )}
                      </QuickActionGrid>
                    </QuickActionsSection>
                  </ContentGrid>
                </>
              )}

              {activeView === 'gallery' && renderGalleryView()}
              {activeView === 'learning' && renderLearningView()}
              {activeView === 'analytics' && renderAnalyticsView()}
            </DashboardContent>
          )}
        </Container>
      </PageWrapper>
    </ProtectedRoute>
  );
}

// Enhanced Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
    opacity: 0.1;
    pointer-events: none;
    z-index: 0;
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
  @media (max-width: 768px) { 
    padding: 1rem; 
  }
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const WelcomeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
`;

const WelcomeTitle = styled.h1`
  font-size: 2.25rem;
  color: #111827;
  margin: 0;
  font-weight: 700;
  @media (max-width: 768px) { 
    font-size: 1.875rem; 
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(243, 244, 246, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 6px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ViewButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
      : 'transparent'
  };
  color: ${({ $active }) => $active ? '#3b82f6' : '#6b7280'};
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ $active }) => 
    $active 
      ? '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)' 
      : 'none'
  };
  transform: ${({ $active }) => $active ? 'translateY(-1px)' : 'none'};
  
  &:hover {
    background: ${({ $active }) => 
      $active 
        ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
        : 'rgba(255, 255, 255, 0.5)'
    };
    color: ${({ $active }) => $active ? '#3b82f6' : '#374151'};
  }
`;

const Badge = styled.span`
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  margin-left: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
`;

const LoadingSpinner = styled.div`
  .animate-spin {
    animation: spin 1s linear infinite;
    color: #3b82f6;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.h2`
  font-size: 1.5rem;
  color: #374151;
  font-weight: 600;
  margin: 0;
`;

const LoadingSubtext = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  color: #dc2626;
  margin: 0;
`;

const ErrorMessage = styled.p`
  color: #6b7280;
  margin: 0;
`;

const RetryButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const CreatePortfolioSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 4rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const CreateHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const CreateIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 50%;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
`;

const CreateTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CreateDescription = styled.p`
  font-size: 1.25rem;
  color: #64748b;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
`;

const PortfolioTypes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PortfolioTypeCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 2.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
    transform: translateY(-8px);
    
    &::before {
      opacity: 1;
    }
  }
`;

const TypeHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const TypeIcon = styled.div<{ $gradient: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: ${props => props.$gradient};
  border-radius: 20px;
  color: white;
  margin-bottom: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
`;

const TypeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  text-align: center;
`;

const TypeDescription = styled.p`
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  text-align: center;
`;

const TypeFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #475569;
  
  svg {
    color: #3b82f6;
  }
`;

const CreateButton = styled.button<{ $gradient: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: ${props => props.$gradient};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainStatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatIcon = styled.div<{ $color?: string; $gradient?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => props.$gradient || `${props.$color}20`};
  color: ${props => props.$gradient ? 'white' : props.$color};
  border-radius: 12px;
  box-shadow: ${props => props.$gradient ? '0 4px 15px rgba(0, 0, 0, 0.1)' : 'none'};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.25rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-weight: 600;
  margin-top: 0.25rem;
`;

const StatProgress = styled.div`
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ProgressText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ActivitySection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const QuickActionsSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ViewAllLink = styled.a`
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    color: #2563eb;
  }
`;

const SectionActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: ${props => props.$primary 
    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
    : 'rgba(243, 244, 246, 0.8)'
  };
  color: ${props => props.$primary ? 'white' : '#374151'};
  border: 1px solid ${props => props.$primary ? 'transparent' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${props => props.$primary 
      ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' 
      : 'rgba(229, 231, 235, 0.8)'
    };
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EnhancedActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  
  &:hover {
    background: rgba(248, 250, 252, 0.8);
    border-color: #e2e8f0;
    transform: translateX(4px);
  }
`;

const ActivityIcon = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${props => {
    switch (props.$type) {
      case 'gallery_upload': return 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
      case 'concept_complete': return 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';
      case 'project_create': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'achievement_unlock': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const ActivityDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 0.5rem;
`;

const ActivityMetadata = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const MetadataTag = styled.span`
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 500;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  flex-shrink: 0;
`;

const QuickActionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const EnhancedQuickAction = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  
  &:hover {
    border-color: #3b82f6;
    background: rgba(248, 250, 252, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }
`;

const ActionIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  border-radius: 12px;
  transition: all 0.3s ease;
  
  ${EnhancedQuickAction}:hover & {
    background: ${props => `${props.$color}25`};
    transform: scale(1.05);
  }
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const ActionDescription = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
`;

const ActionArrow = styled.div`
  color: #9ca3af;
  transition: all 0.3s ease;
  
  ${EnhancedQuickAction}:hover & {
    color: #3b82f6;
    transform: translateX(4px);
  }
`;

const ContentSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

// Gallery Components
const GalleryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const GalleryStatCard = styled.div`
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(226, 232, 240, 0.5);
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
`;

const GalleryCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.5);
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    border-color: #3b82f6;
  }
`;

const GalleryImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  
  ${GalleryCard}:hover & {
    transform: scale(1.05);
  }
`;

const GalleryOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${GalleryCard}:hover & {
    opacity: 1;
  }
`;

const GalleryAction = styled.button`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const GalleryCardContent = styled.div`
  padding: 1.25rem;
`;

const GalleryItemTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const GalleryItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const CategoryTag = styled.span`
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
`;

const VisibilityIndicator = styled.span<{ $public: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$public ? '#059669' : '#6b7280'};
  font-weight: 500;
  text-transform: capitalize;
`;

// Learning Components
const LearningStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const LearningStatCard = styled.div`
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.5);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  }
`;

const ConceptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ConceptCard = styled.div<{ $status: string }>`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      default: return '#e5e7eb';
    }
  }};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.$status) {
        case 'completed': return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
        case 'in-progress': return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
        default: return 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 100%)';
      }
    }};
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

const ConceptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ConceptStatus = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#d1fae5';
      case 'in-progress': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#065f46';
      case 'in-progress': return '#92400e';
      default: return '#6b7280';
    }
  }};
`;

const DifficultyBadge = styled.span<{ $difficulty: string }>`
  background: ${props => {
    switch (props.$difficulty) {
      case 'beginner': return '#dbeafe';
      case 'intermediate': return '#fef3c7';
      case 'advanced': return '#fce7f3';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$difficulty) {
      case 'beginner': return '#1e40af';
      case 'intermediate': return '#92400e';
      case 'advanced': return '#be185d';
      default: return '#6b7280';
    }
  }};
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  text-transform: capitalize;
`;

const ConceptTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const ConceptCategory = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const ScoreDisplay = styled.div`
  margin-bottom: 1rem;
`;

const ScoreBar = styled.div`
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ScoreFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.8s ease;
`;

const ScoreText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  font-weight: 600;
`;

const ConceptActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ConceptAction = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  }
`;

// Analytics Components
const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const AnalyticsCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(226, 232, 240, 0.5);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const GrowthIndicator = styled.div<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-size: 0.875rem;
  font-weight: 600;
`;

const ChartPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 2px dashed #d1d5db;
  color: #6b7280;
  text-align: center;
  
  span {
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }
`;

const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AchievementItem = styled.div<{ $rarity: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => {
    switch (props.$rarity) {
      case 'epic': return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
      case 'rare': return 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)';
      default: return 'rgba(248, 250, 252, 0.8)';
    }
  }};
  border-radius: 12px;
  border: 1px solid ${props => {
    switch (props.$rarity) {
      case 'epic': return '#f59e0b';
      case 'rare': return '#8b5cf6';
      default: return '#e5e7eb';
    }
  }};
`;

const AchievementIcon = styled.div<{ $rarity: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$rarity) {
      case 'epic': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'rare': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const AchievementContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AchievementTitle = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const AchievementDescription = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 0.25rem;
`;

const AchievementTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
`;

// Empty State Components
const EmptyStateCard = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 16px;
  border: 2px dashed #d1d5db;
`;

const EmptyIcon = styled.div`
  color: #9ca3af;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

const EmptyMessage = styled.p`
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  max-width: 400px;
`;