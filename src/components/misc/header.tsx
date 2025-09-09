// src/components/misc/header.tsx - HODA REMOVED
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import {
  Menu, X, User, Settings, ArrowLeft,
  Code, Brush, Circle, Wifi, WifiOff,
  BookOpen, ChevronLeft, ChevronRight,
  FileText, Mail
} from 'lucide-react';
import logoLight from '../../../public/assets/logo3.png';
import { Taskbar } from './taskbar';

// ============================================
// TYPES
// ============================================
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

interface PortfolioSection {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  types: string[];
}

interface SidebarConfig {
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  portfolio?: {
    kind: string;
    title?: string;
  };
  quickActions?: QuickAction[];
  portfolioSections?: PortfolioSection[];
  dataStatus?: {
    type: 'dev' | 'offline' | 'live';
    label: string;
  };
  onLogout?: () => void;
  onSettingsClick?: () => void;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  withSidebar?: boolean;
  sidebarConfig?: SidebarConfig;
}

// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(4px);
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

const slideInFromBottom = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ============================================
// HOOKS
// ============================================
const useOptimizedScroll = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const scrollingDown = scrollY > lastScrollY.current;
      
      // Header becomes "scrolled" after 20px
      setIsScrolled(scrollY > 20);
      
      // Always visible on desktop, hide on scroll down for mobile
      if (window.innerWidth <= 768) {
        if (scrollingDown && scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollState);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isScrolled, isVisible };
};

// ============================================
// STYLED COMPONENTS
// ============================================
const HeaderWrapper = styled.div`
  position: relative;
`;

const HeaderContainer = styled.header<{ $scrolled: boolean; $visible: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1001;
  
  transform: translateY(${props => props.$visible ? '0' : '-100%'});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  background: ${props => props.$scrolled
    ? 'rgba(255, 255, 255, 0.95)'
    : '#ffffff'
  };
  
  backdrop-filter: ${props => props.$scrolled ? 'blur(12px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$scrolled ? 'blur(12px)' : 'none'};
  
  border-bottom: 1px solid ${props => props.$scrolled 
    ? 'rgba(0, 0, 0, 0.08)' 
    : 'rgba(0, 0, 0, 0.05)'
  };
  
  box-shadow: ${props => props.$scrolled
    ? '0 4px 20px rgba(0, 0, 0, 0.08)'
    : 'none'
  };
`;

const HeaderContent = styled.div<{ $scrolled: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.$scrolled ? '0.75rem 1rem' : '1.25rem 1rem'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  transition: padding 0.3s ease;

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
`;

const LogoSection = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &:hover { 
    transform: translateY(-1px);
  }
`;

const LogoImageContainer = styled.div<{ $scrolled: boolean }>`
  width: ${props => props.$scrolled ? '56px' : '72px'};
  height: ${props => props.$scrolled ? '56px' : '72px'};
  transition: all 0.2s ease;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`;

const BrandText = styled.div<{ $scrolled: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;

  @media (max-width: 640px) {
    display: ${props => (props.$scrolled ? 'none' : 'flex')};
  }
`;

const BrandTitle = styled.span<{ $scrolled: boolean }>`
  font-size: ${props => (props.$scrolled ? '1.25rem' : '1.6rem')};
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.5px;
  transition: font-size 0.2s ease;

  @media (max-width: 768px) {
    font-size: ${props => (props.$scrolled ? '1.1rem' : '1.4rem')};
  }
`;

const BrandSubtitle = styled.p<{ $scrolled: boolean }>`
  font-size: ${props => (props.$scrolled ? '0.8rem' : '0.9rem')};
  color: #666666;
  margin: 0;
  transition: font-size 0.2s ease;
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarToggle = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
    : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.$active ? 'white' : '#666666'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active
      ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
      : 'rgba(0, 0, 0, 0.08)'};
    transform: scale(1.02);
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  color: #666666;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }
`;

// ============================================
// SIDEBAR COMPONENTS
// ============================================
const SidebarOverlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1002;
  opacity: ${props => props.$visible ? 1 : 0};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  transition: opacity 0.2s ease;
  backdrop-filter: blur(4px);

  @media (min-width: 1025px) {
    display: none;
  }
`;

const SidebarContainer = styled.aside<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  z-index: 1003;
  
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
  
  transform: translateX(${props => props.$visible ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.03));
`;

const SidebarSection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
    margin-top: auto;
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 1rem 0;
  opacity: 0.8;
`;

const CloseButton = styled.button`
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 0.5rem;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: #666666;
  opacity: 0.8;
`;

const StatusBadge = styled.span<{ $type: 'dev' | 'offline' | 'live' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${props => {
    switch (props.$type) {
      case 'dev': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case 'offline': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'live': return 'linear-gradient(135deg, #10b981, #059669)';
    }
  }};
  color: white;
  box-shadow: 0 2px 8px ${props => {
    switch (props.$type) {
      case 'dev': return 'rgba(139, 92, 246, 0.3)';
      case 'offline': return 'rgba(239, 68, 68, 0.3)';
      case 'live': return 'rgba(16, 185, 129, 0.3)';
    }
  }};
  
  svg {
    animation: ${pulse} 2s ease infinite;
  }
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`;

const QuickActionCard = styled.button<{ $color: string }>`
  background: linear-gradient(135deg, 
    ${props => `${props.$color}08`}, 
    ${props => `${props.$color}03`}
  );
  border: 1px solid ${props => `${props.$color}15`};
  border-radius: 12px;
  padding: 1rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: #1a1a1a;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: ${props => `${props.$color}30`};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => `${props.$color}12`};
  }
  
  .action-icon {
    width: 20px;
    height: 20px;
    color: ${props => props.$color};
    margin-bottom: 0.5rem;
  }
  
  .action-title {
    font-size: 0.8rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
  }
  
  .action-desc {
    font-size: 0.7rem;
    color: #666666;
    margin: 0;
    opacity: 0.8;
    line-height: 1.3;
  }
`;

const PortfolioCard = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, 
    ${props => `${props.$color}08`}, 
    ${props => `${props.$color}03`}
  );
  border: 1px solid ${props => `${props.$color}15`};
  border-radius: 12px;
  padding: 1rem;
`;

const PortfolioHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const PortfolioIndicator = styled.span<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${p => p.$color ? `${p.$color}15` : 'rgba(0, 0, 0, 0.05)'};
  color: ${p => p.$color ?? '#666666'};
`;

const PortfolioTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
`;

const PortfolioSubtitle = styled.div`
  font-size: 0.7rem;
  color: #666666;
  opacity: 0.7;
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  color: ${props => props.$active ? '#1a1a1a' : '#666666'};
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.08)' : 'transparent'};
  
  &:hover {
    background: rgba(59, 130, 246, 0.06);
    color: #1a1a1a;
    transform: translateX(4px);
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666666;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.15);
    color: #1a1a1a;
    transform: translateY(-1px);
  }
  
  &.logout {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.15);
    margin-top: 0.5rem;
    
    &:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.08));
      border-color: rgba(239, 68, 68, 0.25);
    }
  }
  
  svg {
    flex-shrink: 0;
  }
`;

// ============================================
// HELPER FUNCTIONS
// ============================================
const getPortfolioTypeColor = (type?: string): string => {
  const types: Record<string, string> = {
    creative: '#8b5cf6',
    educational: '#3b82f6',
    professional: '#059669',
    hybrid: '#10b981'
  };
  return types[type || ''] || '#666666';
};

const getPortfolioTypeLabel = (type?: string): string => {
  const types: Record<string, string> = {
    creative: 'Creative',
    educational: 'Teaching',
    professional: 'Tech',
    hybrid: 'Multi-Faceted'
  };
  return types[type || ''] || 'Portfolio';
};

// ============================================
// MAIN COMPONENT
// ============================================
export function Header({
  title,
  subtitle,
  withSidebar = false,
  sidebarConfig = {}
}: HeaderProps) {
  const { isScrolled, isVisible } = useOptimizedScroll();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarVisible(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Only for desktop sidebar
      if (window.innerWidth > 1024 && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node)) {
        setSidebarVisible(false);
      }
    };

    if (sidebarVisible) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      
      // Only lock scroll on mobile
      if (window.innerWidth <= 1024) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [sidebarVisible]);

  const toggleSidebar = () => setSidebarVisible(prev => !prev);
  const closeSidebar = () => setSidebarVisible(false);

  return (
    <HeaderWrapper>
      <HeaderContainer $scrolled={isScrolled} $visible={isVisible}>
        <HeaderContent $scrolled={isScrolled}>
          {/* Left Section with Logo */}
          <LeftSection>
            <LogoSection href="/" aria-label="Go to homepage">
              <LogoImageContainer $scrolled={isScrolled}>
                <Image
                  src={logoLight}
                  alt="Logo"
                  sizes="72px"
                  priority
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.2s ease'
                  }}
                  onLoad={() => setImageLoaded(true)}
                />
              </LogoImageContainer>
              <BrandText $scrolled={isScrolled}>
                <BrandTitle $scrolled={isScrolled}>
                  {title}
                </BrandTitle>
                {subtitle && (
                  <BrandSubtitle $scrolled={isScrolled}>
                    {subtitle}
                  </BrandSubtitle>
                )}
              </BrandText>
            </LogoSection>
          </LeftSection>

          {/* Desktop Actions */}
          <DesktopNav>
            {withSidebar && (
              <SidebarToggle
                $active={sidebarVisible}
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                {sidebarVisible ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </SidebarToggle>
            )}
            <Taskbar isScrolled={isScrolled} />
          </DesktopNav>

          {/* Mobile Menu Button */}
          <MobileMenuButton
            onClick={toggleSidebar}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </MobileMenuButton>
        </HeaderContent>
      </HeaderContainer>

      {/* Sidebar */}
      {withSidebar && (
        <>
          <SidebarOverlay $visible={sidebarVisible} onClick={closeSidebar} />
          <SidebarContainer ref={sidebarRef} $visible={sidebarVisible}>
            <CloseButton onClick={closeSidebar}>
              <X size={18} />
            </CloseButton>

            {/* Header Section */}
            <SidebarHeader>
              {sidebarConfig.user && (
                <>
                  <UserInfo>
                    <UserAvatar>
                      <User size={20} />
                    </UserAvatar>
                    <UserDetails>
                      <UserName>{sidebarConfig.user.name}</UserName>
                      <UserEmail>{sidebarConfig.user.email}</UserEmail>
                    </UserDetails>
                  </UserInfo>

                  {sidebarConfig.dataStatus && (
                    <StatusBadge $type={sidebarConfig.dataStatus.type}>
                      {sidebarConfig.dataStatus.type === 'live' ? <Wifi size={8} /> : <WifiOff size={8} />}
                      {sidebarConfig.dataStatus.label}
                    </StatusBadge>
                  )}
                </>
              )}
            </SidebarHeader>

            {/* Quick Actions */}
            {sidebarConfig.quickActions && sidebarConfig.quickActions.length > 0 && (
              <SidebarSection>
                <SectionTitle>Quick Actions</SectionTitle>
                <QuickActionsGrid>
                  {sidebarConfig.quickActions.map((action) => (
                    <Link key={action.id} href={action.href} style={{ textDecoration: 'none' }}>
                      <QuickActionCard $color={action.color} onClick={closeSidebar}>
                        <div className="action-icon">{action.icon}</div>
                        <h4 className="action-title">{action.title}</h4>
                        <p className="action-desc">{action.description}</p>
                      </QuickActionCard>
                    </Link>
                  ))}
                </QuickActionsGrid>
              </SidebarSection>
            )}

            {/* Portfolio Section */}
            {sidebarConfig.portfolio && sidebarConfig.portfolioSections && (
              <SidebarSection>
                <SectionTitle>Portfolio</SectionTitle>
                <PortfolioCard $color={getPortfolioTypeColor(sidebarConfig.portfolio.kind)}>
                  <PortfolioHeader>
                    <PortfolioIndicator $color={getPortfolioTypeColor(sidebarConfig.portfolio.kind)}>
                      <Circle size={6} fill="currentColor" />
                    </PortfolioIndicator>
                    <div>
                      <PortfolioTitle>
                        {getPortfolioTypeLabel(sidebarConfig.portfolio.kind)} Portfolio
                      </PortfolioTitle>
                      <PortfolioSubtitle>Active</PortfolioSubtitle>
                    </div>
                  </PortfolioHeader>

                  <NavList>
                    {sidebarConfig.portfolioSections.map((section) => (
                      <NavItem
                        key={section.id}
                        href={section.href}
                        $active={pathname === section.href}
                        onClick={closeSidebar}
                      >
                        {section.icon}
                        {section.title}
                      </NavItem>
                    ))}
                  </NavList>
                </PortfolioCard>
              </SidebarSection>
            )}

            {/* Footer Actions */}
            <SidebarSection>
              {sidebarConfig.onSettingsClick && (
                <ActionButton onClick={() => {
                  sidebarConfig.onSettingsClick?.();
                  closeSidebar();
                }}>
                  <Settings size={16} />
                  Settings
                </ActionButton>
              )}

              {sidebarConfig.onLogout && (
                <ActionButton
                  className="logout"
                  onClick={() => {
                    sidebarConfig.onLogout?.();
                    closeSidebar();
                  }}
                >
                  <ArrowLeft size={16} />
                  Sign Out
                </ActionButton>
              )}
            </SidebarSection>
          </SidebarContainer>
        </>
      )}
    </HeaderWrapper>
  );
}

export default Header;