// src/components/Taskbar.tsx - HODA REMOVED
'use client';
import React from 'react';
import Link from 'next/link';
import {
  LogOut, User, Settings, LayoutDashboard,
  X, ArrowLeft, ChevronLeft, ChevronRight,
  Circle, Wifi, WifiOff
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
  NavList, NavItem, ActionButton
} from '@/components/misc/taskbar.styles';

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
      <MobileNavContainer>
        {navLinks.map(link => {
          if (link.requiresAuth && !isAuthenticated) return null;
          if (link.requiresAdmin && !isAuthenticated) return null;
          if (link.hideWhenAuth && isAuthenticated) return null;

          return (
            <MobileNavButton
              key={link.href}
              href={link.href}
              $active={pathname === link.href || (link.href === '/dashboard' && pathname.startsWith('/dashboard'))}
              onClick={() => handleNavLinkClick(link.href)}
            >
              {link.label}
            </MobileNavButton>
          );
        })}

        {isAuthenticated && (
          <MobileNavButton
            href="/dashboard"
            $active={pathname.startsWith('/dashboard')}
            onClick={() => handleNavLinkClick('/dashboard')}
          >
            Dashboard
          </MobileNavButton>
        )}

        {isAuthenticated && user && (
          <MobileUserSection>
            <MobileUserInfo>
              <MobileUserAvatar>
                <User size={20} color="var(--color-text-secondary)" />
              </MobileUserAvatar>
              <div>
                <div style={{ fontWeight: 400, color: 'var(--color-text-primary)' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                  {user.email}
                </div>
              </div>
            </MobileUserInfo>
            <MobileLogoutButton onClick={handleLogout}>
              <LogOut size={16} />
              Sign Out
            </MobileLogoutButton>
          </MobileUserSection>
        )}
      </MobileNavContainer>
    );
  }

  /* ----------------- Desktop UI ----------------- */
  return (
    <>
      <NavContainer className="taskbar" $isScrolled={isScrolled}>
        {/* Sidebar Toggle */}
        {withSidebar && (
          <SidebarToggle
            $active={sidebarVisible}
            $isScrolled={isScrolled}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
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
            >
              <User size={16} />
              {getFirstName(user.name || user.username || 'User')}
            </UserButton>

            <DropdownMenu $open={dropdownOpen} $isScrolled={isScrolled}>
              <DropdownHeader>
                <UserName>{user.name || user.username}</UserName>
                <UserRole>{user.role || 'user'}</UserRole>
                {user.email && <UserEmail>{user.email}</UserEmail>}
              </DropdownHeader>

              <DropdownLink href="/dashboard" onClick={() => setDropdownOpen(false)}>
                <LayoutDashboard size={16} />
                Dashboard
              </DropdownLink>

              <DropdownLink href="/dashboard/profile" onClick={() => setDropdownOpen(false)}>
                <User size={16} />
                Profile
              </DropdownLink>

              <DropdownLink href="/dashboard/settings" onClick={() => setDropdownOpen(false)}>
                <Settings size={16} />
                Settings
              </DropdownLink>

              <DropdownItem className="logout" onClick={handleLogout}>
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
                      <SidebarUserName>{sidebarConfig.user.name}</SidebarUserName>
                      <SidebarUserEmail>{sidebarConfig.user.email}</SidebarUserEmail>
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
    </>
  );
}