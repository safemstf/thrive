// src/app/dashboard/page.tsx - Fixed for styled-components v4+
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDashboardContext } from './layout';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { useDashboardLogic } from '@/components/dashboard/dashboardLogic';
import { useOffline } from '@/hooks/useOffline';
import styled, { keyframes, css } from 'styled-components'; // Added css import
import {
  LayoutDashboard,
  Image as GalleryIcon,
  Brush,
  Brain,
  Layers,
  ChevronRight,
  Activity,
  Settings,
  Sparkles,
  BarChart3,
  Code,
  ExternalLink,
  Eye,
  CheckCircle,
  TrendingUp,
  Target,
  Award,
  Plus,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  Zap,
  Trophy,
  Star,
  Play,
  BookOpen,
  PieChart,
  LineChart,
  MousePointer
} from "lucide-react";

// Import view components (keep existing)
import { GalleryView } from '@/components/dashboard/views/GalleryView';
import { LearningView } from '@/components/dashboard/views/learningView';
import { AnalyticsView } from '@/components/dashboard/views/analyticsView';

// Import mock data for fallback
import { createMockPortfolio, createMockGalleryPieces } from '@/data/mockData';

// ============================================
// TYPES
// ============================================

interface MockGalleryPiece {
  id: string;
  status: string;
  views: number;
  title: string;
}

// ============================================
// ANIMATIONS - Matching Header Style
// ============================================

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

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// ============================================
// STYLED COMPONENTS - Fixed with css helper
// ============================================

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 252, 0.95) 50%,
    rgba(241, 245, 249, 0.9) 100%
  );
  padding: 2rem 1rem 4rem;
  overflow-x: hidden; /* Prevent horizontal scroll */
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem 2rem;
  }
`;

const DashboardContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  ${css`animation: ${fadeInUp} 0.6s ease-out;`}
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.08) 0%,
    rgba(139, 92, 246, 0.05) 100%
  );
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.1), 
      transparent
    );
    ${css`animation: ${shimmer} 3s ease-in-out infinite;`}
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }
`;

const WelcomeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const WelcomeIcon = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
`;

const WelcomeText = styled.div`
  flex: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: #666666;
  margin: 0;
  opacity: 0.9;
`;

const StatusIndicator = styled.div<{ $type: 'online' | 'offline' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  padding: 8px 16px;
  border-radius: 24px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${props => props.$type === 'online'
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : 'linear-gradient(135deg, #ef4444, #dc2626)'
  };
  color: white;
  box-shadow: 0 4px 12px ${props => props.$type === 'online'
    ? 'rgba(16, 185, 129, 0.3)'
    : 'rgba(239, 68, 68, 0.3)'
  };
  
  svg {
    ${css`animation: ${pulse} 2s ease infinite;`}
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    border-color: ${props => `${props.$color}20`};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${props => props.$color}, 
      ${props => `${props.$color}80`}
    );
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, 
    ${props => `${props.$color}10`}, 
    ${props => `${props.$color}05`}
  );
  border: 1px solid ${props => `${props.$color}20`};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666666;
  font-weight: 500;
`;

const StatTrend = styled.div<{ $positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  margin-top: 0.5rem;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const Section = styled.div`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  flex: 1;
`;

const SectionAction = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.08);
    transform: translateX(2px);
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
  padding: 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, 
    rgba(248, 250, 252, 0.8) 0%,
    rgba(241, 245, 249, 0.6) 100%
  );
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.05) 0%,
      rgba(59, 130, 246, 0.02) 100%
    );
    border-color: rgba(59, 130, 246, 0.15);
  }
`;

const ActivityIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.div`
  font-size: 0.8rem;
  color: #666666;
  opacity: 0.8;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #666666;
  opacity: 0.6;
  flex-shrink: 0;
`;

const QuickActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const QuickActionCard = styled.button<{ $color: string }>`
  background: linear-gradient(135deg, 
    ${props => `${props.$color}08`}, 
    ${props => `${props.$color}03`}
  );
  border: 1px solid ${props => `${props.$color}15`};
  border-radius: 12px;
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  color: #1a1a1a;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: ${props => `${props.$color}30`};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => `${props.$color}12`};
  }
  
  .action-icon {
    width: 24px;
    height: 24px;
    color: ${props => props.$color};
    margin: 0 auto 0.75rem;
  }
  
  .action-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666666;
  
  .empty-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem;
    opacity: 0.5;
  }
  
  .empty-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }
  
  .empty-description {
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0;
  }
`;

// Fixed loading spinner component
const LoadingSpinner = styled(RefreshCw)`
  ${css`animation: ${pulse} 1.5s ease infinite;`}
`;

// ============================================
// MAIN COMPONENT
// ============================================

export default function DashboardPage() {
  const router = useRouter();
  const { isOffline } = useOffline();

  // Use hooks properly without destructuring non-existent properties
  const portfolioManagement = usePortfolioManagement();
  const dashboardLogic = useDashboardLogic();

  // Extract what we need safely
  const currentPortfolio = portfolioManagement.portfolio;
  const isLoading = portfolioManagement.loading;
  const hasPortfolio = portfolioManagement.hasPortfolio;

  // Create mock data for stats
  const mockGalleryPieces = useMemo((): MockGalleryPiece[] => {
    const portfolioId = currentPortfolio?.id || 'default-portfolio';
    const pieces = createMockGalleryPieces();
    return pieces.map(piece => ({
      id: piece._id, // use _id from your interface
      status: piece.status ?? 'completed', // fallback if status might be missing
      views: Math.floor(Math.random() * 500) + 50,
      title: piece.title || `Piece ${piece._id}`
    }));

  }, [currentPortfolio?.id]);

  // Calculate dashboard stats
  const stats = useMemo(() => {
    const totalPieces = mockGalleryPieces.length;
    const completedPieces = mockGalleryPieces.filter(piece => piece.status === 'completed').length;
    const viewCount = mockGalleryPieces.reduce((sum, piece) => sum + piece.views, 0);

    return {
      totalPieces,
      completedPieces,
      viewCount,
      portfolios: hasPortfolio ? 1 : 0
    };
  }, [mockGalleryPieces, hasPortfolio]);

  // Recent activity data
  const recentActivity = [
    {
      id: '1',
      title: 'Updated portfolio theme',
      description: 'Changed to modern dark theme',
      time: '2 hours ago',
      icon: <Brush size={16} />,
      color: '#8b5cf6'
    },
    {
      id: '2',
      title: 'New piece published',
      description: 'Added "Digital Landscape" to gallery',
      time: '1 day ago',
      icon: <GalleryIcon size={16} />,
      color: '#3b82f6'
    },
    {
      id: '3',
      title: 'Analytics milestone',
      description: 'Reached 1,000 total views',
      time: '3 days ago',
      icon: <TrendingUp size={16} />,
      color: '#10b981'
    },
    {
      id: '4',
      title: 'Profile completed',
      description: 'Added bio and contact information',
      time: '1 week ago',
      icon: <CheckCircle size={16} />,
      color: '#f59e0b'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      id: 'create',
      title: 'Create New Piece',
      icon: <Plus size={20} />,
      color: '#3b82f6',
      onClick: () => router.push('/dashboard/gallery/create')
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      icon: <BarChart3 size={20} />,
      color: '#10b981',
      onClick: () => router.push('/dashboard/analytics')
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings size={20} />,
      color: '#8b5cf6',
      onClick: () => router.push('/dashboard/settings')
    },
    {
      id: 'portfolio',
      title: 'Edit Portfolio',
      icon: <Brush size={20} />,
      color: '#f59e0b',
      onClick: () => router.push('/dashboard/portfolio')
    }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <DashboardContainer>
        <DashboardContent>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <LoadingSpinner size={32} />
            <div style={{ color: '#666666', fontSize: '1.1rem', fontWeight: 500 }}>
              Loading your dashboard...
            </div>
          </div>
        </DashboardContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardContent>
        {/* Welcome Section */}
        <WelcomeSection>
          <WelcomeHeader>
            <WelcomeIcon>
              <LayoutDashboard size={24} />
            </WelcomeIcon>
            <WelcomeText>
              <WelcomeTitle>Welcome back to your Dashboard</WelcomeTitle>
              <WelcomeSubtitle>
                Manage your portfolio, track progress, and create amazing content
              </WelcomeSubtitle>
            </WelcomeText>
            <StatusIndicator $type={isOffline ? 'offline' : 'online'}>
              {isOffline ? <WifiOff size={12} /> : <Wifi size={12} />}
              {isOffline ? 'Offline' : 'Online'}
            </StatusIndicator>
          </WelcomeHeader>
        </WelcomeSection>

        {/* Stats Cards */}
        <DashboardGrid>
          <StatCard $color="#3b82f6">
            <StatHeader>
              <StatIcon $color="#3b82f6">
                <GalleryIcon size={20} />
              </StatIcon>
              <StatTrend $positive={true}>
                <TrendingUp size={12} />
                +12%
              </StatTrend>
            </StatHeader>
            <StatValue>{stats.totalPieces}</StatValue>
            <StatLabel>Total Pieces</StatLabel>
          </StatCard>

          <StatCard $color="#10b981">
            <StatHeader>
              <StatIcon $color="#10b981">
                <CheckCircle size={20} />
              </StatIcon>
              <StatTrend $positive={true}>
                <TrendingUp size={12} />
                +8%
              </StatTrend>
            </StatHeader>
            <StatValue>{stats.completedPieces}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatCard>

          <StatCard $color="#8b5cf6">
            <StatHeader>
              <StatIcon $color="#8b5cf6">
                <Eye size={20} />
              </StatIcon>
              <StatTrend $positive={true}>
                <TrendingUp size={12} />
                +24%
              </StatTrend>
            </StatHeader>
            <StatValue>{stats.viewCount.toLocaleString()}</StatValue>
            <StatLabel>Total Views</StatLabel>
          </StatCard>

          <StatCard $color="#f59e0b">
            <StatHeader>
              <StatIcon $color="#f59e0b">
                <Target size={20} />
              </StatIcon>
              <StatTrend $positive={false}>
                <TrendingUp size={12} style={{ transform: 'rotate(180deg)' }} />
                -2%
              </StatTrend>
            </StatHeader>
            <StatValue>{stats.portfolios}</StatValue>
            <StatLabel>Active Portfolios</StatLabel>
          </StatCard>
        </DashboardGrid>

        {/* Main Content Grid */}
        <SectionGrid>
          {/* Recent Activity */}
          <Section>
            <SectionHeader>
              <SectionTitle>Recent Activity</SectionTitle>
              <SectionAction>
                View All
                <ArrowRight size={14} />
              </SectionAction>
            </SectionHeader>

            {recentActivity.length > 0 ? (
              <ActivityList>
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id}>
                    <ActivityIcon $color={activity.color}>
                      {activity.icon}
                    </ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle>{activity.title}</ActivityTitle>
                      <ActivityDescription>{activity.description}</ActivityDescription>
                    </ActivityContent>
                    <ActivityTime>{activity.time}</ActivityTime>
                  </ActivityItem>
                ))}
              </ActivityList>
            ) : (
              <EmptyState>
                <Activity className="empty-icon" />
                <div className="empty-title">No recent activity</div>
                <div className="empty-description">
                  Your recent actions will appear here
                </div>
              </EmptyState>
            )}
          </Section>

          {/* Quick Actions */}
          <Section>
            <SectionHeader>
              <SectionTitle>Quick Actions</SectionTitle>
            </SectionHeader>

            <QuickActionGrid>
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.id}
                  $color={action.color}
                  onClick={action.onClick}
                >
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-title">{action.title}</div>
                </QuickActionCard>
              ))}
            </QuickActionGrid>
          </Section>
        </SectionGrid>
      </DashboardContent>
    </DashboardContainer>
  );
}