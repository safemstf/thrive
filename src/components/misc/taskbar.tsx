// src/components/Taskbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { LogOut, User } from 'lucide-react';

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
  isScrolled?: boolean;
}

// Define navigation links with auth requirements
const getNavLinks = (isAuthenticated: boolean, isAdmin: boolean): NavLink[] => {
  const links: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/thrive', label: 'Thrive' },
    { href: '/simulations', label: 'Simulations' }, 

  ];

  if (isAuthenticated) {
    links.push({ href: '/dashboard', label: 'Dashboard', requiresAuth: true });
  }

  if (!isAuthenticated) {
    links.push({ href: '/login', label: 'Login', hideWhenAuth: true });
  }

  return links;
};

// Desktop Styled components
const NavContainer = styled.nav<{ $isScrolled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isScrolled ? 'flex-start' : 'space-between'};
  flex-wrap: wrap;
  gap: ${props => props.$isScrolled ? '0.4rem' : '0.5rem'};
  max-width: 100%;
  padding-right: 1rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
`;

const NavButton = styled(Link)<{ $active?: boolean; $isScrolled?: boolean }>`
  background: none;
  border: 1px solid #2c2c2c;
  color: ${props => (props.$active ? '#f8f8f8' : '#2c2c2c')};
  background-color: ${props => (props.$active ? '#2c2c2c' : 'transparent')};
  padding: ${props => props.$isScrolled ? '0.6rem 1.2rem' : '0.75rem 1.5rem'};
  font-size: ${props => props.$isScrolled ? '0.9rem' : '1rem'};
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  text-decoration: none;
  display: inline-block;
  white-space: nowrap;
  border-radius: 2px;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    text-decoration: none;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
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

const UserSection = styled.div<{ $isScrolled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isScrolled ? 'flex-start' : 'flex-end'};
  gap: ${props => props.$isScrolled ? '0.5rem' : '0.75rem'};
  margin-left: ${props => props.$isScrolled ? '0.5rem' : '1rem'};
  transition: all 0.3s ease;
`;

const UserInfo = styled.div<{ $isScrolled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-family: 'Work Sans', sans-serif;
  font-size: ${props => props.$isScrolled ? '0.85rem' : '0.9rem'};
  padding: ${props => props.$isScrolled ? '0.4rem 0.8rem' : '0.5rem 1rem'};
  background: #f8f8f8;
  border-radius: 20px;
  transition: all 0.3s ease;

  @media (max-width: 1024px) {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }

  @media (max-width: 840px) {
    span:not(.user-icon) {
      display: none;
    }
    padding: 0.5rem;
    background: transparent;
  }
`;

const UserIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  
  @media (max-width: 840px) {
    width: 28px;
    height: 28px;
    background: #f8f8f8;
    border: 1px solid #e0e0e0;
  }
`;

const LogoutButton = styled.button<{ $isScrolled?: boolean }>`
  background: white;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: ${props => props.$isScrolled ? '0.6rem 1.2rem' : '0.75rem 1.5rem'};
  font-size: ${props => props.$isScrolled ? '0.9rem' : '1rem'};
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 2px;

  &:hover {
    background: #dc2626;
    color: #f8f8f8;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  @media (max-width: 840px) {
    padding: 0.5rem;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    justify-content: center;
    
    span {
      display: none;
    }
  }
`;

// Mobile Styled components
const MobileNavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MobileNavButton = styled(Link)<{ $active?: boolean }>`
  background: white;
  border: 1px solid ${props => (props.$active ? '#2c2c2c' : '#e0e0e0')};
  color: ${props => (props.$active ? '#2c2c2c' : '#666')};
  background-color: ${props => (props.$active ? '#f8f8f8' : 'white')};
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: none;
  font-weight: ${props => (props.$active ? '400' : '300')};
  text-decoration: none;
  display: block;
  text-align: left;
  width: 100%;
  border-radius: 8px;

  &:hover {
    border-color: #2c2c2c;
    background-color: #f8f8f8;
    color: #2c2c2c;
  }
`;

const MobileUserSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
  color: #666;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;
`;

const MobileUserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
`;

const MobileLogoutButton = styled.button`
  background: white;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 300;
  width: 100%;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #dc2626;
    color: white;
  }
`;

export function Taskbar({ isMobile = false, onNavigate, isScrolled = false }: TaskbarProps) {
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
              <MobileUserAvatar>
                <User size={20} color="#666" />
              </MobileUserAvatar>
              <div>
                <div style={{ fontWeight: 400, color: '#2c2c2c' }}>{user.name}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>{user.email}</div>
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

  return (
    <NavContainer className="taskbar" $isScrolled={isScrolled}>
      {navLinks.map(link => {
        if (link.requiresAuth && !isAuthenticated) return null;
        if (link.requiresAdmin && !isAdmin) return null;
        if (link.hideWhenAuth && isAuthenticated) return null;

        return (
          <NavButton 
            key={link.href}
            href={link.href}
            $active={pathname === link.href || (link.href === '/dashboard' && pathname.startsWith('/dashboard'))}
            $isScrolled={isScrolled}
          >
            {link.label}
          </NavButton>
        );
      })}
      
      {isAuthenticated && user && (
        <UserSection $isScrolled={isScrolled}>
          <UserInfo $isScrolled={isScrolled}>
            <UserIcon className="user-icon">
              <User size={16} color="#666" />
            </UserIcon>
            <span>{user.name}</span>
          </UserInfo>
          <LogoutButton onClick={handleLogout} $isScrolled={isScrolled}>
            <LogOut size={16} />
            <span>Logout</span>
          </LogoutButton>
        </UserSection>
      )}
    </NavContainer>
  );
}