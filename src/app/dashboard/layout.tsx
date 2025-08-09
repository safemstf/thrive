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
  Brush
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
    href: '/dashboard/thrive',
    label: 'Survival of the Fittest',
    icon: <Target size={20} />,
    description: 'Challenges & skill development'
  },
  {
    href: '/dashboard/profile',
    label: 'Portfolio Hub',
    icon: <User size={20} />,
    description: 'Manage your portfolio & profile'
  },
  {
    href: '/dashboard/gallery',
    label: 'Creative Studio',
    icon: <Brush size={20} />,
    description: 'Art, photography & design portfolio',
    requiresPortfolio: true,
    portfolioTypes: ['creative', 'hybrid']
  },
  {
    href: '/dashboard/writing',
    label: 'Teaching Portfolio',
    icon: <GraduationCap size={20} />,
    description: 'Educational content & curriculum',
    requiresPortfolio: true,
    portfolioTypes: ['educational', 'hybrid']
  },
  {
    href: '/dashboard/projects',
    label: 'Tech Portfolio',
    icon: <Code size={20} />,
    description: 'Software projects & development',
    requiresPortfolio: true,
    portfolioTypes: ['professional', 'hybrid']
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
    label: 'Homepage',
    icon: <Home size={20} />,
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
      
      // Show portfolio items based on type
      if (item.portfolioTypes && portfolio) {
        return item.portfolioTypes.includes(portfolio.kind);
      }
      
      // Hide admin items if not admin
      if (item.isAdmin && user?.role !== 'admin') return false;
      
      return true;
    });
  };

  const visibleNavItems = getVisibleNavItems();

  const getPortfolioTypeInfo = (type?: string) => {
    switch (type) {
      case 'creative':
        return { 
          color: '#666', 
          label: 'Creative Portfolio',
          icon: <Brush size={16} />,
          description: 'Art • Photography • Design'
        };
      case 'educational':
        return { 
          color: '#666', 
          label: 'Teaching Portfolio',
          icon: <GraduationCap size={16} />,
          description: 'Education • Curriculum • Training'
        };
      case 'professional':
        return { 
          color: '#666', 
          label: 'Tech Portfolio',
          icon: <Code size={16} />,
          description: 'Software • Development • Engineering'
        };
      case 'hybrid':
        return { 
          color: '#666', 
          label: 'Multi-Portfolio',
          icon: <FolderOpen size={16} />,
          description: 'Creative • Teaching • Professional'
        };
      default:
        return { 
          color: '#666', 
          label: 'Portfolio',
          icon: <User size={16} />,
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
                  <User size={24} />
                </Avatar>
                <UserInfo>
                  <UserName>{user?.name || 'User'}</UserName>
                  <UserEmail>{user?.email || user?.role || 'member'}</UserEmail>
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
                      <PortfolioLabel>Active Portfolio</PortfolioLabel>
                      <PortfolioType>
                        {getPortfolioTypeInfo(portfolio.kind).icon}
                        <PortfolioTypeText>
                          <PortfolioTypeName>
                            {getPortfolioTypeInfo(portfolio.kind).label}
                          </PortfolioTypeName>
                          <PortfolioTypeDesc>
                            {getPortfolioTypeInfo(portfolio.kind).description}
                          </PortfolioTypeDesc>
                        </PortfolioTypeText>
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
                      <PromptTitle>Create Your Portfolio</PromptTitle>
                      <PromptSubtitle>Choose your professional focus</PromptSubtitle>
                      <PromptLink href="/dashboard/profile">Get Started</PromptLink>
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
            <FooterLink href="/dashboard/settings">
              <Settings size={16} />
              {!sidebarCollapsed && 'Settings'}
            </FooterLink>
            <LogoutButton onClick={handleLogout}>
              <ArrowLeft size={16} />
              {!sidebarCollapsed && 'Sign Out'}
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

// Styled Components - matching taskbar aesthetic with clean black/white and blue accents
const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #fafafa;
  font-family: 'Work Sans', sans-serif;
`;

const MobileHeader = styled.header`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 1.5rem;
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
  border: 1px solid #2c2c2c;
  background: none;
  color: #2c2c2c;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
  }
`;

const MobileTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 1px;
`;

const MobilePortfolioIndicator = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  background: ${props => props.$color};
  border-radius: 2px;
`;

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 40;
  backdrop-filter: blur(4px);
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Sidebar = styled.aside<{ $collapsed: boolean; $mobileOpen: boolean }>`
  width: ${props => props.$collapsed ? '80px' : '320px'};
  background: white;
  border-right: 1px solid #e0e0e0;
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
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
`;

const CollapseButton = styled.button<{ $collapsed: boolean }>`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: ${props => props.$collapsed ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: #666;
  
  &:hover {
    background: #f8f8f8;
    border-color: #2c2c2c;
    color: #2c2c2c;
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
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.h3`
  font-size: 1.125rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 0.5px;
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.25px;
`;

const PortfolioStatus = styled.div<{ $collapsed: boolean }>`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const PortfolioInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const PortfolioIndicator = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  background: ${props => props.$color};
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 0.25rem;
`;

const PortfolioDetails = styled.div`
  flex: 1;
`;

const PortfolioLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 300;
  font-family: 'Work Sans', sans-serif;
`;

const PortfolioType = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const PortfolioTypeText = styled.div`
  flex: 1;
`;

const PortfolioTypeName = styled.div`
  font-size: 0.875rem;
  font-weight: 400;
  color: #2c2c2c;
  margin-bottom: 0.25rem;
  font-family: 'Cormorant Garamond', serif;
`;

const PortfolioTypeDesc = styled.div`
  font-size: 0.75rem;
  color: #666;
  line-height: 1.4;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.25px;
`;

const CreatePortfolioPrompt = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
`;

const PromptIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  flex-shrink: 0;
`;

const PromptText = styled.div`
  flex: 1;
`;

const PromptTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 400;
  color: #2c2c2c;
  margin-bottom: 0.25rem;
  font-family: 'Cormorant Garamond', serif;
`;

const PromptSubtitle = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.75rem;
  font-family: 'Work Sans', sans-serif;
`;

const PromptLink = styled(Link)`
  font-size: 0.75rem;
  color: #2c2c2c;
  text-decoration: none;
  font-weight: 300;
  background: white;
  border: 1px solid #2c2c2c;
  padding: 0.5rem 1rem;
  border-radius: 2px;
  display: inline-block;
  transition: all 0.3s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: #2c2c2c;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
  }
`;

const Navigation = styled.nav`
  padding: 1.5rem 0;
  flex: 1;
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 1rem;
`;

const NavItem = styled(Link)<{ $active: boolean; $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: ${props => props.$active ? '#2c2c2c' : '#666'};
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#2c2c2c' : 'transparent'};
  border-radius: 2px;
  text-decoration: none;
  transition: all 0.3s ease;
  justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};
  margin: 0.125rem 0.5rem;

  &:hover {
    background: ${props => props.$active ? 'white' : '#f8f8f8'};
    border-color: ${props => props.$active ? '#2c2c2c' : '#e0e0e0'};
    color: ${props => props.$active ? '#2c2c2c' : '#2c2c2c'};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  font-weight: 400;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Cormorant Garamond', serif;
`;

const NavDescription = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.25px;
`;

const SidebarFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FooterLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  color: #666;
  text-decoration: none;
  font-size: 0.875rem;
  border: 1px solid transparent;
  border-radius: 2px;
  transition: all 0.3s ease;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.25px;
  
  &:hover {
    background: #f8f8f8;
    border-color: #e0e0e0;
    color: #2c2c2c;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: none;
  border: 1px solid #e0e0e0;
  color: #666;
  text-decoration: none;
  font-size: 0.875rem;
  border-radius: 2px;
  transition: all 0.3s ease;
  cursor: pointer;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.25px;
  
  &:hover {
    background: #f8f8f8;
    border-color: #2c2c2c;
    color: #2c2c2c;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const MainContent = styled.main<{ $sidebarCollapsed: boolean }>`
  flex: 1;
  margin-left: ${props => props.$sidebarCollapsed ? '80px' : '320px'};
  min-height: 100vh;
  transition: margin-left 0.3s ease;
  background: #fafafa;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding-top: 64px;
  }
`;