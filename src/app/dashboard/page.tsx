// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
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
  Target,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
  Heart,
  Upload,
  Filter,
  Grid,
  List
} from "lucide-react";

// Simplified types
interface QuickStats {
  portfolioType?: string;
  totalItems: number;
  recentActivity: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'gallery_upload' | 'concept_complete' | 'project_create';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
}

interface ConceptProgress {
  conceptId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const apiClient = useApiClient();
  
  // State
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'gallery' | 'learning'>('overview');
  const [stats, setStats] = useState<QuickStats>({
    totalItems: 0,
    recentActivity: 0,
    completionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryPiece[]>([]);
  const [conceptProgress, setConceptProgress] = useState<ConceptProgress[]>([]);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Try to get existing portfolio
        const portfolioData = await apiClient.portfolio.getMyPortfolio();
        setPortfolio(portfolioData);
        
        if (portfolioData) {
          await fetchPortfolioContent(portfolioData);
        }
      } catch (error: any) {
        // If no portfolio exists (404), that's expected
        if (error?.status !== 404) {
          console.error('Error fetching portfolio:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [user, apiClient]);

  const fetchPortfolioContent = async (portfolio: Portfolio) => {
    try {
      let totalItems = 0;
      let completionRate = 0;

      // Fetch gallery content for creative/hybrid portfolios
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

      // Fetch learning content for educational/hybrid portfolios
      if (portfolio.kind === 'educational' || portfolio.kind === 'hybrid') {
        try {
          const conceptData = await apiClient.portfolio.getMyConcepts();
          setConceptProgress(conceptData || []);
          const completed = (conceptData || []).filter((c: ConceptProgress) => c.status === 'completed').length;
          totalItems += conceptData?.length || 0;
          completionRate = conceptData?.length > 0 ? (completed / conceptData.length) * 100 : 0;
        } catch (error) {
          console.log('No concept data available');
          setConceptProgress([]);
        }
      }

      setStats({
        portfolioType: portfolio.kind,
        totalItems,
        recentActivity: 5,
        completionRate
      });

      // Generate mock recent activity
      generateRecentActivity(portfolio.kind);
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
    }
  };

  const generateRecentActivity = (portfolioKind: string) => {
    const activities: RecentActivity[] = [];
    
    if (portfolioKind === 'creative' || portfolioKind === 'hybrid') {
      activities.push({
        id: '1',
        type: 'gallery_upload',
        title: 'New artwork uploaded',
        description: 'Added "Digital Landscape" to gallery',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: <Camera size={16} />
      });
    }
    
    if (portfolioKind === 'educational' || portfolioKind === 'hybrid') {
      activities.push({
        id: '2',
        type: 'concept_complete',
        title: 'Completed a concept',
        description: 'Finished "Advanced Calculus - Derivatives"',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        icon: <BookOpen size={16} />
      });
    }
    
    activities.push({
      id: '3',
      type: 'project_create',
      title: 'New project created',
      description: 'Started "React Portfolio Website"',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: <Code size={16} />
    });

    setRecentActivity(activities.slice(0, 3));
  };

  const createPortfolio = async (type: 'creative' | 'educational' | 'hybrid') => {
    try {
      const newPortfolio = await apiClient.portfolio.create({
        title: `${user?.name}'s Portfolio`,
        bio: '',
        visibility: 'public',
        specializations: [],
        tags: []
      });
      
      setPortfolio(newPortfolio);
      await fetchPortfolioContent(newPortfolio);
    } catch (error) {
      console.error('Error creating portfolio:', error);
    }
  };

  const getPortfolioTypeConfig = (type: string) => {
    switch (type) {
      case 'creative':
        return {
          icon: <Brush size={24} />,
          title: 'Creative Portfolio',
          description: 'Showcase artwork, designs, and creative projects',
          color: '#8b5cf6'
        };
      case 'educational':
        return {
          icon: <Brain size={24} />,
          title: 'Educational Portfolio',
          description: 'Track learning progress and academic achievements',
          color: '#3b82f6'
        };
      case 'hybrid':
        return {
          icon: <Layers size={24} />,
          title: 'Hybrid Portfolio',
          description: 'Combine creative works with educational progress',
          color: '#10b981'
        };
      default:
        return null;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Render gallery view
  const renderGalleryView = () => (
    <ContentSection>
      <SectionHeader>
        <SectionTitle>
          <GalleryIcon size={20} />
          Gallery Management
        </SectionTitle>
        <SectionActions>
          <ActionButton>
            <Upload size={16} />
            Upload
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
          </ActionButton>
        </SectionActions>
      </SectionHeader>
      
      <GalleryGrid>
        {galleryItems.length > 0 ? (
          galleryItems.map(item => (
            <GalleryItem key={item.id}>
              <GalleryImage src={item.imageUrl} alt={item.title} />
              <GalleryItemInfo>
                <GalleryItemTitle>{item.title}</GalleryItemTitle>
                <GalleryItemMeta>
                  <span>{item.category}</span>
                  <span>{item.visibility}</span>
                </GalleryItemMeta>
              </GalleryItemInfo>
            </GalleryItem>
          ))
        ) : (
          <EmptyState>
            <GalleryIcon size={48} />
            <EmptyMessage>No artwork uploaded yet</EmptyMessage>
            <ActionButton>
              <Upload size={16} />
              Upload your first piece
            </ActionButton>
          </EmptyState>
        )}
      </GalleryGrid>
    </ContentSection>
  );

  // Render learning view
  const renderLearningView = () => (
    <ContentSection>
      <SectionHeader>
        <SectionTitle>
          <Brain size={20} />
          Learning Progress
        </SectionTitle>
        <SectionActions>
          <ActionButton>
            <BookOpen size={16} />
            Browse Concepts
          </ActionButton>
        </SectionActions>
      </SectionHeader>

      <ProgressOverview>
        <ProgressCard>
          <ProgressValue>{conceptProgress.length}</ProgressValue>
          <ProgressLabel>Total Concepts</ProgressLabel>
        </ProgressCard>
        <ProgressCard>
          <ProgressValue>
            {conceptProgress.filter(c => c.status === 'completed').length}
          </ProgressValue>
          <ProgressLabel>Completed</ProgressLabel>
        </ProgressCard>
        <ProgressCard>
          <ProgressValue>{stats.completionRate.toFixed(0)}%</ProgressValue>
          <ProgressLabel>Progress</ProgressLabel>
        </ProgressCard>
      </ProgressOverview>
      
      <ConceptList>
        {conceptProgress.length > 0 ? (
          conceptProgress.slice(0, 6).map(concept => (
            <ConceptItem key={concept.conceptId}>
              <ConceptStatus $status={concept.status}>
                {concept.status === 'completed' && <CheckCircle size={16} />}
                {concept.status === 'in-progress' && <Clock size={16} />}
                {concept.status === 'not-started' && <BookOpen size={16} />}
              </ConceptStatus>
              <ConceptInfo>
                <ConceptTitle>Concept {concept.conceptId}</ConceptTitle>
                <ConceptMeta>
                  Status: {concept.status}
                  {concept.score && ` • Score: ${concept.score}%`}
                </ConceptMeta>
              </ConceptInfo>
            </ConceptItem>
          ))
        ) : (
          <EmptyState>
            <Brain size={48} />
            <EmptyMessage>No learning progress yet</EmptyMessage>
            <ActionButton>
              <BookOpen size={16} />
              Start learning
            </ActionButton>
          </EmptyState>
        )}
      </ConceptList>
    </ContentSection>
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <LoadingContainer>
            <Loader2 className="animate-spin" size={48} />
            <LoadingText>Loading your dashboard...</LoadingText>
          </LoadingContainer>
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
              <div>
                <Title>Welcome back, {user?.name}!</Title>
                <Subtitle>
                  {portfolio 
                    ? `Managing your ${portfolio.kind} portfolio`
                    : "Let's create your portfolio to get started"
                  }
                </Subtitle>
              </div>
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
                  </ViewToggle>
                </HeaderActions>
              )}
            </HeaderContent>
          </Header>

          {!portfolio ? (
            // Portfolio Creation Flow
            <CreatePortfolioSection>
              <CreateHeader>
                <CreateIcon>
                  <Plus size={32} />
                </CreateIcon>
                <CreateTitle>Create Your Portfolio</CreateTitle>
                <CreateDescription>
                  Choose the type of portfolio that best represents your journey and goals
                </CreateDescription>
              </CreateHeader>

              <PortfolioTypes>
                <PortfolioTypeCard onClick={() => createPortfolio('creative')}>
                  <TypeIcon $color="#8b5cf6">
                    <Brush size={32} />
                  </TypeIcon>
                  <TypeContent>
                    <TypeTitle>Creative Portfolio</TypeTitle>
                    <TypeDescription>
                      Perfect for artists, designers, and creative professionals. 
                      Showcase your artwork, design projects, and creative journey.
                    </TypeDescription>
                    <TypeFeatures>
                      <Feature><GalleryIcon size={14} /> Image galleries</Feature>
                      <Feature><Brush size={14} /> Portfolio management</Feature>
                      <Feature><Users size={14} /> Public showcase</Feature>
                    </TypeFeatures>
                  </TypeContent>
                  <CreateButton>
                    Create Creative Portfolio
                    <ChevronRight size={16} />
                  </CreateButton>
                </PortfolioTypeCard>

                <PortfolioTypeCard onClick={() => createPortfolio('educational')}>
                  <TypeIcon $color="#3b82f6">
                    <Brain size={32} />
                  </TypeIcon>
                  <TypeContent>
                    <TypeTitle>Educational Portfolio</TypeTitle>
                    <TypeDescription>
                      Ideal for students and lifelong learners. Track your academic 
                      progress, completed courses, and learning achievements.
                    </TypeDescription>
                    <TypeFeatures>
                      <Feature><BookOpen size={14} /> Progress tracking</Feature>
                      <Feature><Award size={14} /> Achievements</Feature>
                      <Feature><TrendingUp size={14} /> Learning analytics</Feature>
                    </TypeFeatures>
                  </TypeContent>
                  <CreateButton>
                    Create Educational Portfolio
                    <ChevronRight size={16} />
                  </CreateButton>
                </PortfolioTypeCard>

                <PortfolioTypeCard onClick={() => createPortfolio('hybrid')}>
                  <TypeIcon $color="#10b981">
                    <Layers size={32} />
                  </TypeIcon>
                  <TypeContent>
                    <TypeTitle>Hybrid Portfolio</TypeTitle>
                    <TypeDescription>
                      Best of both worlds. Combine your creative works with 
                      educational progress for a comprehensive portfolio.
                    </TypeDescription>
                    <TypeFeatures>
                      <Feature><GalleryIcon size={14} /> Creative showcase</Feature>
                      <Feature><Brain size={14} /> Learning progress</Feature>
                      <Feature><Layers size={14} /> Unified experience</Feature>
                    </TypeFeatures>
                  </TypeContent>
                  <CreateButton>
                    Create Hybrid Portfolio
                    <ChevronRight size={16} />
                  </CreateButton>
                </PortfolioTypeCard>
              </PortfolioTypes>
            </CreatePortfolioSection>
          ) : (
            // Portfolio Content
            <DashboardContent>
              {activeView === 'overview' && (
                <>
                  <StatsGrid>
                    <StatCard>
                      <StatHeader>
                        <StatIcon $color={getPortfolioTypeConfig(portfolio.kind)?.color}>
                          {getPortfolioTypeConfig(portfolio.kind)?.icon}
                        </StatIcon>
                        <StatTitle>Portfolio Overview</StatTitle>
                      </StatHeader>
                      <StatValue>{stats.totalItems}</StatValue>
                      <StatLabel>Total Items</StatLabel>
                      <StatProgress>
                        <ProgressBar>
                          <ProgressFill $percentage={stats.completionRate} />
                        </ProgressBar>
                        <ProgressText>{stats.completionRate.toFixed(0)}% Complete</ProgressText>
                      </StatProgress>
                    </StatCard>

                    <StatCard>
                      <StatHeader>
                        <StatIcon $color="#f59e0b">
                          <Activity size={20} />
                        </StatIcon>
                        <StatTitle>Recent Activity</StatTitle>
                      </StatHeader>
                      <StatValue>{stats.recentActivity}</StatValue>
                      <StatLabel>Actions This Week</StatLabel>
                    </StatCard>

                    {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                      <StatCard>
                        <StatHeader>
                          <StatIcon $color="#8b5cf6">
                            <GalleryIcon size={20} />
                          </StatIcon>
                          <StatTitle>Gallery</StatTitle>
                        </StatHeader>
                        <StatValue>{galleryItems.length}</StatValue>
                        <StatLabel>Artwork Pieces</StatLabel>
                      </StatCard>
                    )}

                    {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                      <StatCard>
                        <StatHeader>
                          <StatIcon $color="#3b82f6">
                            <BookOpenCheck size={20} />
                          </StatIcon>
                          <StatTitle>Learning</StatTitle>
                        </StatHeader>
                        <StatValue>
                          {conceptProgress.filter(c => c.status === 'completed').length}
                        </StatValue>
                        <StatLabel>Concepts Completed</StatLabel>
                      </StatCard>
                    )}
                  </StatsGrid>

                  <ContentGrid>
                    <ActivitySection>
                      <SectionHeader>
                        <SectionTitle>Recent Activity</SectionTitle>
                      </SectionHeader>
                      <ActivityList>
                        {recentActivity.map(activity => (
                          <ActivityItem key={activity.id}>
                            <ActivityIcon $type={activity.type}>
                              {activity.icon}
                            </ActivityIcon>
                            <ActivityContent>
                              <ActivityTitle>{activity.title}</ActivityTitle>
                              <ActivityDescription>{activity.description}</ActivityDescription>
                            </ActivityContent>
                            <ActivityTime>{formatTimeAgo(activity.timestamp)}</ActivityTime>
                          </ActivityItem>
                        ))}
                      </ActivityList>
                    </ActivitySection>

                    <QuickActionsSection>
                      <SectionHeader>
                        <SectionTitle>Quick Actions</SectionTitle>
                      </SectionHeader>
                      <QuickActionGrid>
                        {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                          <QuickAction onClick={() => setActiveView('gallery')}>
                            <ActionIcon><GalleryIcon size={24} /></ActionIcon>
                            <ActionContent>
                              <ActionTitle>Manage Gallery</ActionTitle>
                              <ActionDescription>Upload and organize artwork</ActionDescription>
                            </ActionContent>
                            <ChevronRight size={16} />
                          </QuickAction>
                        )}

                        {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                          <QuickAction onClick={() => setActiveView('learning')}>
                            <ActionIcon><BookOpen size={24} /></ActionIcon>
                            <ActionContent>
                              <ActionTitle>Continue Learning</ActionTitle>
                              <ActionDescription>Explore concepts and courses</ActionDescription>
                            </ActionContent>
                            <ChevronRight size={16} />
                          </QuickAction>
                        )}

                        <QuickAction as="a" href="/dashboard/profile">
                          <ActionIcon><Settings size={24} /></ActionIcon>
                          <ActionContent>
                            <ActionTitle>Portfolio Settings</ActionTitle>
                            <ActionDescription>Customize your profile</ActionDescription>
                          </ActionContent>
                          <ChevronRight size={16} />
                        </QuickAction>

                        {user?.role === 'admin' && (
                          <QuickAction as="a" href="/dashboard/api-test">
                            <ActionIcon><Shield size={24} /></ActionIcon>
                            <ActionContent>
                              <ActionTitle>Admin Panel</ActionTitle>
                              <ActionDescription>Manage system settings</ActionDescription>
                            </ActionContent>
                            <ChevronRight size={16} />
                          </QuickAction>
                        )}
                      </QuickActionGrid>
                    </QuickActionsSection>
                  </ContentGrid>
                </>
              )}

              {activeView === 'gallery' && renderGalleryView()}
              {activeView === 'learning' && renderLearningView()}
            </DashboardContent>
          )}
        </Container>
      </PageWrapper>
    </ProtectedRoute>
  );
}

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  /* Remove the gradient background to match the rest of the app */
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  @media (max-width: 768px) { padding: 1rem; }
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  
  /* Ensure it doesn't interfere with the sticky header */
  position: relative;
  z-index: 1;
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

const Title = styled.h1`
  font-size: 2.5rem;
  color: #111827;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  @media (max-width: 768px) { font-size: 2rem; }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? '#3b82f6' : '#6b7280'};
  font-weight: ${({ $active }) => $active ? '500' : '400'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ $active }) => $active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#e5e7eb'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
`;

const CreatePortfolioSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const CreateHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const CreateIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  color: white;
  margin-bottom: 1.5rem;
`;

const CreateTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
`;

const CreateDescription = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const PortfolioTypes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const PortfolioTypeCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const TypeIcon = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border-radius: 16px;
  margin-bottom: 1.5rem;
`;

const TypeContent = styled.div`
  margin-bottom: 2rem;
`;

const TypeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
`;

const TypeDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
`;

const TypeFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border-radius: 8px;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const StatProgress = styled.div``;

const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActivitySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const QuickActionsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
    color: #111827;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const ActivityIcon = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => 
    props.$type === 'gallery_upload' ? '#8b5cf620' :
    props.$type === 'concept_complete' ? '#3b82f620' :
    props.$type === 'project_create' ? '#10b98120' :
    '#f59e0b20'
  };
  color: ${props => 
    props.$type === 'gallery_upload' ? '#8b5cf6' :
    props.$type === 'concept_complete' ? '#3b82f6' :
    props.$type === 'project_create' ? '#10b981' :
    '#f59e0b'
  };
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const QuickActionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuickAction = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const ActionDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const GalleryItem = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const GalleryItemInfo = styled.div`
  padding: 1rem;
`;

const GalleryItemTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const GalleryItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
`;

const ProgressOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ProgressCard = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const ProgressValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const ProgressLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const ConceptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ConceptItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #d1d5db;
  }
`;

const ConceptStatus = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => 
    props.$status === 'completed' ? '#d1fae5' :
    props.$status === 'in-progress' ? '#fef3c7' :
    '#f3f4f6'
  };
  color: ${props => 
    props.$status === 'completed' ? '#065f46' :
    props.$status === 'in-progress' ? '#92400e' :
    '#6b7280'
  };
`;

const ConceptInfo = styled.div`
  flex: 1;
`;

const ConceptTitle = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const ConceptMeta = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #6b7280;
  
  svg {
    margin-bottom: 1rem;
  }
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
`;