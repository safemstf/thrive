// src/app/dashboard/layout.tsx - Lean & Reusable
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { useAuth } from '@/providers/authProvider';
import { useApiClient } from '@/lib/api-client';
import type { Portfolio } from '@/types/portfolio.types';

// Import existing styled components - no duplication!
import {
  PageContainer,
  FlexRow,
  FlexColumn,
  Card,
  BaseButton,
  DevBadge,
  responsive,
  focusRing,
  hoverLift
} from '@/styles/styled-components';

// Import utilities for logic
import { utils } from '@/utils';

import { 
  User, Target, Home, Settings, Shield, ChevronLeft, Menu, X, Plus, ArrowLeft,
  GraduationCap, FolderOpen, Code, Brush, Circle
} from 'lucide-react';

// ===========================================
// DASHBOARD-SPECIFIC COMPONENTS ONLY
// ===========================================

const DashboardContainer = styled(PageContainer)`
  display: flex;
  min-height: 100vh;
`;

const MobileHeader = styled.header`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border-medium);
  padding: 0 var(--spacing-lg);
  align-items: center;
  justify-content: space-between;
  z-index: 50;
  
  ${responsive.below.md} {
    display: flex;
  }
`;

const Sidebar = styled.aside<{ $collapsed: boolean; $mobileOpen: boolean }>`
  width: ${props => props.$collapsed ? '72px' : '280px'};
  background: var(--color-background-secondary);
  border-right: 1px solid var(--color-border-medium);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  transition: width var(--transition-normal);
  z-index: 45;
  display: flex;
  flex-direction: column;
  
  ${responsive.below.md} {
    width: 280px;
    transform: ${props => props.$mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    top: 60px;
    height: calc(100vh - 60px);
  }
`;

const SidebarSection = styled.div<{ $collapsed?: boolean }>`
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
`;

const CollapseButton = styled(BaseButton).attrs({ $variant: 'ghost', $size: 'sm' })<{ $collapsed: boolean }>`
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 28px;
  height: 28px;
  padding: 0;
  transform: ${props => props.$collapsed ? 'rotate(180deg)' : 'rotate(0deg)'};
  
  ${responsive.below.md} {
    display: none;
  }
`;

const UserInfo = styled(FlexRow).attrs({ $gap: 'var(--spacing-md)', $align: 'center' })``;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  background: var(--color-background-tertiary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  flex-shrink: 0;
`;

const PortfolioIndicator = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: ${props => props.$color};
  flex-shrink: 0;
  margin-top: 2px;
`;

const NavItem = styled(Link)<{ $active: boolean; $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  color: ${props => props.$active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'};
  background: ${props => props.$active ? 'var(--color-background-tertiary)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'var(--color-border-medium)' : 'transparent'};
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: var(--transition-fast);
  justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};
  min-height: 44px;

  ${focusRing}
  
  &:hover {
    background: var(--color-background-tertiary);
    border-color: var(--color-border-medium);
    color: var(--color-text-primary);
  }
`;

const Badge = styled.span`
  font-size: var(--font-size-xs);
  padding: 2px var(--spacing-xs);
  background: var(--color-accent-blue);
  color: white;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
`;

const MainContent = styled.main<{ $sidebarCollapsed: boolean }>`
  flex: 1;
  margin-left: ${props => props.$sidebarCollapsed ? '72px' : '280px'};
  min-height: 100vh;
  transition: margin-left var(--transition-normal);
  background: var(--color-background-primary);
  
  ${responsive.below.md} {
    margin-left: 0;
    padding-top: 60px;
  }
`;

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 40;
  backdrop-filter: blur(4px);
  
  ${responsive.below.md} {
    display: block;
  }
`;

// ===========================================
// DEV MODE TOGGLE - Easy Auth Bypass
// ===========================================

// 🚨 DEVELOPMENT MODE SETTINGS 🚨
// Set SKIP_AUTH to true to bypass authentication during development
// Set to false for production builds
const SKIP_AUTH = process.env.NODE_ENV === 'development' && true;

// Quick toggle: Change 'true' to 'false' above to enable auth
// Or use environment variable: SKIP_AUTH=false npm run dev

// ===========================================
// COMPONENT LOGIC
// ===========================================

interface NavItemConfig {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  requiresPortfolio?: boolean;
  portfolioTypes?: string[];
  isAdmin?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: <Home size={18} />,
    description: 'Dashboard home'
  },
  {
    href: '/dashboard/thrive',
    label: 'Survival of the Fittest',
    icon: <Target size={18} />,
    description: 'Challenges & skill development',
    badge: 'New'
  },
  {
    href: '/dashboard/profile',
    label: 'Portfolio Hub',
    icon: <User size={18} />,
    description: 'Manage your portfolio & profile'
  },
  {
    href: '/dashboard/gallery',
    label: 'Creative Studio',
    icon: <Brush size={18} />,
    description: 'Art, photography & design portfolio',
    requiresPortfolio: true,
    portfolioTypes: ['creative', 'hybrid']
  },
  {
    href: '/dashboard/writing',
    label: 'Teaching Portfolio',
    icon: <GraduationCap size={18} />,
    description: 'Educational content & curriculum',
    requiresPortfolio: true,
    portfolioTypes: ['educational', 'hybrid']
  },
  {
    href: '/dashboard/projects',
    label: 'Tech Portfolio',
    icon: <Code size={18} />,
    description: 'Software projects & development',
    requiresPortfolio: true,
    portfolioTypes: ['professional', 'hybrid']
  },
  {
    href: '/dashboard/api-test',
    label: 'Admin Panel',
    icon: <Shield size={18} />,
    description: 'System administration',
    isAdmin: true
  },
  {
    href: '/',
    label: 'Homepage',
    icon: <Home size={18} />,
    description: 'Return to main site'
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const apiClient = useApiClient();
  
  // Mock user data for dev mode
  const currentUser = SKIP_AUTH ? {
    name: 'Dev User',
    email: 'dev@example.com',
    role: 'admin'
  } : user;
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use utilities for data fetching
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!currentUser) return;
      
      try {
        // Skip API call in dev mode
        if (SKIP_AUTH) {
          setPortfolio({
            kind: 'hybrid',
            // Add other mock portfolio properties as needed
          } as Portfolio);
          setPortfolioLoading(false);
          return;
        }
        
        const portfolioData = await apiClient.portfolio.getMyPortfolio();
        setPortfolio(portfolioData);
      } catch (error: any) {
        if (error?.status !== 404) {
          console.error('Error fetching portfolio:', error);
        }
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchPortfolio();
  }, [currentUser, apiClient]);

  // Use utility functions for logic
  const getVisibleNavItems = () => {
    return NAV_ITEMS.filter(item => {
      if (item.requiresPortfolio && !portfolio) return false;
      if (item.portfolioTypes && portfolio) {
        return item.portfolioTypes.includes(portfolio.kind);
      }
      if (item.isAdmin && currentUser?.role !== 'admin') return false;
      return true;
    });
  };

  const getPortfolioTypeInfo = (type?: string) => {
    const portfolioTypes = {
      creative: { 
        color: '#8b5cf6', 
        label: 'Creative Portfolio',
        icon: <Brush size={14} />,
        description: 'Art • Photography • Design'
      },
      educational: { 
        color: '#3b82f6', 
        label: 'Teaching Portfolio',
        icon: <GraduationCap size={14} />,
        description: 'Education • Curriculum • Training'
      },
      professional: { 
        color: '#059669', 
        label: 'Tech Portfolio',
        icon: <Code size={14} />,
        description: 'Software • Development • Engineering'
      },
      hybrid: { 
        color: '#10b981', 
        label: 'Multi-Portfolio',
        icon: <FolderOpen size={14} />,
        description: 'Creative • Teaching • Professional'
      }
    };

    return portfolioTypes[type as keyof typeof portfolioTypes] || {
      color: '#666666', 
      label: 'Portfolio',
      icon: <User size={14} />,
      description: 'Professional Portfolio'
    };
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

  const visibleNavItems = getVisibleNavItems();

  // Conditional auth wrapper based on dev mode
  const AuthWrapper = SKIP_AUTH ? 
    ({ children }: { children: React.ReactNode }) => <>{children}</> : 
    ProtectedRoute;

  return (
    <AuthWrapper>
      <DashboardContainer>
        {/* Mobile Header */}
        <MobileHeader>
          <BaseButton 
            $variant="ghost" 
            $size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </BaseButton>
          
          <h1 style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: 'var(--font-weight-normal)', 
            color: 'var(--color-text-primary)', 
            margin: 0,
            fontFamily: 'var(--font-display)'
          }}>
            Dashboard {SKIP_AUTH && <DevBadge>[DEV]</DevBadge>}
          </h1>
          
          {portfolio && (
            <PortfolioIndicator $color={getPortfolioTypeInfo(portfolio.kind).color}>
              <Circle size={8} fill="currentColor" />
            </PortfolioIndicator>
          )}
        </MobileHeader>

        {/* Sidebar */}
        <Sidebar $collapsed={sidebarCollapsed} $mobileOpen={mobileMenuOpen}>
          {/* Header Section */}
          <SidebarSection>
            <CollapseButton 
              $collapsed={sidebarCollapsed}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft size={14} />
            </CollapseButton>
            
            {!sidebarCollapsed && (
              <UserInfo>
                <Avatar>
                  <User size={20} />
                </Avatar>
                <FlexColumn $gap="var(--spacing-xs)">
                  <div style={{ 
                    fontSize: 'var(--font-size-base)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-display)' 
                  }}>
                    {currentUser?.name || 'User'}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--color-text-secondary)' 
                  }}>
                    {currentUser?.email || currentUser?.role || 'member'}
                  </div>
                </FlexColumn>
              </UserInfo>
            )}
          </SidebarSection>

          {/* Portfolio Status */}
          {!portfolioLoading && (
            <SidebarSection>
              {portfolio ? (
                <FlexRow $gap="var(--spacing-md)" $align="flex-start">
                  <PortfolioIndicator $color={getPortfolioTypeInfo(portfolio.kind).color}>
                    <Circle size={6} fill="currentColor" />
                  </PortfolioIndicator>
                  {!sidebarCollapsed && (
                    <FlexColumn $gap="var(--spacing-sm)">
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        Active Portfolio
                      </div>
                      <FlexRow $gap="var(--spacing-sm)" $align="flex-start">
                        {getPortfolioTypeInfo(portfolio.kind).icon}
                        <FlexColumn $gap="var(--spacing-xs)">
                          <div style={{ 
                            fontSize: 'var(--font-size-sm)', 
                            fontWeight: 'var(--font-weight-medium)', 
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-display)' 
                          }}>
                            {getPortfolioTypeInfo(portfolio.kind).label}
                          </div>
                          <div style={{ 
                            fontSize: 'var(--font-size-xs)', 
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.4 
                          }}>
                            {getPortfolioTypeInfo(portfolio.kind).description}
                          </div>
                        </FlexColumn>
                      </FlexRow>
                    </FlexColumn>
                  )}
                </FlexRow>
              ) : (
                !sidebarCollapsed && (
                  <Card $padding="md" $hover>
                    <FlexRow $gap="var(--spacing-md)" $align="flex-start">
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        background: 'var(--color-background-secondary)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        flexShrink: 0
                      }}>
                        <Plus size={14} />
                      </div>
                      <FlexColumn $gap="var(--spacing-sm)">
                        <div style={{ 
                          fontSize: 'var(--font-size-sm)', 
                          fontWeight: 'var(--font-weight-medium)', 
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-display)' 
                        }}>
                          Create Portfolio
                        </div>
                        <div style={{ 
                          fontSize: 'var(--font-size-xs)', 
                          color: 'var(--color-text-secondary)' 
                        }}>
                          Choose your focus
                        </div>
                        <Link href="/dashboard/profile" style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-primary)',
                          textDecoration: 'none',
                          fontWeight: 'var(--font-weight-medium)',
                          background: 'var(--color-background-secondary)',
                          border: '1px solid var(--color-primary-600)',
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'var(--transition-fast)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Get Started
                        </Link>
                      </FlexColumn>
                    </FlexRow>
                  </Card>
                )
              )}
            </SidebarSection>
          )}

          {/* Navigation */}
          <div style={{ flex: 1, padding: 'var(--spacing-lg) 0' }}>
            <FlexColumn $gap="var(--spacing-xs)" style={{ padding: '0 var(--spacing-md)' }}>
              {visibleNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  $active={pathname === item.href}
                  $collapsed={sidebarCollapsed}
                  title={sidebarCollapsed ? `${item.label} - ${item.description}` : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  {!sidebarCollapsed && (
                    <FlexColumn $gap="2px" style={{ flex: 1, minWidth: 0 }}>
                      <FlexRow $justify="space-between" $align="center">
                        <div style={{ 
                          fontWeight: 'var(--font-weight-medium)', 
                          fontSize: 'var(--font-size-sm)',
                          fontFamily: 'var(--font-display)' 
                        }}>
                          {item.label}
                        </div>
                        {item.badge && <Badge>{item.badge}</Badge>}
                      </FlexRow>
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--color-text-tertiary)',
                        lineHeight: 1.2 
                      }}>
                        {item.description}
                      </div>
                    </FlexColumn>
                  )}
                </NavItem>
              ))}
            </FlexColumn>
          </div>

          {/* Footer */}
          <SidebarSection>
            <FlexColumn $gap="var(--spacing-xs)">
              <Link href="/dashboard/settings" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-md)',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                border: '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition-fast)',
                minHeight: '40px'
              }}>
                <Settings size={16} />
                {!sidebarCollapsed && <span>Settings</span>}
              </Link>
              <BaseButton 
                $variant="secondary" 
                $size="sm" 
                $fullWidth 
                onClick={handleLogout}
                style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: 'var(--spacing-md)' }}
              >
                <ArrowLeft size={16} />
                {!sidebarCollapsed && <span>Sign Out</span>}
              </BaseButton>
            </FlexColumn>
          </SidebarSection>
        </Sidebar>

        {/* Mobile Overlay */}
        {mobileMenuOpen && <MobileOverlay onClick={() => setMobileMenuOpen(false)} />}

        {/* Main Content */}
        <MainContent $sidebarCollapsed={sidebarCollapsed}>
          {children}
        </MainContent>
      </DashboardContainer>
    </AuthWrapper>
  );
}