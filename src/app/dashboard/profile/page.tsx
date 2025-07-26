// src/app/dashboard/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { useApiClient } from '@/lib/api-client';
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
  BarChart3
} from 'lucide-react';
import { RatingReview } from '@/components/ratingReview';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function ProfilePage() {
  const [stats, setStats] = useState({ visits: 0, averageRating: 0, totalRatings: 0 });
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'learning' | 'projects' | 'tutoring' | 'settings'>('overview');
  const [galleryStats, setGalleryStats] = useState({ totalPieces: 0, totalViews: 0 });
  const [learningStats, setLearningStats] = useState({ totalConcepts: 0, completed: 0 });
  
  const { user, loading, isAuthenticated } = useAuth();
  const apiClient = useApiClient();

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
          
          // Fetch portfolio-specific stats
          if (portfolioData && (portfolioData.kind === 'creative' || portfolioData.kind === 'hybrid')) {
            try {
              const galleryResponse = await apiClient.gallery.getPieces({ limit: 100 });
              const pieces = Array.isArray(galleryResponse) ? galleryResponse : galleryResponse.pieces || [];
              setGalleryStats({
                totalPieces: pieces.length,
                totalViews: pieces.reduce((sum, piece) => sum + (piece.views || 0), 0)
              });
            } catch (error) {
              console.log('No gallery data');
            }
          }
          
          if (portfolioData && (portfolioData.kind === 'educational' || portfolioData.kind === 'hybrid')) {
            try {
              const concepts = await apiClient.portfolio.getMyConcepts();
              setLearningStats({
                totalConcepts: concepts.length,
                completed: concepts.filter((c: any) => c.status === 'completed').length
              });
            } catch (error) {
              console.log('No learning data');
            }
          }
        } catch (error: any) {
          if (error?.status !== 404) {
            console.error('Error fetching portfolio:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchData();
  }, [loading, isAuthenticated, user, apiClient]);

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
      setActiveTab('overview');
    } catch (error) {
      console.error('Error creating portfolio:', error);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getPortfolioTypeConfig = (type: string) => {
    switch (type) {
      case 'creative':
        return {
          icon: <Brush size={24} />,
          title: 'Creative Portfolio',
          color: '#8b5cf6'
        };
      case 'educational':
        return {
          icon: <Brain size={24} />,
          title: 'Educational Portfolio',
          color: '#3b82f6'
        };
      case 'hybrid':
        return {
          icon: <Layers size={24} />,
          title: 'Hybrid Portfolio',
          color: '#10b981'
        };
      default:
        return null;
    }
  };

  const userStats = {
    joinDate: 'January 2024',
  };

  // Portfolio Creation Section
  const renderPortfolioCreation = () => (
    <CreatePortfolioSection>
      <CreateHeader>
        <CreateTitle>Create Your Portfolio</CreateTitle>
        <CreateDescription>
          Choose the type of portfolio that best represents your journey
        </CreateDescription>
      </CreateHeader>

      <PortfolioTypes>
        <PortfolioTypeCard onClick={() => createPortfolio('creative')}>
          <TypeIcon $color="#8b5cf6">
            <Brush size={32} />
          </TypeIcon>
          <TypeTitle>Creative Portfolio</TypeTitle>
          <TypeDescription>
            Showcase your artwork, designs, and creative projects
          </TypeDescription>
          <TypeFeatures>
            <Feature><GalleryIcon size={14} /> Image galleries</Feature>
            <Feature><Brush size={14} /> Portfolio showcase</Feature>
          </TypeFeatures>
          <CreateButton>
            Create Creative Portfolio
            <ChevronRight size={16} />
          </CreateButton>
        </PortfolioTypeCard>

        <PortfolioTypeCard onClick={() => createPortfolio('educational')}>
          <TypeIcon $color="#3b82f6">
            <Brain size={32} />
          </TypeIcon>
          <TypeTitle>Educational Portfolio</TypeTitle>
          <TypeDescription>
            Track your academic progress and learning achievements
          </TypeDescription>
          <TypeFeatures>
            <Feature><BookOpen size={14} /> Progress tracking</Feature>
            <Feature><Award size={14} /> Achievements</Feature>
          </TypeFeatures>
          <CreateButton>
            Create Educational Portfolio
            <ChevronRight size={16} />
          </CreateButton>
        </PortfolioTypeCard>

        <PortfolioTypeCard onClick={() => createPortfolio('hybrid')}>
          <TypeIcon $color="#10b981">
            <Layers size={32} />
          </TypeIcon>
          <TypeTitle>Hybrid Portfolio</TypeTitle>
          <TypeDescription>
            Combine creative works with educational progress
          </TypeDescription>
          <TypeFeatures>
            <Feature><GalleryIcon size={14} /> Creative showcase</Feature>
            <Feature><Brain size={14} /> Learning progress</Feature>
          </TypeFeatures>
          <CreateButton>
            Create Hybrid Portfolio
            <ChevronRight size={16} />
          </CreateButton>
        </PortfolioTypeCard>
      </PortfolioTypes>
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
            onClick={() => setActiveTab(tab.id as any)}
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
    if (!portfolio) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <PortfolioOverview>
            <OverviewGrid>
              <OverviewCard>
                <CardIcon $color={getPortfolioTypeConfig(portfolio.kind)?.color}>
                  {getPortfolioTypeConfig(portfolio.kind)?.icon}
                </CardIcon>
                <CardContent>
                  <CardTitle>Portfolio Type</CardTitle>
                  <CardValue>{getPortfolioTypeConfig(portfolio.kind)?.title}</CardValue>
                </CardContent>
              </OverviewCard>

              {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                <OverviewCard>
                  <CardIcon $color="#8b5cf6">
                    <GalleryIcon size={20} />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>Gallery</CardTitle>
                    <CardValue>{galleryStats.totalPieces} pieces</CardValue>
                    <CardSubtext>{galleryStats.totalViews} total views</CardSubtext>
                  </CardContent>
                </OverviewCard>
              )}

              {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                <OverviewCard>
                  <CardIcon $color="#3b82f6">
                    <BookOpen size={20} />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardValue>{learningStats.completed}/{learningStats.totalConcepts}</CardValue>
                    <CardSubtext>concepts completed</CardSubtext>
                  </CardContent>
                </OverviewCard>
              )}

              <OverviewCard>
                <CardIcon $color="#10b981">
                  <Activity size={20} />
                </CardIcon>
                <CardContent>
                  <CardTitle>Activity</CardTitle>
                  <CardValue>5 this week</CardValue>
                  <CardSubtext>portfolio updates</CardSubtext>
                </CardContent>
              </OverviewCard>
            </OverviewGrid>
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
              <ActionButton>
                <Upload size={16} />
                Upload Artwork
              </ActionButton>
            </SectionHeader>
            <PlaceholderContent>
              Gallery management interface will go here.
              This will include upload, organize, and showcase functionality.
            </PlaceholderContent>
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
              <ActionButton>
                <Plus size={16} />
                Add Concept
              </ActionButton>
            </SectionHeader>
            <PlaceholderContent>
              Learning progress tracking will go here.
              This will include concept tracking, achievements, and analytics.
            </PlaceholderContent>
          </PortfolioSection>
        );

      case 'projects':
        return (
          <PortfolioSection>
            <SectionHeader>
              <SectionTitleWithIcon>
                <FolderOpen size={24} />
                Projects
              </SectionTitleWithIcon>
              <ActionButton>
                <Plus size={16} />
                New Project
              </ActionButton>
            </SectionHeader>
            <PlaceholderContent>
              Project management will go here.
              This will include CS projects, creative projects, and showcases.
            </PlaceholderContent>
          </PortfolioSection>
        );

      case 'tutoring':
        return (
          <PortfolioSection>
            <SectionHeader>
              <SectionTitleWithIcon>
                <GraduationCap size={24} />
                Tutoring Services
              </SectionTitleWithIcon>
              <ActionButton>
                <Plus size={16} />
                Add Service
              </ActionButton>
            </SectionHeader>
            <PlaceholderContent>
              Tutoring services management will go here.
              This will include scheduling, subjects, and client management.
            </PlaceholderContent>
          </PortfolioSection>
        );

      case 'settings':
        return (
          <PortfolioSection>
            <SectionHeader>
              <SectionTitleWithIcon>
                <Settings size={24} />
                Portfolio Settings
              </SectionTitleWithIcon>
            </SectionHeader>
            <PlaceholderContent>
              Portfolio and account settings will go here.
              This will include privacy, notifications, and profile management.
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

// Styled Components
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

const PlaceholderContent = styled.div`
  background: #f8fafc;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  color: #6b7280;
  line-height: 1.6;
`;

// Portfolio Overview
const PortfolioOverview = styled.div`
  padding: 2rem;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const OverviewCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
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
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h4`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.125rem;
`;

const CardSubtext = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;