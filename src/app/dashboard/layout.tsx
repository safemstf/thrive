// src/app/dashboard/layout.tsx - Polished & Professional
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { useAuth } from '@/providers/authProvider';
import { useApiClient } from '@/lib/api-client';
import type { Portfolio } from '@/types/portfolio.types';
import { theme } from '@/styles/theme';
import { 
  User,
  Target, 
  Home,
  Settings,
  Shield,
  Palette,
  BarChart3,
  ChevronLeft,
  Menu,
  X,
  Plus,
  ArrowLeft,
  GraduationCap,
  Camera,
  FolderOpen,
  Briefcase,
  Code,
  BookOpen,
  Brush,
  Circle
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  requiresPortfolio?: boolean;
  portfolioTypes?: string[];
  isAdmin?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
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

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const apiClient = useApiClient();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch portfolio on mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;
      
      try {
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
  }, [user, apiClient]);

  // Filter navigation items based on user state
  const getVisibleNavItems = (): NavItem[] => {
    return navItems.filter(item => {
      if (item.requiresPortfolio && !portfolio) return false;
      if (item.portfolioTypes && portfolio) {
        return item.portfolioTypes.includes(portfolio.kind);
      }
      if (item.isAdmin && user?.role !== 'admin') return false;
      return true;
    });
  };

  const visibleNavItems = getVisibleNavItems();

  const getPortfolioTypeInfo = (type?: string) => {
    switch (type) {
      case 'creative':
        return { 
          color: '#8b5cf6', 
          label: 'Creative Portfolio',
          icon: <Brush size={14} />,
          description: 'Art • Photography • Design'
        };
      case 'educational':
        return { 
          color: '#3b82f6', 
          label: 'Teaching Portfolio',
          icon: <GraduationCap size={14} />,
          description: 'Education • Curriculum • Training'
        };
      case 'professional':
        return { 
          color: '#059669', 
          label: 'Tech Portfolio',
          icon: <Code size={14} />,
          description: 'Software • Development • Engineering'
        };
      case 'hybrid':
        return { 
          color: '#10b981', 
          label: 'Multi-Portfolio',
          icon: <FolderOpen size={14} />,
          description: 'Creative • Teaching • Professional'
        };
      default:
        return { 
          color: '#666666', 
          label: 'Portfolio',
          icon: <User size={14} />,
          description: 'Professional Portfolio'
        };
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ProtectedRoute>
      <LayoutWrapper>
        {/* Mobile Header */}
        <MobileHeader>
          <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </MobileMenuButton>
          <MobileTitle>Dashboard</MobileTitle>
          {portfolio && (
            <PortfolioIndicator $color={getPortfolioTypeInfo(portfolio.kind).color}>
              <Circle size={8} fill="currentColor" />
            </PortfolioIndicator>
          )}
        </MobileHeader>

        {/* Sidebar */}
        <Sidebar $collapsed={sidebarCollapsed} $mobileOpen={mobileMenuOpen}>
          <SidebarContent>
            {/* Header Section */}
            <SidebarHeader>
              <CollapseButton 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                $collapsed={sidebarCollapsed}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronLeft size={14} />
              </CollapseButton>
              
              {!sidebarCollapsed && (
                <ProfileSection>
                  <UserAvatar>
                    <User size={20} />
                  </UserAvatar>
                  <UserInfo>
                    <UserName>{user?.name || 'User'}</UserName>
                    <UserEmail>{user?.email || user?.role || 'member'}</UserEmail>
                  </UserInfo>
                </ProfileSection>
              )}
            </SidebarHeader>

            {/* Portfolio Status */}
            {!portfolioLoading && (
              <PortfolioSection $collapsed={sidebarCollapsed}>
                {portfolio ? (
                  <PortfolioCard>
                    <PortfolioIndicator $color={getPortfolioTypeInfo(portfolio.kind).color}>
                      <Circle size={6} fill="currentColor" />
                    </PortfolioIndicator>
                    {!sidebarCollapsed && (
                      <PortfolioDetails>
                        <PortfolioStatus>Active Portfolio</PortfolioStatus>
                        <PortfolioType>
                          {getPortfolioTypeInfo(portfolio.kind).icon}
                          <PortfolioInfo>
                            <PortfolioName>
                              {getPortfolioTypeInfo(portfolio.kind).label}
                            </PortfolioName>
                            <PortfolioDesc>
                              {getPortfolioTypeInfo(portfolio.kind).description}
                            </PortfolioDesc>
                          </PortfolioInfo>
                        </PortfolioType>
                      </PortfolioDetails>
                    )}
                  </PortfolioCard>
                ) : (
                  !sidebarCollapsed && (
                    <CreatePortfolioCard>
                      <CreatePortfolioIcon>
                        <Plus size={14} />
                      </CreatePortfolioIcon>
                      <CreatePortfolioContent>
                        <CreatePortfolioTitle>Create Portfolio</CreatePortfolioTitle>
                        <CreatePortfolioSubtitle>Choose your focus</CreatePortfolioSubtitle>
                        <CreatePortfolioButton href="/dashboard/profile">
                          Get Started
                        </CreatePortfolioButton>
                      </CreatePortfolioContent>
                    </CreatePortfolioCard>
                  )
                )}
              </PortfolioSection>
            )}

            {/* Navigation */}
            <NavigationSection>
              <NavList>
                {visibleNavItems.map((item) => (
                  <NavItemWrapper key={item.href}>
                    <NavItemLink
                      href={item.href}
                      $active={pathname === item.href}
                      $collapsed={sidebarCollapsed}
                      title={sidebarCollapsed ? `${item.label} - ${item.description}` : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <NavIcon>{item.icon}</NavIcon>
                      {!sidebarCollapsed && (
                        <NavContent>
                          <NavLabelRow>
                            <NavLabel>{item.label}</NavLabel>
                            {item.badge && <NavBadge>{item.badge}</NavBadge>}
                          </NavLabelRow>
                          <NavDescription>{item.description}</NavDescription>
                        </NavContent>
                      )}
                    </NavItemLink>
                  </NavItemWrapper>
                ))}
              </NavList>
            </NavigationSection>
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter $collapsed={sidebarCollapsed}>
            <FooterButton href="/dashboard/settings">
              <Settings size={16} />
              {!sidebarCollapsed && <span>Settings</span>}
            </FooterButton>
            <LogoutButton onClick={handleLogout}>
              <ArrowLeft size={16} />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </LogoutButton>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Overlay */}
        {mobileMenuOpen && <MobileOverlay onClick={() => setMobileMenuOpen(false)} />}

        {/* Main Content */}
        <MainContent $sidebarCollapsed={sidebarCollapsed}>
          {children}
        </MainContent>
      </LayoutWrapper>
    </ProtectedRoute>
  );
}

// ===========================================
// STYLED COMPONENTS - POLISHED & CONSISTENT
// ===========================================

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.colors.background.primary};
  font-family: ${theme.typography.fonts.body};
`;

const MobileHeader = styled.header`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${theme.colors.background.secondary};
  border-bottom: 1px solid ${theme.colors.border.medium};
  padding: 0 ${theme.spacing.lg};
  align-items: center;
  justify-content: space-between;
  z-index: 50;
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: flex;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${theme.colors.border.medium};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  border-radius: ${theme.borderRadius.xs};
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.background.tertiary};
    border-color: ${theme.colors.primary[600]};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const MobileTitle = styled.h1`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.normal};
  color: ${theme.colors.text.primary};
  margin: 0;
  font-family: ${theme.typography.fonts.display};
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
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: block;
  }
`;

const Sidebar = styled.aside<{ $collapsed: boolean; $mobileOpen: boolean }>`
  width: ${props => props.$collapsed ? '72px' : '280px'};
  background: ${theme.colors.background.secondary};
  border-right: 1px solid ${theme.colors.border.medium};
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  transition: width ${theme.transitions.normal};
  z-index: 45;
  display: flex;
  flex-direction: column;
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 280px;
    transform: ${props => props.$mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    top: 60px;
    height: calc(100vh - 60px);
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.medium};
    border-radius: 3px;
    
    &:hover {
      background: ${theme.colors.border.dark};
    }
  }
`;

const SidebarHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.light};
  position: relative;
  flex-shrink: 0;
`;

const CollapseButton = styled.button<{ $collapsed: boolean }>`
  position: absolute;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.xs};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  transform: ${props => props.$collapsed ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: ${theme.colors.text.secondary};
  
  &:hover {
    background: ${theme.colors.background.secondary};
    border-color: ${theme.colors.primary[600]};
    color: ${theme.colors.text.primary};
    transform: ${props => props.$collapsed ? 'rotate(180deg) translateY(-1px)' : 'rotate(0deg) translateY(-1px)'};
    box-shadow: ${theme.shadows.sm};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 44px;
  height: 44px;
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.secondary};
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.h3`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ${theme.typography.fonts.display};
`;

const UserEmail = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PortfolioSection = styled.div<{ $collapsed: boolean }>`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.light};
  flex-shrink: 0;
`;

const PortfolioCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
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

const PortfolioDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const PortfolioStatus = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
  font-weight: ${theme.typography.weights.medium};
`;

const PortfolioType = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
`;

const PortfolioInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PortfolioName = styled.div`
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.display};
`;

const PortfolioDesc = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  line-height: 1.4;
`;

const CreatePortfolioCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.sm};
`;

const CreatePortfolioIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.xs};
  flex-shrink: 0;
`;

const CreatePortfolioContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CreatePortfolioTitle = styled.div`
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.display};
`;

const CreatePortfolioSubtitle = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
`;

const CreatePortfolioButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.primary};
  text-decoration: none;
  font-weight: ${theme.typography.weights.medium};
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.primary[600]};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.xs};
  transition: all ${theme.transitions.fast};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
  
  &:hover {
    background: ${theme.colors.primary[600]};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const NavigationSection = styled.nav`
  flex: 1;
  padding: ${theme.spacing.lg} 0;
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: 0 ${theme.spacing.md};
`;

const NavItemWrapper = styled.div`
  /* Consistent wrapper for navigation items */
`;

const NavItemLink = styled(Link)<{ $active: boolean; $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  color: ${props => props.$active ? theme.colors.text.primary : theme.colors.text.secondary};
  background: ${props => props.$active ? theme.colors.background.tertiary : 'transparent'};
  border: 1px solid ${props => props.$active ? theme.colors.border.medium : 'transparent'};
  border-radius: ${theme.borderRadius.xs};
  text-decoration: none;
  transition: all ${theme.transitions.fast};
  justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};
  min-height: 44px; /* Consistent touch target */

  &:hover {
    background: ${props => props.$active ? theme.colors.background.tertiary : theme.colors.background.quaternary};
    border-color: ${theme.colors.border.medium};
    color: ${theme.colors.text.primary};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
`;

const NavContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NavLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
`;

const NavLabel = styled.div`
  font-weight: ${theme.typography.weights.medium};
  font-size: ${theme.typography.sizes.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ${theme.typography.fonts.display};
`;

const NavBadge = styled.span`
  font-size: ${theme.typography.sizes.xs};
  padding: 2px ${theme.spacing.xs};
  background: ${theme.colors.accent.blue};
  color: white;
  border-radius: ${theme.borderRadius.xs};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
  font-weight: ${theme.typography.weights.medium};
  flex-shrink: 0;
`;

const NavDescription = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
`;

const SidebarFooter = styled.div<{ $collapsed: boolean }>`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  flex-shrink: 0;
`;

const FooterButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  font-size: ${theme.typography.sizes.sm};
  border: 1px solid transparent;
  border-radius: ${theme.borderRadius.xs};
  transition: all ${theme.transitions.fast};
  min-height: 40px;
  
  &:hover {
    background: ${theme.colors.background.tertiary};
    border-color: ${theme.colors.border.medium};
    color: ${theme.colors.text.primary};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: transparent;
  border: 1px solid ${theme.colors.border.medium};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.sizes.sm};
  border-radius: ${theme.borderRadius.xs};
  transition: all ${theme.transitions.fast};
  cursor: pointer;
  font-family: ${theme.typography.fonts.body};
  min-height: 40px;
  
  &:hover {
    background: ${theme.colors.background.tertiary};
    border-color: ${theme.colors.primary[600]};
    color: ${theme.colors.text.primary};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const MainContent = styled.main<{ $sidebarCollapsed: boolean }>`
  flex: 1;
  margin-left: ${props => props.$sidebarCollapsed ? '72px' : '280px'};
  min-height: 100vh;
  transition: margin-left ${theme.transitions.normal};
  background: ${theme.colors.background.primary};
  
  @media (max-width: ${theme.breakpoints.md}) {
    margin-left: 0;
    padding-top: 60px;
  }
`;