// src/components/Taskbar.tsx - Mobile-Safe with Proper Accessibility
'use client';
import React from 'react';
import Link from 'next/link';
import {
  LogOut, User, Settings, LayoutDashboard,
  X, ArrowLeft, ChevronLeft, ChevronRight,
  Circle, Wifi, WifiOff,
  Menu
} from 'lucide-react';

// Import logic (HODA management removed)
import {
  useTaskbarLogic,
  getPortfolioTypeColor,
  getPortfolioTypeLabel,
  getFirstName,
  type TaskbarProps
} from '@/components/misc/taskbar.logic';

// Import styled components (HODA-related components removed)
import {
  NavContainer, NavButton, UserDropdown, UserButton, DropdownMenu,
  DropdownHeader, UserName, UserRole, UserEmail, DropdownItem, DropdownLink,
  SidebarToggle, MobileNavContainer, MobileNavButton, MobileUserSection,
  MobileUserInfo, MobileUserAvatar, MobileLogoutButton, SidebarOverlay,
  SidebarContainer, SidebarHeader, SidebarSection, SectionTitle, CloseButton,
  UserInfo, UserAvatar, UserDetails, SidebarUserName, SidebarUserEmail,
  StatusBadge, QuickActionsGrid, QuickActionCard, PortfolioCard,
  PortfolioHeader, PortfolioIndicator, PortfolioTitle, PortfolioSubtitle,
  NavList, NavItem, ActionButton,
  RightNavItem,
  RightSidebarContainer,
  RightSidebarHeader,
  RightSidebarNav,
  RightSidebarOverlay,
  RightSidebarTitle
} from '@/components/misc/taskbar.styles';


import { Menu as MobileMenuIcon } from 'lucide-react';


/* ---------- Taskbar component ---------- */
export function Taskbar(props: TaskbarProps) {
  // Get all logic from the hook (HODA management removed)
  const {
    // State
    pathname,
    user,
    dropdownOpen,
    sidebarVisible,

    // Derived state
    isAuthenticated,
    navLinks,

    // Refs
    dropdownRef,
    sidebarRef,

    // Setters
    setDropdownOpen,

    // Event handlers
    handleLogout,
    handleNavLinkClick,
    toggleSidebar,
    closeSidebar,

    // Props
    isMobile,
    isScrolled,
    withSidebar,
    sidebarConfig
  } = useTaskbarLogic(props);

  /* ----------------- Mobile UI ----------------- */
  if (isMobile) {
    return (
      <>
        {/* Fixed Bottom Taskbar */}
        <MobileNavContainer
          data-taskbar
          role="navigation"
          aria-label="Main navigation"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 5000,
            pointerEvents: 'auto',
            touchAction: 'auto',
            isolation: 'isolate',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: 'var(--color-background-secondary)',
            borderTop: '1px solid var(--color-border-light)',
            gap: '0.5rem'
          }}
        >
          {/* Menu Button */}
          <MobileMenuIcon
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </MobileMenuIcon>

          {/* Quick Links */}
          <NavButton
            href="/"
            $active={pathname === '/'}
            onClick={() => handleNavLinkClick('/')}
            style={{ flex: 1, textAlign: 'center', padding: '0.6rem' }}
          >
            Home
          </NavButton>

          {isAuthenticated && (
            <NavButton
              href="/dashboard"
              $active={pathname.startsWith('/dashboard')}
              onClick={() => handleNavLinkClick('/dashboard')}
              style={{ flex: 1, textAlign: 'center', padding: '0.6rem' }}
            >
              Dashboard
            </NavButton>
          )}
        </MobileNavContainer>

        {/* RIGHT SIDEBAR - Navigation Panel */}
        <>
          <RightSidebarOverlay
            $visible={sidebarVisible}
            onClick={closeSidebar}
            className="right-sidebar-overlay"
          />
          <RightSidebarContainer
            $visible={sidebarVisible}
            role="navigation"
            aria-label="Main navigation menu"
            className="right-sidebar-container"
          >
            <CloseButton
              onClick={closeSidebar}
              aria-label="Close navigation menu"
              style={{ display: 'flex' }}
            >
              <X size={18} />
            </CloseButton>

            <RightSidebarHeader>
              <RightSidebarTitle>Navigation</RightSidebarTitle>
            </RightSidebarHeader>

            <RightSidebarNav>
              {navLinks.map(link => {
                if (link.requiresAuth && !isAuthenticated) return null;
                if (link.requiresAdmin && !isAuthenticated) return null;
                if (link.hideWhenAuth && isAuthenticated) return null;

                return (
                  <RightNavItem
                    key={link.href}
                    href={link.href}
                    $active={pathname === link.href}
                    onClick={() => {
                      handleNavLinkClick(link.href);
                      closeSidebar();
                    }}
                  >
                    {link.label}
                  </RightNavItem>
                );
              })}

              {isAuthenticated && user && (
                <>
                  <div style={{
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    margin: '1rem 0',
                    paddingTop: '1rem'
                  }}>
                    <div style={{
                      padding: '0 1.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Account
                    </div>
                    <RightNavItem
                      href="/dashboard"
                      $active={pathname.startsWith('/dashboard')}
                      onClick={() => {
                        handleNavLinkClick('/dashboard');
                        closeSidebar();
                      }}
                    >
                      <User size={20} />
                      Dashboard
                    </RightNavItem>
                    <RightNavItem
                      href="/dashboard/profile"
                      $active={pathname === '/dashboard/profile'}
                      onClick={() => {
                        handleNavLinkClick('/dashboard/profile');
                        closeSidebar();
                      }}
                    >
                      <Settings size={20} />
                      Profile
                    </RightNavItem>
                    <ActionButton
                      onClick={handleLogout}
                      style={{ margin: '0.5rem 0' }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </ActionButton>
                  </div>
                </>
              )}
            </RightSidebarNav>
          </RightSidebarContainer>
        </>
      </>
    );
  }

  /* ----------------- Desktop UI ----------------- */
  return (
    <>
      <NavContainer
        className="taskbar"
        data-taskbar
        role="navigation"
        aria-label="Main navigation"
        $isScrolled={isScrolled}
      >
        {/* Sidebar Toggle */}
        {withSidebar && (
          <SidebarToggle
            $active={sidebarVisible}
            $isScrolled={isScrolled}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarVisible}
          >
            {sidebarVisible ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </SidebarToggle>
        )}

        {/* Navigation Links */}
        {navLinks.map(link => {
          if (link.requiresAuth && !isAuthenticated) return null;
          if (link.requiresAdmin && !isAuthenticated) return null;
          if (link.hideWhenAuth && isAuthenticated) return null;

          return (
            <NavButton
              key={link.href}
              href={link.href}
              $active={pathname === link.href || (link.href === '/dashboard' && pathname.startsWith('/dashboard'))}
              $isScrolled={isScrolled}
              onClick={() => handleNavLinkClick(link.href)}
            >
              {link.label}
            </NavButton>
          );
        })}

        {/* User Dropdown */}
        {isAuthenticated && user && (
          <UserDropdown ref={dropdownRef}>
            <UserButton
              $isScrolled={isScrolled}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <User size={16} />
              {getFirstName(user.name || user.username || 'User')}
            </UserButton>

            <DropdownMenu
              $open={dropdownOpen}
              $isScrolled={isScrolled}
              role="menu"
              aria-label="User menu"
            >
              <DropdownHeader>
                <UserName>{user.name || user.username}</UserName>
                <UserRole>{user.role || 'user'}</UserRole>
                {user.email && <UserEmail>{user.email}</UserEmail>}
              </DropdownHeader>

              <DropdownLink
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                role="menuitem"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </DropdownLink>

              <DropdownLink
                href="/dashboard/profile"
                onClick={() => setDropdownOpen(false)}
                role="menuitem"
              >
                <User size={16} />
                Profile
              </DropdownLink>

              <DropdownLink
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                role="menuitem"
              >
                <Settings size={16} />
                Settings
              </DropdownLink>

              <DropdownItem
                className="logout"
                onClick={handleLogout}
                role="menuitem"
              >
                <LogOut size={16} />
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </UserDropdown>
        )}
      </NavContainer>

      {/* Sidebar */}
      {withSidebar && (
        <>
          <SidebarOverlay
            $visible={sidebarVisible}
            onClick={closeSidebar}
            aria-hidden={!sidebarVisible}
            className="sidebar-overlay"
          />
          <SidebarContainer
            ref={sidebarRef}
            $visible={sidebarVisible}
            role="complementary"
            aria-label="Sidebar navigation"
            className="sidebar-container"
          >
            <CloseButton
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </CloseButton>

            {/* Header Section */}
            <SidebarHeader>
              {sidebarConfig.user && (
                <>
                  <UserInfo>
                    <UserAvatar aria-hidden="true">
                      <User size={20} />
                    </UserAvatar>
                    <UserDetails>
                      <SidebarUserName>{sidebarConfig.user.name}</SidebarUserName>
                      <SidebarUserEmail>{sidebarConfig.user.email}</SidebarUserEmail>
                    </UserDetails>
                  </UserInfo>

                  {sidebarConfig.dataStatus && (
                    <StatusBadge
                      $type={sidebarConfig.dataStatus.type}
                      role="status"
                      aria-label={`Connection status: ${sidebarConfig.dataStatus.label}`}
                    >
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
                    <Link
                      key={action.id}
                      href={action.href}
                      style={{ textDecoration: 'none' }}
                      onClick={closeSidebar}
                    >
                      <QuickActionCard $color={action.color}>
                        <div className="action-icon" aria-hidden="true">{action.icon}</div>
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
                    <PortfolioIndicator
                      $color={getPortfolioTypeColor(sidebarConfig.portfolio.kind)}
                      aria-hidden="true"
                    >
                      <Circle size={6} fill="currentColor" />
                    </PortfolioIndicator>
                    <div>
                      <PortfolioTitle>
                        {getPortfolioTypeLabel(sidebarConfig.portfolio.kind)} Portfolio
                      </PortfolioTitle>
                      <PortfolioSubtitle>Active</PortfolioSubtitle>
                    </div>
                  </PortfolioHeader>

                  <NavList role="navigation" aria-label="Portfolio sections">
                    {sidebarConfig.portfolioSections.map((section) => (
                      <NavItem
                        key={section.id}
                        href={section.href}
                        $active={pathname === section.href}
                        onClick={closeSidebar}
                        aria-current={pathname === section.href ? 'page' : undefined}
                      >
                        <span aria-hidden="true">{section.icon}</span>
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
                <ActionButton
                  onClick={() => {
                    sidebarConfig.onSettingsClick?.();
                    closeSidebar();
                  }}
                  aria-label="Open settings"
                >
                  <Settings size={16} aria-hidden="true" />
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
                  aria-label="Sign out"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Sign Out
                </ActionButton>
              )}
            </SidebarSection>
          </SidebarContainer>
        </>
      )}
    </>
  );
}