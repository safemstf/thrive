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

// Styled components
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

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    text-decoration: none;
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

  &:hover {
    background: #dc2626;
    color: #f8f8f8;
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
`;

export function Taskbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const navLinks = getNavLinks(isAuthenticated, isAdmin);

  // Debug logging
  console.log('Taskbar Debug:', {
    user,
    userRole: user?.role,
    isAuthenticated,
    isAdmin,
    loading
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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