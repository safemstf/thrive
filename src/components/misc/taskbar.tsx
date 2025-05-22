// src/components/Taskbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

export interface NavLink {
  href: string;
  label: string;
}

export const navLinks: NavLink[] = [
  { href: '/thrive', label: 'Thrive' },
  { href: '/writing', label: 'Writing' },
  { href: '/tutoring', label: 'Tutoring' },
  { href: '/projects', label: 'Projects' },
  { href: '/gallery', label: 'Gallery' },
];

// Use styled(Link) to avoid nested <a> and use a transient prop ($active) to prevent React warnings
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

export function Taskbar() {
  const pathname = usePathname();
  return (
    <nav className="taskbar">
      {navLinks.map(link => (
        <NavButton 
          key={link.href}
          href={link.href}
          $active={pathname === link.href}
        >
          {link.label}
        </NavButton>
      ))}
    </nav>
  );
}
