// src/app/dashboard/layout.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { useAuth } from '@/providers/authProvider';
import { 
  User, 
  BookOpen, 
  FolderOpen, 
  Image, 
  GraduationCap,
  Home,
  Shield
} from 'lucide-react';

interface DashboardNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const dashboardNavItems: DashboardNavItem[] = [
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
    icon: <Image size={20} />,
    description: 'Your portfolio gallery'
  },
  {
    href: '/dashboard/writing',
    label: 'Curriculum',
    icon: <BookOpen size={20} />,
    description: 'Educational content'
  },
  {
    href: '/dashboard/projects',
    label: 'CS Projects',
    icon: <FolderOpen size={20} />,
    description: 'Computer Science projects'
  },
  {
    href: '/dashboard/tutoring',
    label: 'Tutoring',
    icon: <GraduationCap size={20} />,
    description: 'Tutoring services'
  }
];

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background: #f8f8f8;
  display: flex;
`;

const Sidebar = styled.aside`
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 2rem 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ProfileSection = styled.div`
  padding: 0 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  background: #2c2c2c;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
`;

const UserName = styled.h3`
  font-family: 'Work Sans', sans-serif;
  color: #2c2c2c;
  margin: 0 0 0.25rem;
`;

const UserRole = styled.p`
  color: #666;
  font-size: 0.875rem;
  margin: 0;
  text-transform: capitalize;
`;

const NavList = styled.nav`
  padding: 1rem 0;
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: ${props => props.$active ? '#2c2c2c' : '#666'};
  background: ${props => props.$active ? '#f3f4f6' : 'transparent'};
  border-left: 3px solid ${props => props.$active ? '#2c2c2c' : 'transparent'};
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;

  &:hover {
    background: #f3f4f6;
    color: #2c2c2c;
  }

  svg {
    flex-shrink: 0;
  }
`;

const NavLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const NavTitle = styled.span`
  font-weight: 500;
`;

const NavDescription = styled.span`
  font-size: 0.75rem;
  opacity: 0.8;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MobileNav = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem;
    gap: 0.5rem;
    overflow-x: auto;
    position: sticky;
    top: 0;
    z-index: 10;
  }
`;

const MobileNavButton = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.$active ? '#2c2c2c' : '#f3f4f6'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.875rem;
  white-space: nowrap;
  font-family: 'Work Sans', sans-serif;
`;

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Filter nav items based on user role
  const navItems = user?.role === 'admin' 
    ? [...dashboardNavItems, {
        href: '/api-test',
        label: 'API Test',
        icon: <Shield size={20} />,
        description: 'Test API endpoints'
      }]
    : dashboardNavItems;

  return (
    <ProtectedRoute>
      <LayoutWrapper>
        <Sidebar>
          <ProfileSection>
            <Avatar>
              <User size={40} />
            </Avatar>
            <UserName>{user?.name || 'User'}</UserName>
            <UserRole>{user?.role || 'member'}</UserRole>
          </ProfileSection>

          <NavList>
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                $active={pathname === item.href}
              >
                {item.icon}
                <NavLabel>
                  <NavTitle>{item.label}</NavTitle>
                  <NavDescription>{item.description}</NavDescription>
                </NavLabel>
              </NavItem>
            ))}
          </NavList>
        </Sidebar>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MobileNav>
            {navItems.map((item) => (
              <MobileNavButton
                key={item.href}
                href={item.href}
                $active={pathname === item.href}
              >
                {item.icon}
                <span>{item.label}</span>
              </MobileNavButton>
            ))}
          </MobileNav>

          <MainContent>
            {children}
          </MainContent>
        </div>
      </LayoutWrapper>
    </ProtectedRoute>
  );
}