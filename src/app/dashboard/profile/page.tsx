// src/app/dashboard/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { useApiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import type { Portfolio } from '@/types/portfolio.types';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Settings, 
  Eye,
  Plus,
  Brush,
  Brain,
  Layers,
  Image as GalleryIcon,
  BookOpen,
  FolderOpen,
  GraduationCap,
  Upload,
  TrendingUp,
  Award,
  ChevronRight,
  Activity,
  BarChart3,
  ExternalLink,
  Edit3,
  Globe,
  Lock,
  Users,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { RatingReview } from '@/components/ratingReview';
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

type PortfolioKind = 'creative' | 'educational' | 'hybrid';
type TabType = 'overview' | 'gallery' | 'learning' | 'projects' | 'tutoring' | 'settings';

interface PortfolioStats {
  gallery: {
    totalPieces: number;
    totalViews: number;
    totalLikes: number;
    recentUploads: number;
  };
  learning: {
    totalConcepts: number;
    completed: number;
    inProgress: number;
    weeklyStreak: number;
  };
  projects: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
  };
  tutoring: {
    activeListings: number;
    totalBookings: number;
    averageRating: number;
    subjects: string[];
  };
}

interface CreatePortfolioData {
  title: string;
  bio: string;
  visibility: 'public' | 'private' | 'unlisted';
  specializations: string[];
  tags: string[];
}

export default function ProfilePage() {
  const [stats, setStats] = useState({ visits: 0, averageRating: 0, totalRatings: 0 });
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  
  // Portfolio creation state
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [creatingPortfolio, setCreatingPortfolio] = useState(false);
  const [selectedPortfolioType, setSelectedPortfolioType] = useState<PortfolioKind | null>(null);
  const [createPortfolioData, setCreatePortfolioData] = useState<CreatePortfolioData>({
    title: '',
    bio: '',
    visibility: 'public',
    specializations: [],
    tags: []
  });
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const { user, loading, isAuthenticated } = useAuth();
  const apiClient = useApiClient();
  const router = useRouter();

  // Fetch portfolio and stats
  useEffect(() => {
    const fetchData = async () => {
      if (loading || !isAuthenticated || !user) return;
      
      try {
        // Fetch user stats
        const userStats = await fetch('/api/user/stats');
        if (userStats.ok) {
          const data = await userStats.json();
          setStats(data);
        }

        // Fetch portfolio
        try {
          const portfolioData = await apiClient.portfolio.getMyPortfolio();
          setPortfolio(portfolioData);
          
          if (portfolioData) {
            await fetchPortfolioStats(portfolioData);
          }
        } catch (error: any) {
          if (error?.status !== 404) {
            console.error('Error fetching portfolio:', error);
          }
          // 404 means no portfolio exists yet
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchData();
  }, [loading, isAuthenticated, user, apiClient]);

  // Fetch detailed portfolio statistics
  const fetchPortfolioStats = async (portfolioData: Portfolio) => {
    try {
      const stats: PortfolioStats = {
        gallery: { totalPieces: 0, totalViews: 0, totalLikes: 0, recentUploads: 0 },
        learning: { totalConcepts: 0, completed: 0, inProgress: 0, weeklyStreak: 0 },
        projects: { totalProjects: 0, activeProjects: 0, completedProjects: 0 },
        tutoring: { activeListings: 0, totalBookings: 0, averageRating: 0, subjects: [] }
      };

      // Fetch gallery stats for creative/hybrid portfolios
      if (portfolioData.kind === 'creative' || portfolioData.kind === 'hybrid') {
        try {
          const galleryResponse = await apiClient.gallery.getPieces({ limit: 100 });
          const pieces = Array.isArray(galleryResponse) ? galleryResponse : [];
          const recentDate = new Date();
          recentDate.setDate(recentDate.getDate() - 7);
          
          stats.gallery = {
            totalPieces: pieces.length,
            totalViews: pieces.reduce((sum, piece) => sum + (piece.views || 0), 0),
            totalLikes: pieces.reduce((sum, piece) => sum + (piece.likes || 0), 0),
            recentUploads: pieces.filter(p => new Date(p.createdAt || 0) > recentDate).length
          };
        } catch (error) {
          console.log('No gallery data available');
        }
      }

      // Fetch learning stats for educational/hybrid portfolios
      if (portfolioData.kind === 'educational' || portfolioData.kind === 'hybrid') {
        try {
          const concepts = await apiClient.portfolio.getMyConcepts();
          const completed = concepts.filter((c: any) => c.status === 'completed');
          const inProgress = concepts.filter((c: any) => c.status === 'in-progress');
          
          stats.learning = {
            totalConcepts: concepts.length,
            completed: completed.length,
            inProgress: inProgress.length,
            weeklyStreak: calculateLearningStreak(concepts)
          };
        } catch (error) {
          console.log('No learning data available');
        }
      }

      setPortfolioStats(stats);
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
    }
  };

  // Calculate learning streak
  const calculateLearningStreak = (concepts: any[]): number => {
    const completedDates = concepts
      .filter(c => c.status === 'completed' && c.completedAt)
      .map(c => new Date(c.completedAt))
      .sort((a, b) => b.getTime() - a.getTime());

    if (completedDates.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(completedDates[0]);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < completedDates.length; i++) {
      const prevDate = new Date(completedDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  };

  // Create portfolio with specified type
  const createPortfolio = async (type: PortfolioKind) => {
    setSelectedPortfolioType(type);
    setCreatePortfolioData(prev => ({
      ...prev,
      title: `${user?.name || 'My'} ${getPortfolioTypeConfig(type)?.title || 'Portfolio'}`
    }));
    setShowCreatePortfolio(true);
  };

  // Handle portfolio creation form submission
  const handleCreatePortfolio = async () => {
    if (!selectedPortfolioType || creatingPortfolio) return;

    try {
      setCreatingPortfolio(true);

      const newPortfolio = await apiClient.portfolio.create(createPortfolioData);
      
      // Note: The backend should handle setting the portfolio 'kind' based on user preferences
      // or we might need a separate API call to set the portfolio type
      
      setPortfolio(newPortfolio);
      setShowCreatePortfolio(false);
      setActiveTab('overview');
      
      // Fetch initial stats for the new portfolio
      await fetchPortfolioStats(newPortfolio);
      
    } catch (error) {
      console.error('Error creating portfolio:', error);
    } finally {
      setCreatingPortfolio(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getPortfolioTypeConfig = (type: PortfolioKind) => {
    switch (type) {
      case 'creative':
        return {
          icon: <Brush size={24} />,
          title: 'Creative Portfolio',
          color: '#8b5cf6',
          description: 'Showcase your artwork, designs, and creative projects',
          features: ['Image galleries', 'Portfolio showcase', 'Creative collections'],
          mainPath: '/dashboard/gallery'
        };
      case 'educational':
        return {
          icon: <Brain size={24} />,
          title: 'Educational Portfolio',
          color: '#3b82f6',
          description: 'Track your academic progress and learning achievements',
          features: ['Progress tracking', 'Concept mastery', 'Learning analytics'],
          mainPath: '/writing'
        };
      case 'hybrid':
        return {
          icon: <Layers size={24} />,
          title: 'Hybrid Portfolio',
          color: '#10b981',
          description: 'Combine creative works with educational progress',
          features: ['Creative showcase', 'Learning progress', 'Unified dashboard'],
          mainPath: '/dashboard'
        };
    }
  };

  const userStats = {
    joinDate: 'January 2024',
  };

  // Portfolio Creation Flow
  const renderPortfolioCreation = () => (
    <CreatePortfolioSection>
      {!showCreatePortfolio ? (
        <>
          <CreateHeader>
            <CreateTitle>Create Your Portfolio</CreateTitle>
            <CreateDescription>
              Choose the type of portfolio that best represents your journey
            </CreateDescription>
          </CreateHeader>

          <PortfolioTypes>
            {(['creative', 'educational', 'hybrid'] as PortfolioKind[]).map(type => {
              const config = getPortfolioTypeConfig(type);
              return (
                <PortfolioTypeCard key={type} onClick={() => createPortfolio(type)}>
                  <TypeIcon $color={config.color}>
                    {config.icon}
                  </TypeIcon>
                  <TypeTitle>{config.title}</TypeTitle>
                  <TypeDescription>{config.description}</TypeDescription>
                  <TypeFeatures>
                    {config.features.map(feature => (
                      <Feature key={feature}>
                        <Check size={14} />
                        {feature}
                      </Feature>
                    ))}
                  </TypeFeatures>
                  <CreateButton>
                    Create {config.title}
                    <ChevronRight size={16} />
                  </CreateButton>
                </PortfolioTypeCard>
              );
            })}
          </PortfolioTypes>
        </>
      ) : (
        <CreatePortfolioForm>
          <FormHeader>
            <BackButton onClick={() => setShowCreatePortfolio(false)}>
              <X size={20} />
            </BackButton>
            <FormTitle>
              Create {getPortfolioTypeConfig(selectedPortfolioType!)?.title}
            </FormTitle>
          </FormHeader>

          <FormContent>
            <FormField>
              <FormLabel>Portfolio Title</FormLabel>
              <FormInput
                type="text"
                value={createPortfolioData.title}
                onChange={(e) => setCreatePortfolioData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your portfolio title"
              />
            </FormField>

            <FormField>
              <FormLabel>Bio / Description</FormLabel>
              <FormTextarea
                value={createPortfolioData.bio}
                onChange={(e) => setCreatePortfolioData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell others about yourself and your work..."
                rows={4}
              />
            </FormField>

            <FormField>
              <FormLabel>Visibility</FormLabel>
              <VisibilityOptions>
                {[
                  { value: 'public', icon: <Globe size={16} />, label: 'Public', desc: 'Visible to everyone' },
                  { value: 'unlisted', icon: <Users size={16} />, label: 'Unlisted', desc: 'Only accessible via link' },
                  { value: 'private', icon: <Lock size={16} />, label: 'Private', desc: 'Only visible to you' }
                ].map(option => (
                  <VisibilityOption
                    key={option.value}
                    $active={createPortfolioData.visibility === option.value}
                    onClick={() => setCreatePortfolioData(prev => ({ 
                      ...prev, 
                      visibility: option.value as 'public' | 'private' | 'unlisted' 
                    }))}
                  >
                    {option.icon}
                    <div>
                      <OptionLabel>{option.label}</OptionLabel>
                      <OptionDesc>{option.desc}</OptionDesc>
                    </div>
                  </VisibilityOption>
                ))}
              </VisibilityOptions>
            </FormField>

            <FormActions>
              <CancelButton onClick={() => setShowCreatePortfolio(false)}>
                Cancel
              </CancelButton>
              <SubmitButton 
                onClick={handleCreatePortfolio}
                disabled={!createPortfolioData.title.trim() || creatingPortfolio}
              >
                {creatingPortfolio ? 'Creating...' : 'Create Portfolio'}
              </SubmitButton>
            </FormActions>
          </FormContent>
        </CreatePortfolioForm>
      )}
    </CreatePortfolioSection>
  );

  // Portfolio Management Tabs
  const renderPortfolioTabs = () => {
    if (!portfolio) return null;

    const tabs = [
      { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
      ...(portfolio.kind === 'creative' || portfolio.kind === 'hybrid' ? [
        { id: 'gallery', label: 'Gallery', icon: <GalleryIcon size={16} /> }
      ] : []),
      ...(portfolio.kind === 'educational' || portfolio.kind === 'hybrid' ? [
        { id: 'learning', label: 'Learning', icon: <BookOpen size={16} /> }
      ] : []),
      { id: 'projects', label: 'Projects', icon: <FolderOpen size={16} /> },
      { id: 'tutoring', label: 'Tutoring', icon: <GraduationCap size={16} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
    ];

    return (
      <TabNavigation>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
          >
            {tab.icon}
            {tab.label}
          </TabButton>
        ))}
      </TabNavigation>
    );
  };

  // Portfolio Content Sections
  const renderPortfolioContent = () => {
    if (!portfolio || !portfolioStats) return null;
    const config = getPortfolioTypeConfig(portfolio.kind);

    switch (activeTab) {
      case 'overview':
        return (
          <PortfolioOverview>
            <OverviewHeader>
              <PortfolioTitle>{portfolio.title}</PortfolioTitle>
              <PortfolioActions>
                <ViewPortfolioButton onClick={() => window.open(`/portfolio/${portfolio.username}`, '_blank')}>
                  <ExternalLink size={16} />
                  View Public
                </ViewPortfolioButton>
                <EditButton onClick={() => setActiveTab('settings')}>
                  <Edit3 size={16} />
                  Edit
                </EditButton>
              </PortfolioActions>
            </OverviewHeader>

            <OverviewGrid>
              <OverviewCard>
                <CardIcon $color={config?.color}>
                  {config?.icon}
                </CardIcon>
                <CardContent>
                  <CardTitle>Portfolio Type</CardTitle>
                  <CardValue>{config?.title}</CardValue>
                  <CardSubtext>{config?.description}</CardSubtext>
                </CardContent>
              </OverviewCard>

              {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                <OverviewCard>
                  <CardIcon $color="#8b5cf6">
                    <GalleryIcon size={20} />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>Gallery</CardTitle>
                    <CardValue>{portfolioStats.gallery.totalPieces} pieces</CardValue>
                    <CardSubtext>{portfolioStats.gallery.totalViews} total views</CardSubtext>
                  </CardContent>
                  <CardAction>
                    <ActionLink onClick={() => router.push('/dashboard/gallery')}>
                      Manage Gallery <ChevronRight size={14} />
                    </ActionLink>
                  </CardAction>
                </OverviewCard>
              )}

              {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                <OverviewCard>
                  <CardIcon $color="#3b82f6">
                    <BookOpen size={20} />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardValue>{portfolioStats.learning.completed}/{portfolioStats.learning.totalConcepts}</CardValue>
                    <CardSubtext>concepts completed</CardSubtext>
                  </CardContent>
                  <CardAction>
                    <ActionLink onClick={() => router.push('/writing')}>
                      Continue Learning <ChevronRight size={14} />
                    </ActionLink>
                  </CardAction>
                </OverviewCard>
              )}

              <OverviewCard>
                <CardIcon $color="#10b981">
                  <Activity size={20} />
                </CardIcon>
                <CardContent>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardValue>{portfolioStats.gallery.recentUploads + portfolioStats.learning.weeklyStreak}</CardValue>
                  <CardSubtext>updates this week</CardSubtext>
                </CardContent>
              </OverviewCard>
            </OverviewGrid>

            <QuickActions>
              <QuickActionTitle>Quick Actions</QuickActionTitle>
              <QuickActionGrid>
                {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                  <QuickActionCard onClick={() => setShowUploadModal(true)}>
                    <Upload size={24} />
                    <span>Upload Artwork</span>
                  </QuickActionCard>
                )}
                {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                  <QuickActionCard onClick={() => router.push('/writing')}>
                    <BookOpen size={24} />
                    <span>Continue Learning</span>
                  </QuickActionCard>
                )}
                <QuickActionCard onClick={() => setActiveTab('projects')}>
                  <FolderOpen size={24} />
                  <span>Manage Projects</span>
                </QuickActionCard>
                <QuickActionCard onClick={() => setActiveTab('tutoring')}>
                  <GraduationCap size={24} />
                  <span>Tutoring Services</span>
                </QuickActionCard>
              </QuickActionGrid>
            </QuickActions>
          </PortfolioOverview>
        );

      case 'gallery':
        return (
          <PortfolioSection>
            <SectionHeader>
              <SectionTitleWithIcon>
                <GalleryIcon size={24} />
                Gallery Management
              </SectionTitleWithIcon>
              <SectionActions>
                <ActionButton onClick={() => router.push('/dashboard/gallery')}>
                  <ExternalLink size={16} />
                  Open Gallery
                </ActionButton>
              </SectionActions>
            </SectionHeader>
            <SectionContent>
              <StatsRow>
                <StatBox>
                  <StatNumber>{portfolioStats.gallery.totalPieces}</StatNumber>
                  <StatLabel>Total Pieces</StatLabel>
                </StatBox>
                <StatBox>
                  <StatNumber>{portfolioStats.gallery.totalViews}</StatNumber>
                  <StatLabel>Total Views</StatLabel>
                </StatBox>
                <StatBox>
                  <StatNumber>{portfolioStats.gallery.totalLikes}</StatNumber>
                  <StatLabel>Total Likes</StatLabel>
                </StatBox>
                <StatBox>
                  <StatNumber>{portfolioStats.gallery.recentUploads}</StatNumber>
                  <StatLabel>Recent Uploads</StatLabel>
                </StatBox>
              </StatsRow>
              <GalleryQuickActions>
                <QuickUploadButton onClick={() => setShowUploadModal(true)}>
                  <Upload size={16} />
                  Upload New Artwork
                </QuickUploadButton>
                <ManageButton onClick={() => router.push('/dashboard/gallery')}>
                  <ExternalLink size={16} />
                  Manage Gallery
                </ManageButton>
              </GalleryQuickActions>
              <PlaceholderContent>
                Recent gallery activity and featured pieces will be shown here.
              </PlaceholderContent>
            </SectionContent>
          </PortfolioSection>
        );

      case 'learning':
        return (
          <PortfolioSection>
            <SectionHeader>
              <SectionTitleWithIcon>
                <BookOpen size={24} />
                Learning Progress
              </SectionTitleWithIcon>
              <SectionActions>
                <ActionButton onClick={() => router.push('/writing')}>
                  <ExternalLink size={16} />
                  Open Learning Center
                </ActionButton>
              </SectionActions>
            </SectionHeader>
            <SectionContent>
              <StatsRow>
                <StatBox>
                  <StatNumber>{portfolioStats.learning.totalConcepts}</StatNumber>
                  <StatLabel>Total Concepts</StatLabel>
                </StatBox>
                <StatBox>
                  <StatNumber>{portfolioStats.learning.completed}</StatNumber>
                  <StatLabel>Completed</StatLabel>
                </StatBox>
                <StatBox>
                  <StatNumber>{portfolioStats.learning.inProgress}</StatNumber>
                  <StatLabel>In Progress</StatLabel>
                </StatBox>
                <StatBox>
                  <StatNumber>{portfolioStats.learning.weeklyStreak}</StatNumber>
                  <StatLabel>Day Streak</StatLabel>
                </StatBox>
              </StatsRow>
              <ProgressContainer>
                <ProgressTitle>Learning Progress</ProgressTitle>
                <ProgressBar>
                  <ProgressFill 
                    $percentage={portfolioStats.learning.totalConcepts > 0 
                      ? (portfolioStats.learning.completed / portfolioStats.learning.totalConcepts) * 100 
                      : 0
                    }
                  />
                </ProgressBar>
                <ProgressText>
                  {portfolioStats.learning.totalConcepts > 0 
                    ? `${Math.round((portfolioStats.learning.completed / portfolioStats.learning.totalConcepts) * 100)}%`
                    : '0%'
                  } Complete
                </ProgressText>
              </ProgressContainer>
            </SectionContent>
          </PortfolioSection>
        );

      case 'projects':
      case 'tutoring':
      case 'settings':
        return (
          <PortfolioSection>
            <SectionHeader>
              <SectionTitleWithIcon>
                {activeTab === 'projects' && <><FolderOpen size={24} />Projects</>}
                {activeTab === 'tutoring' && <><GraduationCap size={24} />Tutoring Services</>}
                {activeTab === 'settings' && <><Settings size={24} />Portfolio Settings</>}
              </SectionTitleWithIcon>
            </SectionHeader>
            <PlaceholderContent>
              {activeTab === 'projects' && 'Project management interface will be implemented here.'}
              {activeTab === 'tutoring' && 'Tutoring services management will be implemented here.'}
              {activeTab === 'settings' && 'Portfolio settings and configuration will be implemented here.'}
            </PlaceholderContent>
          </PortfolioSection>
        );

      default:
        return null;
    }
  };

  return (
    <PageWrapper>
      <Header>
        <Avatar>{user?.name ? getInitials(user.name) : <User size={60} />}</Avatar>
        <ProfileInfo>
          <Name>{user?.name || 'User Profile'}</Name>
          <Role><Shield size={16} />{user?.role || 'member'}</Role>
          <Email><Mail size={16} />{user?.email || 'user@example.com'}</Email>
        </ProfileInfo>
        {portfolio && (
          <PortfolioIndicatorContainer>
            <PortfolioIndicator $color={getPortfolioTypeConfig(portfolio.kind)?.color || '#6b7280'} />
            <PortfolioLabel>{getPortfolioTypeConfig(portfolio.kind)?.title}</PortfolioLabel>
          </PortfolioIndicatorContainer>
        )}
      </Header>

      <Grid>
        <Card>
          <h3><Calendar size={20} />Account Info</h3>
          <p>Member since {userStats.joinDate}</p>
        </Card>

        <Card>
          <h3><Eye size={20} />Visits & Ratings</h3>
          <p>{stats.visits.toLocaleString()} total visits</p>
          <div style={{ marginTop: '0.5rem' }}>
            <RatingReview rating={stats.averageRating} votes={stats.totalRatings} />
          </div>
        </Card>
      </Grid>

      {portfolioLoading ? (
        <LoadingSection>Loading portfolio...</LoadingSection>
      ) : !portfolio ? (
        renderPortfolioCreation()
      ) : (
        <PortfolioManagement>
          {renderPortfolioTabs()}
          {renderPortfolioContent()}
        </PortfolioManagement>
      )}
    </PageWrapper>
  );
}

// Styled Components (continuing with existing styles and adding new ones)
const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  color: #fff;
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  background: #fff;
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #764ba2;
  font-size: 3rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Name = styled.h1`
  font-size: 2.25rem;
  margin: 0 0 0.5rem;
  font-family: 'Work Sans', sans-serif;
`;

const Role = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.25);
  padding: 0.25rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  text-transform: capitalize;
  margin-bottom: 1rem;
`;

const Email = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  opacity: 0.9;
`;

const PortfolioIndicatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const PortfolioIndicator = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  background: ${props => props.$color};
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const PortfolioLabel = styled.span`
  font-size: 0.875rem;
  opacity: 0.9;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.75rem;
  h3 {
    color: #2c2c2c;
    margin-bottom: 1rem;
    font-family: 'Work Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  p {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
`;

const LoadingSection = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  color: #666;
`;

// Portfolio Creation Styles
const CreatePortfolioSection = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const CreateHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
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
  cursor: pointer;
  transition: all 0.3s;
  
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
  margin-bottom: 2rem;
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

// Portfolio Creation Form Styles
const CreatePortfolioForm = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    color: #374151;
    background: #f9fafb;
  }
`;

const FormTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const VisibilityOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const VisibilityOption = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  
  &:hover {
    border-color: ${props => props.$active ? '#3b82f6' : '#d1d5db'};
  }
`;

const OptionLabel = styled.div`
  font-weight: 500;
  color: #111827;
`;

const OptionDesc = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Portfolio Management Styles
const PortfolioManagement = styled.div`
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TabNavigation = styled.div`
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? '#3b82f6' : 'transparent'};
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$active ? 'white' : '#f1f5f9'};
    color: ${props => props.$active ? '#3b82f6' : '#374151'};
  }
`;

const PortfolioSection = styled.div`
  padding: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SectionTitleWithIcon = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SectionActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const StatBox = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const GalleryQuickActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
`;

const QuickUploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #059669;
  }
`;

const ManageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const PlaceholderContent = styled.div`
  background: #f8fafc;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  color: #6b7280;
  line-height: 1.6;
`;

const ProgressContainer = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
`;

const ProgressTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
`;

const ProgressBar = styled.div`
  position: relative;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

// Portfolio Overview
const PortfolioOverview = styled.div`
  padding: 2rem;
`;

const OverviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const PortfolioTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const PortfolioActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ViewPortfolioButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OverviewCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardIcon = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border-radius: 12px;
  flex-shrink: 0;
  align-self: flex-start;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h4`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const CardSubtext = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const CardAction = styled.div`
  margin-top: 1rem;
`;

const ActionLink = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #2563eb;
  }
`;

const QuickActions = styled.div`
  margin-top: 2rem;
`;

const QuickActionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
`;

const QuickActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const QuickActionCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
  }
  
  span {
    font-weight: 500;
    color: #374151;
  }
  
  svg {
    color: #6b7280;
  }
`;