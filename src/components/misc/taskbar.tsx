// src/components/Taskbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/providers/authProvider';

export interface NavLink {
  href: string;
  label: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  hideWhenAuth?: boolean;
}

interface TaskbarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

// Define navigation links with auth requirements
const getNavLinks = (isAuthenticated: boolean, isAdmin: boolean): NavLink[] => {
  const links: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/thrive', label: 'Thrive' },
  ];

  if (isAuthenticated) {
    // Authenticated user links
    links.push({ href: '/dashboard', label: 'Dashboard', requiresAuth: true });
    
    if (isAdmin) {
      // Admin-only links
      links.push({ href: '/api-test', label: 'API Test', requiresAuth: true, requiresAdmin: true });
    }
  }

  // Login shows for non-authenticated users
  if (!isAuthenticated) {
    links.push({ href: '/login', label: 'Login', hideWhenAuth: true });
  }

  return links;
};

// Desktop Styled components
const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const NavButton = styled(Link)<{ $active?: boolean }>`
  background: none;
  border: 1px solid #2c2c2c;
  color: ${props => (props.$active ? '#f8f8f8' : '#2c2c2c')};
  background-color: ${props => (props.$active ? '#2c2c2c' : 'transparent')};
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  text-decoration: none;
  display: inline-block;
  white-space: nowrap;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    text-decoration: none;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(44, 44, 44, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  @media (max-width: 840px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  margin-left: auto;
  white-space: nowrap;

  &:hover {
    background: #dc2626;
    color: #f8f8f8;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    margin-left: 0.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  color: #666;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;

  @media (max-width: 1024px) {
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  @media (max-width: 840px) {
    span {
      display: none;
    }
  }
`;

// Mobile Styled components
const MobileNavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MobileNavButton = styled(Link)<{ $active?: boolean }>`
  background: none;
  border: 1px solid #2c2c2c;
  color: ${props => (props.$active ? '#f8f8f8' : '#2c2c2c')};
  background-color: ${props => (props.$active ? '#2c2c2c' : 'transparent')};
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  text-decoration: none;
  display: block;
  text-align: center;
  width: 100%;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    text-decoration: none;
  }
`;

const MobileUserSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MobileUserInfo = styled.div`
  color: #666;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
`;

const MobileLogoutButton = styled.button`
  background: none;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  width: 100%;

  &:hover {
    background: #dc2626;
    color: #f8f8f8;
  }
`;

export function Taskbar({ isMobile = false, onNavigate }: TaskbarProps) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const navLinks = getNavLinks(isAuthenticated, isAdmin);

  const handleLogout = async () => {
    try {
      await logout();
      if (onNavigate) onNavigate();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  if (isMobile) {
    return (
      <MobileNavContainer>
        {navLinks.map(link => {
          // Skip rendering if auth requirements aren't met
          if (link.requiresAuth && !isAuthenticated) return null;
          if (link.requiresAdmin && !isAdmin) return null;
          if (link.hideWhenAuth && isAuthenticated) return null;

          return (
            <MobileNavButton 
              key={link.href}
              href={link.href}
              $active={pathname === link.href || (link.href === '/dashboard' && pathname.startsWith('/dashboard'))}
              onClick={handleNavClick}
            >
              {link.label}
            </MobileNavButton>
          );
        })}
        
        {isAuthenticated && user && (
          <MobileUserSection>
            <MobileUserInfo>
              Welcome, {user.name}
            </MobileUserInfo>
            <MobileLogoutButton onClick={handleLogout}>
              Logout
            </MobileLogoutButton>
          </MobileUserSection>
        )}
      </MobileNavContainer>
    );
  }

  return (
    <NavContainer className="taskbar">
      {navLinks.map(link => {
        // Skip rendering if auth requirements aren't met
        if (link.requiresAuth && !isAuthenticated) return null;
        if (link.requiresAdmin && !isAdmin) return null;
        if (link.hideWhenAuth && isAuthenticated) return null;

        return (
          <NavButton 
            key={link.href}
            href={link.href}
            $active={pathname === link.href || (link.href === '/dashboard' && pathname.startsWith('/dashboard'))}
          >
            {link.label}
          </NavButton>
        );
      })}
      
      {isAuthenticated && user && (
        <UserInfo>
          <span>Welcome, {user.name}</span>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserInfo>
      )}
    </NavContainer>
  );
}