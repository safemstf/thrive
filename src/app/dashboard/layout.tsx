// src/app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { useAuth } from '@/providers/authProvider';
import { useApiClient } from '@/lib/api-client';
import type { Portfolio } from '@/types/portfolio.types';
import { 
  User, 
  Home,
  Settings,
  Shield,
  Palette,
  BarChart3,
  ChevronLeft,
  Menu,
  X,
  Plus,
  LogOut,
  BookOpen,
  Image as GalleryIcon,
  FolderOpen,
  GraduationCap
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  requiresPortfolio?: boolean;
  portfolioTypes?: string[];
  isAdmin?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: <Home size={20} />,
    description: 'Dashboard home'
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: <User size={20} />,
    description: 'Your profile & settings'
  },
  {
    href: '/dashboard/gallery',
    label: 'Gallery',
    icon: <GalleryIcon size={20} />,
    description: 'Manage your artwork',
    requiresPortfolio: true,
    portfolioTypes: ['creative', 'hybrid']
  },
  {
    href: '/dashboard/writing',
    label: 'Learning',
    icon: <BookOpen size={20} />,
    description: 'Educational content',
    requiresPortfolio: true,
    portfolioTypes: ['educational', 'hybrid']
  },
  {
    href: '/dashboard/projects',
    label: 'Projects',
    icon: <FolderOpen size={20} />,
    description: 'CS & creative projects'
  },
  {
    href: '/dashboard/tutoring',
    label: 'Tutoring',
    icon: <GraduationCap size={20} />,
    description: 'Tutoring services'
  },
  {
    href: '/dashboard/api-test',
    label: 'Admin Panel',
    icon: <Shield size={20} />,
    description: 'System administration',
    isAdmin: true
  },
   {
    href: '/',
    label: 'homepage',
    icon: <Home size={20} />,
    description: 'Home'
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
        // No portfolio exists, which is fine
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
      // Hide portfolio-required items if no portfolio
      if (item.requiresPortfolio && !portfolio) return false;
      
      // Hide admin items if not admin
      if (item.isAdmin && user?.role !== 'admin') return false;
      
      return true;
    });
  };

  const visibleNavItems = getVisibleNavItems();

  const getPortfolioTypeInfo = (type?: string) => {
    switch (type) {
      case 'creative':
        return { color: '#8b5cf6', label: 'Creative' };
      case 'educational':
        return { color: '#3b82f6', label: 'Educational' };
      case 'hybrid':
        return { color: '#10b981', label: 'Hybrid' };
      default:
        return { color: '#6b7280', label: 'Portfolio' };
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Optionally redirect or let auth provider handle it
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
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
          <MobileTitle>Dashboard</MobileTitle>
          {portfolio && (
            <MobilePortfolioIndicator $color={getPortfolioTypeInfo(portfolio.kind).color} />
          )}
        </MobileHeader>

        {/* Sidebar */}
        <Sidebar $collapsed={sidebarCollapsed} $mobileOpen={mobileMenuOpen}>
          <SidebarHeader>
            <CollapseButton 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              $collapsed={sidebarCollapsed}
            >
              <ChevronLeft size={16} />
            </CollapseButton>
            
            {!sidebarCollapsed && (
              <ProfileSection>
                <Avatar>
                  <User size={28} />
                </Avatar>
                <UserInfo>
                  <UserName>{user?.name || 'User'}</UserName>
                  <UserRole>{user?.role || 'member'}</UserRole>
                </UserInfo>
              </ProfileSection>
            )}
          </SidebarHeader>

          {/* Portfolio Status */}
          {!portfolioLoading && (
            <PortfolioStatus $collapsed={sidebarCollapsed}>
              {portfolio ? (
                <PortfolioInfo>
                  <PortfolioIndicator $color={getPortfolioTypeInfo(portfolio.kind).color} />
                  {!sidebarCollapsed && (
                    <PortfolioDetails>
                      <PortfolioLabel>Portfolio</PortfolioLabel>
                      <PortfolioType>
                        <Palette size={14} />
                        {getPortfolioTypeInfo(portfolio.kind).label}
                      </PortfolioType>
                    </PortfolioDetails>
                  )}
                </PortfolioInfo>
              ) : (
                !sidebarCollapsed && (
                  <CreatePortfolioPrompt>
                    <PromptIcon>
                      <Plus size={16} />
                    </PromptIcon>
                    <PromptText>
                      <PromptTitle>No Portfolio</PromptTitle>
                      <PromptLink href="/dashboard/profile">Create one</PromptLink>
                    </PromptText>
                  </CreatePortfolioPrompt>
                )
              )}
            </PortfolioStatus>
          )}

          {/* Navigation */}
          <Navigation>
            <NavList>
              {visibleNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  $active={pathname === item.href}
                  $collapsed={sidebarCollapsed}
                  title={sidebarCollapsed ? `${item.label} - ${item.description}` : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <NavIcon>{item.icon}</NavIcon>
                  {!sidebarCollapsed && (
                    <NavContent>
                      <NavLabel>{item.label}</NavLabel>
                      <NavDescription>{item.description}</NavDescription>
                    </NavContent>
                  )}
                </NavItem>
              ))}
            </NavList>
          </Navigation>

          {/* Sidebar Footer */}
          <SidebarFooter>
            <FooterLink href="/dashboard/profile">
              <Settings size={16} />
              {!sidebarCollapsed && 'Settings'}
            </FooterLink>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={16} />
              {!sidebarCollapsed && 'Logout'}
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

// Styled Components
const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

const MobileHeader = styled.header`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 1rem;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: #374151;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const MobileTitle = styled.h1`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const MobilePortfolioIndicator = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  background: ${props => props.$color};
  border-radius: 50%;
`;

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Sidebar = styled.aside<{ $collapsed: boolean; $mobileOpen: boolean }>`
  width: ${props => props.$collapsed ? '80px' : '280px'};
  background: white;
  border-right: 1px solid #e5e7eb;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s ease;
  z-index: 45;
  
  @media (max-width: 768px) {
    width: 280px;
    transform: ${props => props.$mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    top: 64px;
    height: calc(100vh - 64px);
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
`;

const CollapseButton = styled.button<{ $collapsed: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  transform: ${props => props.$collapsed ? 'rotate(180deg)' : 'rotate(0deg)'};
  
  &:hover {
    background: #e5e7eb;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserRole = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  text-transform: capitalize;
`;

const PortfolioStatus = styled.div<{ $collapsed: boolean }>`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const PortfolioInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PortfolioIndicator = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  background: ${props => props.$color};
  border-radius: 50%;
  flex-shrink: 0;
`;

const PortfolioDetails = styled.div`
  flex: 1;
`;

const PortfolioLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PortfolioType = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const CreatePortfolioPrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
`;

const PromptIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  flex-shrink: 0;
`;

const PromptText = styled.div`
  flex: 1;
`;

const PromptTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
`;

const PromptLink = styled(Link)`
  font-size: 0.75rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #2563eb;
  }
`;

const Navigation = styled.nav`
  padding: 1rem 0;
  flex: 1;
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
`;

const NavItem = styled(Link)<{ $active: boolean; $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  background: ${props => props.$active ? '#eff6ff' : 'transparent'};
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid ${props => props.$active ? '#3b82f6' : 'transparent'};
  margin-left: -1rem;
  padding-left: ${props => props.$collapsed ? '1.5rem' : '1.75rem'};
  justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};

  &:hover {
    background: ${props => props.$active ? '#eff6ff' : '#f9fafb'};
    color: ${props => props.$active ? '#3b82f6' : '#374151'};
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NavContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NavLabel = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NavDescription = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SidebarFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FooterLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: 1px solid #dc2626;
  color: #dc2626;
  text-decoration: none;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    background: #dc2626;
    color: white;
  }
`;

const MainContent = styled.main<{ $sidebarCollapsed: boolean }>`
  flex: 1;
  margin-left: ${props => props.$sidebarCollapsed ? '80px' : '280px'};
  min-height: 100vh;
  transition: margin-left 0.3s ease;
  
  /* Account for the sticky header */
  padding-top: 0;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding-top: 64px; /* Mobile header height */
  }
`;