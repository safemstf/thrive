// src/app/dashboard/layout.tsx - Coordinated Dashboard with Centralized State Management
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { useAuth } from '@/providers/authProvider';
import { useApiClient } from '@/lib/api-client';
import { useOffline } from '@/hooks/useOffline';
import { Header } from '@/components/misc/header';
import type { Portfolio } from '@/types/portfolio.types';
import {
  Target, BarChart3, Award, BookOpen,
  Brush, GraduationCap, Code, FolderOpen,
  FlaskConical,
  LayoutDashboard,
  User2
} from 'lucide-react';
import { PageContainer, responsive } from '@/styles/styled-components';
import { utils } from '@/utils';

// ===========================================
// TYPES
// ===========================================

interface DashboardContextType {
  portfolio: Portfolio | null;
  portfolioLoading: boolean;
  portfolioError: string | null;
  hasPortfolio: boolean;
  dataSource: 'live' | 'offline' | 'demo' | 'dev';
  refetchPortfolio: () => Promise<void>;
}

// Create context for centralized state management
const DashboardContext = React.createContext<DashboardContextType | null>(null);

export const useDashboardContext = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within DashboardLayout');
  }
  return context;
};

// ===========================================
// STYLED COMPONENTS
// ===========================================

const DashboardContainer = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden; /* Prevent horizontal scrolling during animations */
`;

const DashboardContent = styled.div<{ $sidebarCollapsed?: boolean }>`
  display: flex;
  flex: 1;
  position: relative;
  
  /* Create a coordinated sliding effect */
  transform: ${props => props.$sidebarCollapsed
    ? 'translateX(-104px)' /* Slide content left when sidebar collapses */
    : 'translateX(0)'
  };
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
  
  ${responsive.below.lg} {
    transform: none; /* Disable on mobile */
    transition: none;
  }
  
  /* Add subtle scale effect during transition */
  & > * {
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform-origin: left center;
  }
`;

const MainContent = styled.main<{ $withSidebar?: boolean; $sidebarCollapsed?: boolean }>`
  flex: 1;
  min-height: calc(100vh - 80px);
  background: var(--color-background-primary);
  position: relative;
  
  /* Synchronized animation with sidebar - same timing and easing */
  transition: margin-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: margin-left;
  
  /* Coordinate with sidebar transform animation */
  ${props => props.$withSidebar && `
    margin-left: ${props.$sidebarCollapsed ? '72px' : '280px'};
    
    ${responsive.below.lg} {
      margin-left: 0;
      transition: none; /* Disable on mobile where sidebar overlays */
    }
  `}
  
  /* Add subtle content shift animation for better visual flow */
  & > * {
    transition: padding 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
`;

const ContentWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;  /* Reduced from your likely larger value */
  margin: 0 auto;
  width: 100%;
  
  ${responsive.below.md} {
    padding: 1.5rem;
  }
  
  ${responsive.below.sm} {
    padding: 1rem;
  }
`;
// ===========================================
// CONFIGURATION
// ===========================================

const SKIP_AUTH = process.env.NODE_ENV === 'development' && true;


type QuickAction = {
  id: "home" | "thrive" | "profile" | "api-test";
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  adminOnly?: boolean;
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "home",
    title: "Dashboard",
    description: "Overview & widgets",
    icon: <LayoutDashboard size={24} />,
    color: "#06b6d4",
    href: "/dashboard"
  },
  {
    id: "thrive",
    title: "Thrive",
    description: "Skill assessments",
    icon: <Target size={24} />,
    color: "#3b82f6",
    href: "/dashboard/thrive"
  },
  {
    id: "profile",
    title: "Profile",
    description: "Manage your profile",
    icon: <User2 size={24} />,
    color: "#10b981",
    href: "/dashboard/profile"
  },
  {
    id: "api-test",
    title: "API Test",
    description: "Internal tools",
    icon: <FlaskConical size={24} />,
    color: "#ef4444",
    href: "/dashboard/api-test",
    adminOnly: true
  }
];

// filter helper
export const getQuickActions = (isAdmin: boolean) =>
  QUICK_ACTIONS.filter(a => !a.adminOnly || isAdmin);


const PORTFOLIO_SECTIONS = [
  {
    id: 'creative',
    title: 'Creative Studio',
    href: '/dashboard/gallery',
    icon: <Brush size={18} />,
    types: ['creative', 'hybrid']
  },
  {
    id: 'teaching',
    title: 'Teaching Hub',
    href: '/dashboard/writing',
    icon: <GraduationCap size={18} />,
    types: ['educational', 'hybrid']
  },
  {
    id: 'tech',
    title: 'Tech Projects',
    href: '/dashboard/projects',
    icon: <Code size={18} />,
    types: ['professional', 'hybrid']
  }
];

// ===========================================
// HOOKS FOR SMOOTH SCROLL TRACKING
// ===========================================

const useScrollState = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const newIsScrolled = scrollY > 50;

        if (newIsScrolled !== isScrolled) {
          setIsScrolled(newIsScrolled);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isScrolled]);

  return isScrolled;
};

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const apiClient = useApiClient();

  const {
    isOffline,
    hasOfflineData,
    initializeOfflineMode,
    getOfflineData
  } = useOffline();

  // Centralized state management
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // UI state
  const isScrolled = useScrollState();

  // Handle SSR hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentUser = SKIP_AUTH ? {
    name: 'Dev User',
    email: 'dev@example.com',
    role: 'admin'
  } : user;

  // Centralized portfolio loading logic with stable dependencies
  const fetchPortfolio = useCallback(async () => {
    if (!currentUser || !isClient) return;

    setPortfolioLoading(true);
    setPortfolioError(null);

    try {
      if (SKIP_AUTH) {
        setPortfolio({
          kind: 'hybrid',
          title: 'Development Portfolio',
          id: 'dev-portfolio',
          username: 'devuser',
          createdAt: new Date()
        } as Portfolio);
        setPortfolioLoading(false);
        return;
      }

      const portfolioData = await apiClient.portfolio.getMyPortfolio();
      setPortfolio(portfolioData);
      setPortfolioLoading(false);

    } catch (error) {
      console.error('Portfolio fetch error:', error);
      setPortfolioError(error instanceof Error ? error.message : 'Failed to load portfolio');
      setPortfolioLoading(false);

      // Fallback to offline mode if available
      if (hasOfflineData) {
        const offlineData = getOfflineData();
        if (offlineData?.portfolio) {
          setPortfolio(offlineData.portfolio);
          setPortfolioError(null);
        }
      }
    }
  }, [currentUser?.email, isClient, hasOfflineData]); // Stable dependencies only

  // Initial portfolio fetch
  useEffect(() => {
    if (isClient) {
      fetchPortfolio();
    }
  }, [fetchPortfolio, isClient]);

  // Determine data source and portfolio state
  const dashboardContext = useMemo<DashboardContextType>(() => {
    let dataSource: DashboardContextType['dataSource'] = 'live';

    if (SKIP_AUTH) {
      dataSource = 'dev';
    } else if (isOffline || portfolioError) {
      dataSource = hasOfflineData ? 'offline' : 'demo';
    }

    return {
      portfolio,
      portfolioLoading,
      portfolioError,
      hasPortfolio: !!portfolio,
      dataSource,
      refetchPortfolio: fetchPortfolio
    };
  }, [portfolio, portfolioLoading, portfolioError, isOffline, hasOfflineData, fetchPortfolio]);

  // Helper functions
  const getDataSourceStatus = () => {
    const { dataSource } = dashboardContext;
    switch (dataSource) {
      case 'dev': return { type: 'dev' as const, label: 'DEV' };
      case 'offline': return { type: 'offline' as const, label: 'OFFLINE' };
      case 'demo': return { type: 'offline' as const, label: 'DEMO' };
      default: return { type: 'live' as const, label: 'LIVE' };
    }
  };

  const handleLogout = utils.performance.debounce(async () => {
    try {
      if (SKIP_AUTH) {
        console.log('Dev mode: Logout bypassed');
        return;
      }
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, 300);

  const handleSettingsClick = () => {
    router.push('/dashboard/settings');
  };

  const getVisiblePortfolioSections = () => {
    if (!portfolio) return [];
    return PORTFOLIO_SECTIONS.filter(section =>
      section.types.includes(portfolio.kind)
    );
  };

  // Prepare sidebar configuration
  const sidebarConfig = useMemo(() => {
    const isAdmin = currentUser?.role === 'admin' || SKIP_AUTH;

    return {
      user: currentUser ? {
        name: currentUser.name || 'User',
        email: currentUser.email || 'member@example.com',
        role: currentUser.role
      } : undefined,
      portfolio: portfolio ? {
        kind: portfolio.kind,
        title: portfolio.title
      } : undefined,
      quickActions: getQuickActions(isAdmin), // Filter admin actions
      portfolioSections: getVisiblePortfolioSections(),
      dataStatus: getDataSourceStatus(),
      onLogout: handleLogout,
      onSettingsClick: handleSettingsClick
    };
  }, [currentUser, portfolio, handleLogout]);

  const AuthWrapper = SKIP_AUTH ?
    ({ children }: { children: React.ReactNode }) => <>{children}</> :
    ProtectedRoute;

  return (
    <DashboardContext.Provider value={dashboardContext}>
      <AuthWrapper>
        <DashboardContainer>
          {/* Enhanced Header with smooth sidebar */}
          <Header
            title="Learn Morra"
            subtitle="Professional Development Dashboard"
            withSidebar={true}
            sidebarConfig={sidebarConfig}
          />

          <DashboardContent $sidebarCollapsed={isScrolled}>
            <MainContent
              $withSidebar={true}
              $sidebarCollapsed={isScrolled}
            >
              <ContentWrapper>
                {children}
              </ContentWrapper>
            </MainContent>
          </DashboardContent>
        </DashboardContainer>
      </AuthWrapper>
    </DashboardContext.Provider>
  );
}