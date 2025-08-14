// src/app/dashboard/page.tsx - Enhanced with Better Analytics Integration
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
  ExternalLink,
  Eye
} from "lucide-react";

// Import view components
import { GalleryView } from '@/components/dashboard/views/GalleryView';
import { LearningView } from '@/components/dashboard/views/learningView';
import { AnalyticsView } from '@/components/dashboard/views/analyticsView';

// Import new reusable patterns
import {
  DashboardLayout,
  WelcomeHero,
  PortfolioTypeGrid,
  StatsOverview,
  QuickActions,
  RecentActivity,
  ViewNavigation
} from '@/components/dashboard/patterns/index';

import { 
  PageContainer,
  LoadingContainer,
  LoadingSpinner,
  ErrorContainer,
  Card,
  CardContent,
  BaseButton,
  Heading2,
  BodyText,
  FlexRow
} from '@/styles/styled-components';

type DashboardView = 'overview' | 'gallery' | 'learning' | 'analytics';

// Enhanced mock data generator for analytics
const generateMockAnalyticsData = (portfolio: any, galleryPieces: any[]) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    // Portfolio metrics
    totalViews: Math.floor(Math.random() * 5000) + 1000,
    uniqueVisitors: Math.floor(Math.random() * 1000) + 500,
    engagementRate: Math.floor(Math.random() * 40) + 60, // 60-100%
    averageSessionTime: `${Math.floor(Math.random() * 5) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    
    // Growth metrics
    weeklyGrowth: Math.floor(Math.random() * 30) - 5, // -5% to +25%
    monthlyGrowth: Math.floor(Math.random() * 50) + 10, // 10% to 60%
    
    // Content metrics
    totalPieces: galleryPieces?.length || Math.floor(Math.random() * 10) + 5,
    completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
    averageScore: Math.floor(Math.random() * 30) + 70, // 70-100%
    
    // Time-based data
    createdAt: portfolio?.createdAt || oneMonthAgo,
    lastActivity: portfolio?.updatedAt || new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    
    // Traffic sources
    trafficSources: [
      { source: 'Direct', percentage: Math.floor(Math.random() * 20) + 35 },
      { source: 'Social Media', percentage: Math.floor(Math.random() * 15) + 20 },
      { source: 'Search', percentage: Math.floor(Math.random() * 10) + 15 },
      { source: 'Referral', percentage: Math.floor(Math.random() * 10) + 5 }
    ],
    
    // Performance by content type
    contentPerformance: Array.isArray(galleryPieces)
    ? galleryPieces.map((piece, index) => ({
        id: piece.id || `piece-${index}`,
        title: piece.title || `Piece ${index + 1}`,
        views: Math.floor(Math.random() * 500) + 50,
        likes: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 20) + 2,
        engagementRate: Math.floor(Math.random() * 40) + 60
      }))
    : []
  };
};

// Enhanced achievements generator
const generateMockAchievements = (portfolio: any, stats: any) => {
  const achievements = [];
  const now = new Date();
  
  // Portfolio creation achievement
  achievements.push({
    id: 'portfolio-created',
    title: 'Portfolio Created',
    description: `Successfully created your ${portfolio?.kind || 'professional'} portfolio`,
    unlockedAt: portfolio?.createdAt || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    type: 'milestone' as const,
    icon: '🎯'
  });

  // View-based achievements
  if (stats.totalViews > 1000) {
    achievements.push({
      id: 'view-milestone',
      title: 'Popular Portfolio',
      description: `Reached ${stats.totalViews.toLocaleString()} total views`,
      unlockedAt: new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      type: 'growth' as const,
      icon: '👁️'
    });
  }

  // Engagement achievements
  if (stats.engagementRate > 80) {
    achievements.push({
      id: 'high-engagement',
      title: 'High Engagement',
      description: `Achieved ${stats.engagementRate}% engagement rate`,
      unlockedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      type: 'performance' as const,
      icon: '📈'
    });
  }

  // Content achievements
  if (stats.totalPieces >= 5) {
    achievements.push({
      id: 'content-creator',
      title: 'Content Creator',
      description: `Added ${stats.totalPieces} pieces to your portfolio`,
      unlockedAt: new Date(now.getTime() - Math.random() * 21 * 24 * 60 * 60 * 1000),
      type: 'content' as const,
      icon: '✨'
    });
  }

  // Growth achievements
  if (stats.weeklyGrowth > 15) {
    achievements.push({
      id: 'rapid-growth',
      title: 'Rapid Growth',
      description: `Achieved ${stats.weeklyGrowth}% growth this week`,
      unlockedAt: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      type: 'growth' as const,
      icon: '🚀'
    });
  }

  return achievements.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
};

export default function Dashboard() {
  const router = useRouter();
  const { portfolio, loading, error, hasPortfolio, galleryPieces } = usePortfolioManagement();
  const { portfolioTypeConfig, formatTimeAgo } = useDashboardLogic();
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  // Portfolio type configuration with icons
  const PORTFOLIO_TYPES = [
    {
      key: 'creative',
      ...portfolioTypeConfig.creative,
      icon: <Brush size={20} />,
      features: ['Gallery showcase', 'Visual projects'],
      path: '/dashboard/profile?create=creative'
    },
    {
      key: 'educational', 
      ...portfolioTypeConfig.educational,
      icon: <Brain size={20} />,
      features: ['Learning progress', 'Achievement tracking'],
      path: '/dashboard/profile?create=educational'
    },
    {
      key: 'professional',
      ...portfolioTypeConfig.professional,
      icon: <Code size={20} />,
      features: ['Technical skills', 'Project showcase'],
      path: '/dashboard/profile?create=professional'
    },
    {
      key: 'hybrid',
      ...portfolioTypeConfig.hybrid,
      icon: <Layers size={20} />,
      features: ['Multi-disciplinary', 'Flexible format'],
      path: '/dashboard/profile?create=hybrid'
    }
  ];

  // View availability check
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

  // Navigation items for view toggle
  const navigationItems = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { key: 'gallery', label: 'Gallery', icon: <GalleryIcon size={16} />, condition: isViewAvailable('gallery') },
    { key: 'learning', label: 'Learning', icon: <Brain size={16} />, condition: isViewAvailable('learning') },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> }
  ].filter(item => item.condition !== false);

  // Enhanced dashboard stats with mock analytics data
  const dashboardStats = hasPortfolio ? {
    portfolioType: portfolio?.kind,
    totalItems: galleryPieces?.length || 0,
    recentActivity: 0,
    // Add analytics-specific data (this will include completionRate, weeklyGrowth, averageScore)
    ...generateMockAnalyticsData(portfolio, galleryPieces)
  } : null;

  // Enhanced achievements with dynamic generation
  const achievements = hasPortfolio && dashboardStats ? 
    generateMockAchievements(portfolio, dashboardStats) : [];

  // Quick actions configuration
  const quickActions = hasPortfolio ? [
    {
      title: 'Portfolio Hub',
      description: 'Manage & edit',
      icon: <Settings size={20} />,
      href: '/dashboard/profile'
    },
    ...(isViewAvailable('gallery') ? [{
      title: 'Gallery',
      description: 'View artwork', 
      icon: <GalleryIcon size={20} />,
      onClick: () => setActiveView('gallery')
    }] : []),
    {
      title: 'Analytics',
      description: 'View insights',
      icon: <BarChart3 size={20} />,
      onClick: () => setActiveView('analytics')
    },
    {
      title: 'View Public',
      description: 'See your portfolio',
      icon: <ExternalLink size={20} />,
      href: `/portfolio/${portfolio?.id}`,
      external: true
    }
  ] : [];

  const recentActivities = hasPortfolio ? [
    {
      id: '1',
      title: 'Portfolio created',
      description: `Your ${portfolio?.kind} portfolio is now active`,
      timestamp: portfolio?.createdAt || new Date(),
      type: 'portfolio' as const,
      metadata: { category: 'Portfolio' }
    },
    ...(achievements.slice(0, 2).map((achievement, index) => ({
      id: `achievement-${index + 2}`,
      title: `Achievement unlocked: ${achievement.title}`,
      description: achievement.description,
      timestamp: achievement.unlockedAt,
      type: 'achievement' as const,
      metadata: { category: 'Achievement', icon: achievement.icon }
    })))
  ] : [];

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <PageContainer>
          <LoadingContainer>
            <LoadingSpinner />
            <BodyText>Loading dashboard...</BodyText>
          </LoadingContainer>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <PageContainer>
          <ErrorContainer>
            <Card>
              <CardContent>
                <Heading2>Something went wrong</Heading2>
                <BodyText>{error}</BodyText>
                <BaseButton onClick={() => window.location.reload()}>
                  Try Again
                </BaseButton>
              </CardContent>
            </Card>
          </ErrorContainer>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  // No portfolio state - Show portfolio type selection
  if (!hasPortfolio) {
    return (
      <ProtectedRoute>
        <PageContainer>
          <DashboardLayout>
            <WelcomeHero
              title="Welcome to Your Dashboard"
              description="Create your first portfolio to start tracking your professional journey and showcase your work."
              icon={<Sparkles size={32} />}
            />
            
            <PortfolioTypeGrid
              portfolioTypes={PORTFOLIO_TYPES}
              onTypeSelect={(type) => router.push(type.path)}
            />
          </DashboardLayout>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  // Portfolio dashboard - we know portfolio exists here
  const currentPortfolioType = PORTFOLIO_TYPES.find(type => type.key === portfolio?.kind);

  return (
    <ProtectedRoute>
      <PageContainer>
        <DashboardLayout>
          {/* Header with Navigation */}
          <FlexRow $justify="space-between" $align="center">
            <div>
              <Heading2>Your Dashboard</Heading2>
              <BodyText>{currentPortfolioType?.title}</BodyText>
            </div>
            
            <ViewNavigation
              items={navigationItems}
              activeView={activeView}
              onViewChange={(view) => setActiveView(view as DashboardView)}
            />
          </FlexRow>

          {/* Main Content */}
          {activeView === 'overview' && (
            <>
              <StatsOverview
                stats={dashboardStats || { totalItems: 0, recentActivity: 0 }}
                portfolioConfig={currentPortfolioType}
                galleryCount={galleryPieces?.length || 0}
              />
              
              <FlexRow $gap="2rem" $align="flex-start">
                <RecentActivity 
                  activities={recentActivities}
                  formatTimeAgo={formatTimeAgo}
                />
                
                <QuickActions 
                  actions={quickActions}
                />
              </FlexRow>
            </>
          )}

          {activeView === 'gallery' && isViewAvailable('gallery') && (
            <GalleryView 
              galleryItems={galleryPieces || []}
              portfolioId={portfolio!.id}
            />
          )}

          {activeView === 'learning' && isViewAvailable('learning') && (
            <LearningView 
              conceptProgress={[]}
              stats={dashboardStats || { 
                totalItems: 0, 
                recentActivity: 0, 
                completionRate: 0, 
                weeklyGrowth: 0 
              }}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView 
              stats={dashboardStats}
              achievements={achievements}
              formatTimeAgo={formatTimeAgo}
            />
          )}
        </DashboardLayout>
      </PageContainer>
    </ProtectedRoute>
  );
}